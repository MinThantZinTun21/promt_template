import "server-only";

import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import path from "node:path";

const SCHEMA = /* sql */ `
CREATE TABLE IF NOT EXISTS meta (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
  id            TEXT PRIMARY KEY,
  email         TEXT NOT NULL UNIQUE COLLATE NOCASE,
  handle        TEXT NOT NULL UNIQUE COLLATE NOCASE,
  name          TEXT NOT NULL,
  bio           TEXT NOT NULL DEFAULT '',
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'member',
  created_at    TEXT NOT NULL
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
  status         TEXT NOT NULL DEFAULT 'pending',
  author_id      TEXT REFERENCES users(id) ON DELETE SET NULL,
  forked_from_id TEXT REFERENCES prompts(id) ON DELETE SET NULL,
  featured       INTEGER NOT NULL DEFAULT 0,
  views          INTEGER NOT NULL DEFAULT 0,
  copies         INTEGER NOT NULL DEFAULT 0,
  saves          INTEGER NOT NULL DEFAULT 0,
  review_note    TEXT NOT NULL DEFAULT '',
  created_at     TEXT NOT NULL,
  updated_at     TEXT NOT NULL,
  published_at   TEXT
);

CREATE INDEX IF NOT EXISTS idx_prompts_status      ON prompts(status);
CREATE INDEX IF NOT EXISTS idx_prompts_type        ON prompts(prompt_type, status);
CREATE INDEX IF NOT EXISTS idx_prompts_category    ON prompts(category, status);
CREATE INDEX IF NOT EXISTS idx_prompts_author      ON prompts(author_id, status);
CREATE INDEX IF NOT EXISTS idx_prompts_published   ON prompts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_prompts_popular     ON prompts(copies DESC, views DESC);

CREATE TABLE IF NOT EXISTS favorites (
  user_id    TEXT NOT NULL REFERENCES users(id)   ON DELETE CASCADE,
  prompt_id  TEXT NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL,
  PRIMARY KEY (user_id, prompt_id)
);

CREATE INDEX IF NOT EXISTS idx_favorites_prompt ON favorites(prompt_id);

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

function createConnection(): DatabaseSync {
  const file = process.env.PROMPTSHELF_DB ?? path.join(process.cwd(), "data", "promptshelf.db");
  mkdirSync(path.dirname(file), { recursive: true });

  const connection = new DatabaseSync(file);
  connection.exec("PRAGMA journal_mode = WAL");
  connection.exec("PRAGMA foreign_keys = ON");
  connection.exec("PRAGMA busy_timeout = 5000");
  connection.exec("PRAGMA synchronous = NORMAL");
  connection.exec(SCHEMA);
  return connection;
}

// Next.js recreates modules on every hot reload; one connection per process only.
const globalForDb = globalThis as unknown as { __promptshelfDb?: DatabaseSync };

export const db: DatabaseSync = globalForDb.__promptshelfDb ?? createConnection();

if (process.env.NODE_ENV !== "production") {
  globalForDb.__promptshelfDb = db;
}

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
