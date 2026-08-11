import "server-only";

import { execute, queryAll, queryOne, transaction } from "@/lib/db";
import { getPromptType, type SortId } from "@/lib/taxonomy";
import { newId, nowIso, parseJsonArray, slugify } from "@/lib/utils";

export type PromptStatus = "private" | "pending" | "published" | "rejected";

export type PromptAuthor = {
  id: string;
  handle: string;
  name: string;
};

export type Prompt = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  body: string;
  usageNotes: string;
  promptType: string;
  category: string;
  tags: string[];
  models: string[];
  status: PromptStatus;
  author: PromptAuthor | null;
  forkedFromId: string | null;
  forkedFrom: { slug: string; title: string } | null;
  featured: boolean;
  views: number;
  copies: number;
  saves: number;
  reviewNote: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  isFavorite: boolean;
};

type PromptRow = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  body: string;
  usage_notes: string;
  prompt_type: string;
  category: string;
  tags: string;
  models: string;
  status: string;
  author_id: string | null;
  author_handle: string | null;
  author_name: string | null;
  forked_from_id: string | null;
  forked_from_slug: string | null;
  forked_from_title: string | null;
  featured: number;
  views: number;
  copies: number;
  saves: number;
  review_note: string;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  is_favorite: number;
};

const SELECT_COLUMNS = /* sql */ `
  p.id, p.slug, p.title, p.summary, p.body, p.usage_notes, p.prompt_type, p.category,
  p.tags, p.models, p.status, p.author_id, p.forked_from_id, p.featured, p.views,
  p.copies, p.saves, p.review_note, p.created_at, p.updated_at, p.published_at,
  u.handle AS author_handle,
  u.name   AS author_name,
  fp.slug  AS forked_from_slug,
  fp.title AS forked_from_title,
  CASE WHEN fav.user_id IS NULL THEN 0 ELSE 1 END AS is_favorite
`;

const JOINS = /* sql */ `
  LEFT JOIN users     u  ON u.id  = p.author_id
  LEFT JOIN prompts   fp ON fp.id = p.forked_from_id
  LEFT JOIN favorites fav ON fav.prompt_id = p.id AND fav.user_id = ?
`;

function mapPrompt(row: PromptRow): Prompt {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    body: row.body,
    usageNotes: row.usage_notes,
    promptType: row.prompt_type,
    category: row.category,
    tags: parseJsonArray(row.tags),
    models: parseJsonArray(row.models),
    status: row.status as PromptStatus,
    author:
      row.author_id && row.author_handle
        ? { id: row.author_id, handle: row.author_handle, name: row.author_name ?? row.author_handle }
        : null,
    forkedFromId: row.forked_from_id,
    forkedFrom:
      row.forked_from_id && row.forked_from_slug
        ? { slug: row.forked_from_slug, title: row.forked_from_title ?? "Original" }
        : null,
    featured: row.featured === 1,
    views: row.views,
    copies: row.copies,
    saves: row.saves,
    reviewNote: row.review_note,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    publishedAt: row.published_at,
    isFavorite: row.is_favorite === 1,
  };
}

/* ------------------------------------------------------------------ */
/* Search                                                             */
/* ------------------------------------------------------------------ */

/**
 * Turns free text into an FTS5 MATCH expression. Every token becomes a prefix
 * term so "summar" finds "summarization", and terms are ANDed for precision.
 */
export function toFtsQuery(input: string): string | null {
  const tokens = input.toLowerCase().match(/[\p{L}\p{N}_]+/gu);
  if (!tokens?.length) return null;

  const terms = tokens
    .slice(0, 8)
    .map((token) => (token.length >= 2 ? `"${token}"*` : `"${token}"`));

  return terms.length ? terms.join(" AND ") : null;
}

export type SearchFilters = {
  q?: string;
  type?: string;
  category?: string;
  tag?: string;
  model?: string;
  authorId?: string;
  favoritedBy?: string;
  featuredOnly?: boolean;
  statuses?: PromptStatus[];
};

export type SearchOptions = SearchFilters & {
  sort?: SortId;
  page?: number;
  perPage?: number;
  viewerId?: string | null;
};

type WhereParts = {
  clauses: string[];
  whereParams: unknown[];
  joinSql: string[];
  joinParams: unknown[];
};

function buildFilters(filters: SearchFilters, skip?: "type" | "category"): WhereParts {
  const clauses: string[] = [];
  const params: unknown[] = [];
  const extraJoins: string[] = [];
  const joinParams: unknown[] = [];

  const statuses = filters.statuses ?? ["published"];
  if (statuses.length === 0) {
    clauses.push("0 = 1");
  } else {
    clauses.push(`p.status IN (${statuses.map(() => "?").join(", ")})`);
    params.push(...statuses);
  }

  if (filters.type && skip !== "type") {
    clauses.push("p.prompt_type = ?");
    params.push(filters.type);
  }

  if (filters.category && skip !== "category") {
    clauses.push("p.category = ?");
    params.push(filters.category);
  }

  if (filters.tag) {
    // tags are stored as a JSON array of strings
    clauses.push(
      "EXISTS (SELECT 1 FROM json_each(p.tags) WHERE lower(json_each.value) = lower(?))",
    );
    params.push(filters.tag);
  }

  if (filters.model) {
    clauses.push(
      "EXISTS (SELECT 1 FROM json_each(p.models) WHERE lower(json_each.value) = lower(?))",
    );
    params.push(filters.model);
  }

  if (filters.authorId) {
    clauses.push("p.author_id = ?");
    params.push(filters.authorId);
  }

  if (filters.featuredOnly) {
    clauses.push("p.featured = 1");
  }

  if (filters.favoritedBy) {
    extraJoins.push("JOIN favorites saved ON saved.prompt_id = p.id AND saved.user_id = ?");
    joinParams.push(filters.favoritedBy);
  }

  return { clauses, whereParams: params, joinSql: extraJoins, joinParams };
}

/**
 * FTS5 only accepts MATCH inside a WHERE clause, so full-text filtering enters
 * the query as a ranked subquery that we join on.
 */
function ftsJoinFor(input: string | undefined, withRank: boolean) {
  const match = input ? toFtsQuery(input) : null;
  if (!match) return { sql: "", params: [] as unknown[], active: false };

  const sql = withRank
    ? `JOIN (
         SELECT prompt_id, bm25(prompts_fts, 0.0, 12.0, 6.0, 1.0, 4.0) AS rank
         FROM prompts_fts WHERE prompts_fts MATCH ?
       ) f ON f.prompt_id = p.id`
    : `JOIN (
         SELECT prompt_id FROM prompts_fts WHERE prompts_fts MATCH ?
       ) f ON f.prompt_id = p.id`;

  return { sql, params: [match] as unknown[], active: true };
}

function orderBy(sort: SortId, hasQuery: boolean): string {
  switch (sort) {
    case "recent":
      return "COALESCE(p.published_at, p.created_at) DESC, p.title ASC";
    case "popular":
      return "(p.copies * 3 + p.saves * 4 + p.views) DESC, COALESCE(p.published_at, p.created_at) DESC";
    case "alpha":
      return "p.title COLLATE NOCASE ASC";
    case "relevance":
    default:
      return hasQuery
        ? "f.rank ASC, p.copies DESC"
        : "p.featured DESC, (p.copies * 3 + p.saves * 4 + p.views) DESC, COALESCE(p.published_at, p.created_at) DESC";
  }
}

export type SearchResult = {
  prompts: Prompt[];
  total: number;
  page: number;
  perPage: number;
  pageCount: number;
};

export function searchPrompts(options: SearchOptions = {}): SearchResult {
  const perPage = Math.min(Math.max(options.perPage ?? 24, 1), 60);
  const page = Math.max(options.page ?? 1, 1);
  const viewerId = options.viewerId ?? null;

  const fts = ftsJoinFor(options.q, true);
  const hasQuery = fts.active;
  const sort = options.sort ?? "relevance";

  const { clauses, whereParams, joinSql, joinParams } = buildFilters(options);
  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";

  // Parameters bind in SQL text order: favorite-flag join, filter joins, FTS, WHERE.
  const rows = queryAll<PromptRow>(
    /* sql */ `
      SELECT ${SELECT_COLUMNS}
      FROM prompts p
      ${JOINS}
      ${joinSql.join("\n")}
      ${fts.sql}
      ${where}
      ORDER BY ${orderBy(sort, hasQuery)}
      LIMIT ? OFFSET ?
    `,
    [viewerId, ...joinParams, ...fts.params, ...whereParams, perPage, (page - 1) * perPage],
  );

  const totalRow = queryOne<{ total: number }>(
    /* sql */ `
      SELECT COUNT(*) AS total
      FROM prompts p
      ${joinSql.join("\n")}
      ${fts.sql}
      ${where}
    `,
    [...joinParams, ...fts.params, ...whereParams],
  );

  const total = totalRow?.total ?? 0;

  return {
    prompts: rows.map(mapPrompt),
    total,
    page,
    perPage,
    pageCount: Math.max(1, Math.ceil(total / perPage)),
  };
}

/** Result counts per prompt type for the current query, ignoring any type filter. */
export function countsByType(filters: SearchFilters = {}): Record<string, number> {
  const fts = ftsJoinFor(filters.q, false);
  const { clauses, whereParams, joinSql, joinParams } = buildFilters(filters, "type");

  const rows = queryAll<{ prompt_type: string; total: number }>(
    /* sql */ `
      SELECT p.prompt_type, COUNT(*) AS total
      FROM prompts p
      ${joinSql.join("\n")}
      ${fts.sql}
      ${clauses.length ? `WHERE ${clauses.join(" AND ")}` : ""}
      GROUP BY p.prompt_type
    `,
    [...joinParams, ...fts.params, ...whereParams],
  );

  return Object.fromEntries(rows.map((r) => [r.prompt_type, r.total]));
}

/** Result counts per category for the current query, ignoring any category filter. */
export function countsByCategory(filters: SearchFilters = {}): Record<string, number> {
  const fts = ftsJoinFor(filters.q, false);
  const { clauses, whereParams, joinSql, joinParams } = buildFilters(filters, "category");

  const rows = queryAll<{ category: string; total: number }>(
    /* sql */ `
      SELECT p.category, COUNT(*) AS total
      FROM prompts p
      ${joinSql.join("\n")}
      ${fts.sql}
      ${clauses.length ? `WHERE ${clauses.join(" AND ")}` : ""}
      GROUP BY p.category
    `,
    [...joinParams, ...fts.params, ...whereParams],
  );

  return Object.fromEntries(rows.map((r) => [r.category, r.total]));
}

export function topTags(limit = 24): Array<{ tag: string; count: number }> {
  return queryAll<{ tag: string; count: number }>(
    /* sql */ `
      SELECT json_each.value AS tag, COUNT(*) AS count
      FROM prompts p, json_each(p.tags)
      WHERE p.status = 'published'
      GROUP BY lower(json_each.value)
      ORDER BY count DESC, tag ASC
      LIMIT ?
    `,
    [limit],
  );
}

export function libraryStats() {
  const row = queryOne<{ prompts: number; types: number; authors: number; copies: number }>(
    /* sql */ `
      SELECT
        (SELECT COUNT(*) FROM prompts WHERE status = 'published')                       AS prompts,
        (SELECT COUNT(DISTINCT prompt_type) FROM prompts WHERE status = 'published')    AS types,
        (SELECT COUNT(DISTINCT author_id) FROM prompts WHERE status = 'published')      AS authors,
        (SELECT COALESCE(SUM(copies), 0) FROM prompts WHERE status = 'published')       AS copies
    `,
  );
  return row ?? { prompts: 0, types: 0, authors: 0, copies: 0 };
}

/* ------------------------------------------------------------------ */
/* Reads                                                              */
/* ------------------------------------------------------------------ */

export function getPromptBySlug(slug: string, viewerId: string | null = null): Prompt | undefined {
  const row = queryOne<PromptRow>(
    /* sql */ `
      SELECT ${SELECT_COLUMNS}
      FROM prompts p
      ${JOINS}
      WHERE p.slug = ?
      LIMIT 1
    `,
    [viewerId, slug],
  );
  return row ? mapPrompt(row) : undefined;
}

export function getPromptById(id: string, viewerId: string | null = null): Prompt | undefined {
  const row = queryOne<PromptRow>(
    /* sql */ `
      SELECT ${SELECT_COLUMNS}
      FROM prompts p
      ${JOINS}
      WHERE p.id = ?
      LIMIT 1
    `,
    [viewerId, id],
  );
  return row ? mapPrompt(row) : undefined;
}

export function relatedPrompts(prompt: Prompt, viewerId: string | null = null, limit = 4): Prompt[] {
  const rows = queryAll<PromptRow>(
    /* sql */ `
      SELECT ${SELECT_COLUMNS}
      FROM prompts p
      ${JOINS}
      WHERE p.status = 'published'
        AND p.id != ?
        AND (p.prompt_type = ? OR p.category = ?)
      ORDER BY (p.prompt_type = ?) DESC, (p.copies * 3 + p.saves * 4 + p.views) DESC
      LIMIT ?
    `,
    [viewerId, prompt.id, prompt.promptType, prompt.category, prompt.promptType, limit],
  );
  return rows.map(mapPrompt);
}

export function countPendingReview(): number {
  return (
    queryOne<{ total: number }>("SELECT COUNT(*) AS total FROM prompts WHERE status = 'pending'")
      ?.total ?? 0
  );
}

export function authorStats(authorId: string) {
  const row = queryOne<{ published: number; drafts: number; copies: number; saves: number }>(
    /* sql */ `
      SELECT
        SUM(CASE WHEN status = 'published' THEN 1 ELSE 0 END) AS published,
        SUM(CASE WHEN status IN ('private', 'pending', 'rejected') THEN 1 ELSE 0 END) AS drafts,
        COALESCE(SUM(copies), 0) AS copies,
        COALESCE(SUM(saves), 0)  AS saves
      FROM prompts
      WHERE author_id = ?
    `,
    [authorId],
  );
  return {
    published: row?.published ?? 0,
    drafts: row?.drafts ?? 0,
    copies: row?.copies ?? 0,
    saves: row?.saves ?? 0,
  };
}

/* ------------------------------------------------------------------ */
/* Writes                                                             */
/* ------------------------------------------------------------------ */

function ftsKeywords(input: {
  promptType: string;
  category: string;
  tags: string[];
  models: string[];
}): string {
  const type = getPromptType(input.promptType);
  return [
    input.promptType.replace(/-/g, " "),
    type?.name ?? "",
    ...(type?.keywords ?? []),
    input.category,
    ...input.tags,
    ...input.models,
  ]
    .filter(Boolean)
    .join(" ");
}

function writeFtsRow(prompt: {
  id: string;
  title: string;
  summary: string;
  body: string;
  usageNotes: string;
  promptType: string;
  category: string;
  tags: string[];
  models: string[];
}) {
  execute("DELETE FROM prompts_fts WHERE prompt_id = ?", [prompt.id]);
  execute(
    "INSERT INTO prompts_fts (prompt_id, title, summary, body, keywords) VALUES (?, ?, ?, ?, ?)",
    [
      prompt.id,
      prompt.title,
      prompt.summary,
      `${prompt.body}\n${prompt.usageNotes}`,
      ftsKeywords(prompt),
    ],
  );
}

export function reindexPrompt(id: string) {
  const row = queryOne<{
    id: string;
    title: string;
    summary: string;
    body: string;
    usage_notes: string;
    prompt_type: string;
    category: string;
    tags: string;
    models: string;
  }>(
    "SELECT id, title, summary, body, usage_notes, prompt_type, category, tags, models FROM prompts WHERE id = ?",
    [id],
  );
  if (!row) return;

  writeFtsRow({
    id: row.id,
    title: row.title,
    summary: row.summary,
    body: row.body,
    usageNotes: row.usage_notes,
    promptType: row.prompt_type,
    category: row.category,
    tags: parseJsonArray(row.tags),
    models: parseJsonArray(row.models),
  });
}

function uniqueSlug(title: string, ignoreId?: string): string {
  const base = slugify(title) || "prompt";
  let candidate = base;
  let suffix = 2;

  for (;;) {
    const clash = queryOne<{ id: string }>("SELECT id FROM prompts WHERE slug = ? LIMIT 1", [
      candidate,
    ]);
    if (!clash || clash.id === ignoreId) return candidate;
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
}

export type PromptInput = {
  title: string;
  summary: string;
  body: string;
  usageNotes: string;
  promptType: string;
  category: string;
  tags: string[];
  models: string[];
  status: PromptStatus;
};

export function createPrompt(
  input: PromptInput & { authorId: string | null; forkedFromId?: string | null; featured?: boolean },
): Prompt {
  const id = newId("pr");
  const slug = uniqueSlug(input.title);
  const timestamp = nowIso();

  transaction(() => {
    execute(
      /* sql */ `
        INSERT INTO prompts (
          id, slug, title, summary, body, usage_notes, prompt_type, category, tags, models,
          status, author_id, forked_from_id, featured, created_at, updated_at, published_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        id,
        slug,
        input.title,
        input.summary,
        input.body,
        input.usageNotes,
        input.promptType,
        input.category,
        JSON.stringify(input.tags),
        JSON.stringify(input.models),
        input.status,
        input.authorId,
        input.forkedFromId ?? null,
        input.featured ? 1 : 0,
        timestamp,
        timestamp,
        input.status === "published" ? timestamp : null,
      ],
    );
    writeFtsRow({ ...input, id });
  });

  return getPromptById(id)!;
}

export function updatePrompt(id: string, input: PromptInput): Prompt | undefined {
  const existing = queryOne<{ slug: string; title: string; status: string; published_at: string | null }>(
    "SELECT slug, title, status, published_at FROM prompts WHERE id = ?",
    [id],
  );
  if (!existing) return undefined;

  const slug = existing.title === input.title ? existing.slug : uniqueSlug(input.title, id);
  const publishedAt =
    input.status === "published" ? (existing.published_at ?? nowIso()) : existing.published_at;

  transaction(() => {
    execute(
      /* sql */ `
        UPDATE prompts SET
          slug = ?, title = ?, summary = ?, body = ?, usage_notes = ?, prompt_type = ?,
          category = ?, tags = ?, models = ?, status = ?, updated_at = ?, published_at = ?
        WHERE id = ?
      `,
      [
        slug,
        input.title,
        input.summary,
        input.body,
        input.usageNotes,
        input.promptType,
        input.category,
        JSON.stringify(input.tags),
        JSON.stringify(input.models),
        input.status,
        nowIso(),
        publishedAt,
        id,
      ],
    );
    writeFtsRow({ ...input, id });
  });

  return getPromptById(id);
}

export function deletePrompt(id: string) {
  transaction(() => {
    execute("DELETE FROM prompts_fts WHERE prompt_id = ?", [id]);
    execute("DELETE FROM prompts WHERE id = ?", [id]);
  });
}

export function setPromptStatus(id: string, status: PromptStatus, reviewNote = "") {
  execute(
    /* sql */ `
      UPDATE prompts
      SET status = ?,
          review_note = ?,
          updated_at = ?,
          published_at = CASE WHEN ? = 'published' AND published_at IS NULL THEN ? ELSE published_at END
      WHERE id = ?
    `,
    [status, reviewNote, nowIso(), status, nowIso(), id],
  );
}

export function setPromptFeatured(id: string, featured: boolean) {
  execute("UPDATE prompts SET featured = ?, updated_at = ? WHERE id = ?", [
    featured ? 1 : 0,
    nowIso(),
    id,
  ]);
}

export function incrementViews(id: string) {
  execute("UPDATE prompts SET views = views + 1 WHERE id = ?", [id]);
}

export function incrementCopies(id: string) {
  execute("UPDATE prompts SET copies = copies + 1 WHERE id = ?", [id]);
}

export function toggleFavorite(userId: string, promptId: string): boolean {
  const existing = queryOne<{ prompt_id: string }>(
    "SELECT prompt_id FROM favorites WHERE user_id = ? AND prompt_id = ?",
    [userId, promptId],
  );

  if (existing) {
    transaction(() => {
      execute("DELETE FROM favorites WHERE user_id = ? AND prompt_id = ?", [userId, promptId]);
      execute("UPDATE prompts SET saves = MAX(saves - 1, 0) WHERE id = ?", [promptId]);
    });
    return false;
  }

  transaction(() => {
    execute("INSERT INTO favorites (user_id, prompt_id, created_at) VALUES (?, ?, ?)", [
      userId,
      promptId,
      nowIso(),
    ]);
    execute("UPDATE prompts SET saves = saves + 1 WHERE id = ?", [promptId]);
  });
  return true;
}

export function isFavorited(userId: string, promptId: string): boolean {
  return Boolean(
    queryOne("SELECT 1 AS ok FROM favorites WHERE user_id = ? AND prompt_id = ?", [
      userId,
      promptId,
    ]),
  );
}
