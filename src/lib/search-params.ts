import { isCategoryId, isPromptTypeId, isSortId, type SortId } from "@/lib/taxonomy";

export type BrowseParams = {
  q: string;
  type: string;
  category: string;
  tag: string;
  model: string;
  sort: SortId;
  page: number;
};

export type RawSearchParams = Record<string, string | string[] | undefined>;

function single(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

export function parseBrowseParams(raw: RawSearchParams): BrowseParams {
  const sort = single(raw.sort);
  const page = Number.parseInt(single(raw.page), 10);
  const type = single(raw.type);
  const category = single(raw.category);

  return {
    q: single(raw.q).slice(0, 120).trim(),
    type: isPromptTypeId(type) ? type : "",
    category: isCategoryId(category) ? category : "",
    tag: single(raw.tag).slice(0, 40).trim(),
    model: single(raw.model).slice(0, 40).trim(),
    sort: isSortId(sort) ? sort : "relevance",
    page: Number.isFinite(page) && page > 0 ? page : 1,
  };
}

/**
 * Builds a browse URL from current state plus an override. Defaults are omitted
 * so shared links stay readable, and any filter change resets pagination.
 */
export function buildBrowseHref(
  pathname: string,
  current: BrowseParams,
  changes: Partial<BrowseParams> = {},
): string {
  const next: BrowseParams = { ...current, ...changes };
  const resetsPage = Object.keys(changes).some((key) => key !== "page");
  if (resetsPage && changes.page === undefined) next.page = 1;

  const params = new URLSearchParams();
  if (next.q) params.set("q", next.q);
  if (next.type) params.set("type", next.type);
  if (next.category) params.set("category", next.category);
  if (next.tag) params.set("tag", next.tag);
  if (next.model) params.set("model", next.model);
  if (next.sort !== "relevance") params.set("sort", next.sort);
  if (next.page > 1) params.set("page", String(next.page));

  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export function activeFilterCount(params: BrowseParams): number {
  return [params.type, params.category, params.tag, params.model].filter(Boolean).length;
}
