import "server-only";

import { execute, queryAll, queryOne } from "@/lib/db";
import { getPromptType, type SortId } from "@/lib/taxonomy";
import { parseJsonArray } from "@/lib/utils";

export const ANONYMOUS = "Anonymous";

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
  contributor: string;
  forkedFromId: string | null;
  forkedFrom: { slug: string; title: string } | null;
  featured: boolean;
  views: number;
  copies: number;
  likes: number;
  editCount: number;
  createdAt: string;
  updatedAt: string;
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
  contributor: string;
  forked_from_id: string | null;
  forked_from_slug: string | null;
  forked_from_title: string | null;
  featured: number;
  views: number;
  copies: number;
  likes: number;
  edit_count: number;
  created_at: string;
  updated_at: string;
};

const SELECT_COLUMNS = /* sql */ `
  p.id, p.slug, p.title, p.summary, p.body, p.usage_notes, p.prompt_type, p.category,
  p.tags, p.models, p.contributor, p.forked_from_id, p.featured, p.views, p.copies,
  p.likes, p.edit_count, p.created_at, p.updated_at,
  fp.slug  AS forked_from_slug,
  fp.title AS forked_from_title
`;

const JOINS = /* sql */ `
  LEFT JOIN prompts fp ON fp.id = p.forked_from_id
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
    contributor: row.contributor || ANONYMOUS,
    forkedFromId: row.forked_from_id,
    forkedFrom:
      row.forked_from_id && row.forked_from_slug
        ? { slug: row.forked_from_slug, title: row.forked_from_title ?? "Original" }
        : null,
    featured: row.featured === 1,
    views: row.views,
    copies: row.copies,
    likes: row.likes,
    editCount: row.edit_count,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
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
  contributor?: string;
  featuredOnly?: boolean;
};

export type SearchOptions = SearchFilters & {
  sort?: SortId;
  page?: number;
  perPage?: number;
};

type WhereParts = {
  clauses: string[];
  whereParams: unknown[];
};

function buildFilters(filters: SearchFilters, skip?: "type" | "category"): WhereParts {
  const clauses: string[] = [];
  const params: unknown[] = [];

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

  if (filters.contributor) {
    clauses.push("p.contributor = ? COLLATE NOCASE");
    params.push(filters.contributor);
  }

  if (filters.featuredOnly) {
    clauses.push("p.featured = 1");
  }

  return { clauses, whereParams: params };
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
      return "p.created_at DESC, p.title ASC";
    case "popular":
      return "(p.copies * 3 + p.likes * 4 + p.views) DESC, p.created_at DESC";
    case "alpha":
      return "p.title COLLATE NOCASE ASC";
    case "relevance":
    default:
      return hasQuery
        ? "f.rank ASC, p.copies DESC"
        : "p.featured DESC, (p.copies * 3 + p.likes * 4 + p.views) DESC, p.created_at DESC";
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

  const fts = ftsJoinFor(options.q, true);
  const hasQuery = fts.active;
  const sort = options.sort ?? "relevance";

  const { clauses, whereParams } = buildFilters(options);
  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";

  const rows = queryAll<PromptRow>(
    /* sql */ `
      SELECT ${SELECT_COLUMNS}
      FROM prompts p
      ${JOINS}
      ${fts.sql}
      ${where}
      ORDER BY ${orderBy(sort, hasQuery)}
      LIMIT ? OFFSET ?
    `,
    [...fts.params, ...whereParams, perPage, (page - 1) * perPage],
  );

  const totalRow = queryOne<{ total: number }>(
    /* sql */ `
      SELECT COUNT(*) AS total
      FROM prompts p
      ${fts.sql}
      ${where}
    `,
    [...fts.params, ...whereParams],
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
  const { clauses, whereParams } = buildFilters(filters, "type");

  const rows = queryAll<{ prompt_type: string; total: number }>(
    /* sql */ `
      SELECT p.prompt_type, COUNT(*) AS total
      FROM prompts p
      ${fts.sql}
      ${clauses.length ? `WHERE ${clauses.join(" AND ")}` : ""}
      GROUP BY p.prompt_type
    `,
    [...fts.params, ...whereParams],
  );

  return Object.fromEntries(rows.map((r) => [r.prompt_type, r.total]));
}

/** Result counts per category for the current query, ignoring any category filter. */
export function countsByCategory(filters: SearchFilters = {}): Record<string, number> {
  const fts = ftsJoinFor(filters.q, false);
  const { clauses, whereParams } = buildFilters(filters, "category");

  const rows = queryAll<{ category: string; total: number }>(
    /* sql */ `
      SELECT p.category, COUNT(*) AS total
      FROM prompts p
      ${fts.sql}
      ${clauses.length ? `WHERE ${clauses.join(" AND ")}` : ""}
      GROUP BY p.category
    `,
    [...fts.params, ...whereParams],
  );

  return Object.fromEntries(rows.map((r) => [r.category, r.total]));
}

export function topTags(limit = 24): Array<{ tag: string; count: number }> {
  return queryAll<{ tag: string; count: number }>(
    /* sql */ `
      SELECT json_each.value AS tag, COUNT(*) AS count
      FROM prompts p, json_each(p.tags)
      GROUP BY lower(json_each.value)
      ORDER BY count DESC, tag ASC
      LIMIT ?
    `,
    [limit],
  );
}

export function libraryStats() {
  const row = queryOne<{
    prompts: number;
    types: number;
    contributors: number;
    copies: number;
    edits: number;
  }>(
    /* sql */ `
      SELECT
        (SELECT COUNT(*) FROM prompts)                          AS prompts,
        (SELECT COUNT(DISTINCT prompt_type) FROM prompts)       AS types,
        (SELECT COUNT(DISTINCT contributor) FROM prompts)       AS contributors,
        (SELECT COALESCE(SUM(copies), 0) FROM prompts)          AS copies,
        (SELECT COUNT(*) FROM prompt_revisions)                 AS edits
    `,
  );
  return row ?? { prompts: 0, types: 0, contributors: 0, copies: 0, edits: 0 };
}

/* ------------------------------------------------------------------ */
/* Reads                                                              */
/* ------------------------------------------------------------------ */

export function getPromptBySlug(slug: string): Prompt | undefined {
  const row = queryOne<PromptRow>(
    /* sql */ `
      SELECT ${SELECT_COLUMNS}
      FROM prompts p
      ${JOINS}
      WHERE p.slug = ?
      LIMIT 1
    `,
    [slug],
  );
  return row ? mapPrompt(row) : undefined;
}

export function getPromptById(id: string): Prompt | undefined {
  const row = queryOne<PromptRow>(
    /* sql */ `
      SELECT ${SELECT_COLUMNS}
      FROM prompts p
      ${JOINS}
      WHERE p.id = ?
      LIMIT 1
    `,
    [id],
  );
  return row ? mapPrompt(row) : undefined;
}

export function relatedPrompts(prompt: Prompt, limit = 4): Prompt[] {
  const rows = queryAll<PromptRow>(
    /* sql */ `
      SELECT ${SELECT_COLUMNS}
      FROM prompts p
      ${JOINS}
      WHERE p.id != ?
        AND (p.prompt_type = ? OR p.category = ?)
      ORDER BY (p.prompt_type = ?) DESC, (p.copies * 3 + p.likes * 4 + p.views) DESC
      LIMIT ?
    `,
    [prompt.id, prompt.promptType, prompt.category, prompt.promptType, limit],
  );
  return rows.map(mapPrompt);
}

/* ------------------------------------------------------------------ */
/* Seed-time FTS writes                                               */
/* ------------------------------------------------------------------ */

function ftsKeywords(input: {
  promptType: string;
  category: string;
  tags: string[];
  models: string[];
  contributor?: string;
}): string {
  const type = getPromptType(input.promptType);
  return [
    input.promptType.replace(/-/g, " "),
    type?.name ?? "",
    ...(type?.keywords ?? []),
    input.category,
    ...input.tags,
    ...input.models,
    input.contributor ?? "",
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
  contributor?: string;
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
    contributor: string;
  }>(
    /* sql */ `
      SELECT id, title, summary, body, usage_notes, prompt_type, category, tags, models, contributor
      FROM prompts WHERE id = ?
    `,
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
    contributor: row.contributor,
  });
}
