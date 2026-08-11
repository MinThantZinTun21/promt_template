import "server-only";

import bcrypt from "bcryptjs";

import { execute, queryAll, queryOne } from "@/lib/db";
import { newId, nowIso } from "@/lib/utils";

export type UserRole = "member" | "admin";

export type User = {
  id: string;
  email: string;
  handle: string;
  name: string;
  bio: string;
  role: UserRole;
  createdAt: string;
};

type UserRow = {
  id: string;
  email: string;
  handle: string;
  name: string;
  bio: string;
  role: string;
  password_hash: string;
  created_at: string;
};

function mapUser(row: UserRow): User {
  return {
    id: row.id,
    email: row.email,
    handle: row.handle,
    name: row.name,
    bio: row.bio,
    role: row.role === "admin" ? "admin" : "member",
    createdAt: row.created_at,
  };
}

const SELECT = "SELECT id, email, handle, name, bio, role, password_hash, created_at FROM users";

export function getUserById(id: string): User | undefined {
  const row = queryOne<UserRow>(`${SELECT} WHERE id = ? LIMIT 1`, [id]);
  return row ? mapUser(row) : undefined;
}

export function getUserByEmail(email: string): User | undefined {
  const row = queryOne<UserRow>(`${SELECT} WHERE email = ? LIMIT 1`, [email.trim()]);
  return row ? mapUser(row) : undefined;
}

export function getUserByHandle(handle: string): User | undefined {
  const row = queryOne<UserRow>(`${SELECT} WHERE handle = ? LIMIT 1`, [handle.trim()]);
  return row ? mapUser(row) : undefined;
}

export function emailTaken(email: string): boolean {
  return Boolean(queryOne("SELECT 1 AS ok FROM users WHERE email = ?", [email.trim()]));
}

export function handleTaken(handle: string): boolean {
  return Boolean(queryOne("SELECT 1 AS ok FROM users WHERE handle = ?", [handle.trim()]));
}

/** Appends digits until the derived handle is free. */
export function availableHandle(base: string): string {
  const cleaned = base.replace(/[^a-z0-9_]/gi, "").toLowerCase().slice(0, 20) || "member";
  let candidate = cleaned;
  let suffix = 2;
  while (handleTaken(candidate)) {
    candidate = `${cleaned}${suffix}`;
    suffix += 1;
  }
  return candidate;
}

export async function createUser(input: {
  email: string;
  handle: string;
  name: string;
  password: string;
  role?: UserRole;
  bio?: string;
}): Promise<User> {
  const id = newId("usr");
  const passwordHash = await bcrypt.hash(input.password, 10);

  execute(
    /* sql */ `
      INSERT INTO users (id, email, handle, name, bio, password_hash, role, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      id,
      input.email.trim(),
      input.handle.trim(),
      input.name.trim(),
      input.bio ?? "",
      passwordHash,
      input.role ?? "member",
      nowIso(),
    ],
  );

  return getUserById(id)!;
}

export async function verifyCredentials(email: string, password: string): Promise<User | null> {
  const row = queryOne<UserRow>(`${SELECT} WHERE email = ? LIMIT 1`, [email.trim()]);
  if (!row) return null;

  const ok = await bcrypt.compare(password, row.password_hash);
  return ok ? mapUser(row) : null;
}

export function updateProfile(id: string, input: { name: string; bio: string }) {
  execute("UPDATE users SET name = ?, bio = ? WHERE id = ?", [
    input.name.trim(),
    input.bio.trim(),
    id,
  ]);
}

export function countUsers(): number {
  return queryOne<{ total: number }>("SELECT COUNT(*) AS total FROM users")?.total ?? 0;
}

export function topContributors(limit = 6) {
  return queryAll<{ id: string; handle: string; name: string; prompts: number; copies: number }>(
    /* sql */ `
      SELECT u.id, u.handle, u.name,
             COUNT(p.id) AS prompts,
             COALESCE(SUM(p.copies), 0) AS copies
      FROM users u
      JOIN prompts p ON p.author_id = u.id AND p.status = 'published'
      GROUP BY u.id
      ORDER BY prompts DESC, copies DESC
      LIMIT ?
    `,
    [limit],
  );
}
