import "server-only";

import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import path from "node:path";

/** Bump whenever the shape below changes; a mismatched file is rebuilt from seed. */
const SCHEMA_VERSION = 2;

const TABLES = ["meta", "prompt_revisions", "prompts", "prompts_fts"];

const SCHEMA = /* sql */ `
CREATE TABLE IF NOT EXISTS meta (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS prompts (
  id             TEXT PRIMARY KEY,
  slug           TEXT NOT NULL UNIQUE COLLATE NOCASE,
  title          TEXT NOT NULL,
  summary        TEXT NOT NULL DEFAULT '',
  body           TEXT NOT NULL,
  usage_notes    TEXT NOT NULL DEFAULT '',
  prompt_type    TEXT NOT NULL,
  category       TEXT NOT NULL,
  tags           TEXT NOT NULL DEFAULT '[]',
  models         TEXT NOT NULL DEFAULT '[]',
  contributor    TEXT NOT NULL DEFAULT 'Anonymous',
  forked_from_id TEXT REFERENCES prompts(id) ON DELETE SET NULL,
  featured       INTEGER NOT NULL DEFAULT 0,
  views          INTEGER NOT NULL DEFAULT 0,
  copies         INTEGER NOT NULL DEFAULT 0,
  likes          INTEGER NOT NULL DEFAULT 0,
  edit_count     INTEGER NOT NULL DEFAULT 0,
  created_at     TEXT NOT NULL,
  updated_at     TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_prompts_type      ON prompts(prompt_type);
CREATE INDEX IF NOT EXISTS idx_prompts_category  ON prompts(category);
CREATE INDEX IF NOT EXISTS idx_prompts_created   ON prompts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_prompts_popular   ON prompts(copies DESC, views DESC);

-- Seed-time snapshots only. Runtime clients never write prompt revisions.
CREATE TABLE IF NOT EXISTS prompt_revisions (
  id          TEXT PRIMARY KEY,
  prompt_id   TEXT NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  summary     TEXT NOT NULL,
  body        TEXT NOT NULL,
  usage_notes TEXT NOT NULL,
  prompt_type TEXT NOT NULL,
  category    TEXT NOT NULL,
  tags        TEXT NOT NULL DEFAULT '[]',
  models      TEXT NOT NULL DEFAULT '[]',
  contributor TEXT NOT NULL,
  created_at  TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_revisions_prompt
  ON prompt_revisions(prompt_id, created_at DESC);

-- Standalone (non external-content) FTS index so we can fold synthetic terms
-- such as tag lists and prompt-type keywords into the searchable text.
CREATE VIRTUAL TABLE IF NOT EXISTS prompts_fts USING fts5(
  prompt_id UNINDEXED,
  title,
  summary,
  body,
  keywords,
  tokenize = 'porter unicode61 remove_diacritics 2'
);
`;

function schemaVersionOf(connection: DatabaseSync): number {
  const row = connection.prepare("PRAGMA user_version").get() as
    | { user_version?: number }
    | undefined;
  return Number(row?.user_version ?? 0);
}

function resolveDbPath(): string {
  if (process.env.PROMPTSHELF_DB) return process.env.PROMPTSHELF_DB;
  // Vercel lambdas can only write under /tmp. The file is a seeded cache, not a store.
  if (process.env.VERCEL) return path.join("/tmp", "promptshelf.db");
  return path.join(process.cwd(), "data", "promptshelf.db");
}

function createConnection(): DatabaseSync {
  const file = resolveDbPath();
  mkdirSync(path.dirname(file), { recursive: true });

  const connection = new DatabaseSync(file);
  connection.exec("PRAGMA journal_mode = WAL");
  connection.exec("PRAGMA busy_timeout = 5000");
  connection.exec("PRAGMA synchronous = NORMAL");

  // A file written by an older shape is discarded rather than migrated: the
  // database is a seeded artifact, never a system of record.
  if (schemaVersionOf(connection) !== SCHEMA_VERSION) {
    connection.exec("PRAGMA foreign_keys = OFF");
    for (const table of [...TABLES, "users", "favorites"]) {
      connection.exec(`DROP TABLE IF EXISTS ${table}`);
    }
    connection.exec(`PRAGMA user_version = ${SCHEMA_VERSION}`);
  }

  connection.exec("PRAGMA foreign_keys = ON");
  connection.exec(SCHEMA);
  return connection;
}

// Cache across hot reloads locally and across warm isolates on Vercel.
const globalForDb = globalThis as unknown as { __promptshelfDb?: DatabaseSync };

export const db: DatabaseSync = globalForDb.__promptshelfDb ?? createConnection();
globalForDb.__promptshelfDb = db;

export type Row = Record<string, unknown>;

export function queryAll<T = Row>(sql: string, params: unknown[] = []): T[] {
  const statement = db.prepare(sql);
  return statement.all(...(params as never[])) as unknown as T[];
}

export function queryOne<T = Row>(sql: string, params: unknown[] = []): T | undefined {
  const statement = db.prepare(sql);
  const row = statement.get(...(params as never[]));
  return (row as unknown as T) ?? undefined;
}

export function execute(sql: string, params: unknown[] = []) {
  const statement = db.prepare(sql);
  return statement.run(...(params as never[]));
}

export function transaction<T>(fn: () => T): T {
  db.exec("BEGIN");
  try {
    const result = fn();
    db.exec("COMMIT");
    return result;
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

export function getMeta(key: string): string | undefined {
  return queryOne<{ value: string }>("SELECT value FROM meta WHERE key = ?", [key])?.value;
}

export function setMeta(key: string, value: string) {
  execute(
    "INSERT INTO meta (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
    [key, value],
  );
}
