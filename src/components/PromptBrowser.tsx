import Link from "next/link";

import { BrowseSearch } from "@/components/BrowseSearch";
import {
  CategoryFilterStrip,
  FilterRail,
  TypeFilterStrip,
} from "@/components/FilterRail";
import { Pagination } from "@/components/Pagination";
import { PromptCard } from "@/components/PromptCard";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { EmptyState } from "@/components/ui/Surface";
import { countsByCategory, countsByType, searchPrompts, topTags } from "@/lib/prompts";
import { buildBrowseHref, type BrowseParams } from "@/lib/search-params";
import { SORT_OPTIONS, getCategory, getPromptType } from "@/lib/taxonomy";
import { pluralize } from "@/lib/utils";

export function PromptBrowser({
  pathname,
  params,
  lockedType,
}: {
  pathname: string;
  params: BrowseParams;
  lockedType?: string;
}) {
  const type = lockedType ?? params.type;

  const filters = {
    q: params.q || undefined,
    type: type || undefined,
    category: params.category || undefined,
    tag: params.tag || undefined,
    model: params.model || undefined,
  };

  const results = searchPrompts({
    ...filters,
    sort: params.sort,
    page: params.page,
    perPage: 24,
  });

  const typeCounts = countsByType(filters);
  const categoryCounts = countsByCategory(filters);
  const tags = topTags(16);

  const activeType = getPromptType(type);
  const activeCategory = getCategory(params.category);

  return (
    <div className="flex gap-8">
      <FilterRail
        pathname={pathname}
        params={params}
        typeCounts={typeCounts}
        categoryCounts={categoryCounts}
        tags={tags}
        lockedType={Boolean(lockedType)}
      />

      <div className="min-w-0 flex-1">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <BrowseSearch
              initialQuery={params.q}
              className="flex-1"
              placeholder={
                activeType ? `Search ${activeType.name.toLowerCase()} prompts` : "Search prompts"
              }
            />

            <SegmentedControl
              ariaLabel="Sort results"
              value={params.sort}
              className="w-full sm:w-72"
              segments={SORT_OPTIONS.map((option) => ({
                id: option.id,
                label: option.name,
                href: buildBrowseHref(pathname, params, { sort: option.id }),
              }))}
            />
          </div>

          {!lockedType && (
            <TypeFilterStrip pathname={pathname} params={params} typeCounts={typeCounts} />
          )}
          <CategoryFilterStrip
            pathname={pathname}
            params={params}
            categoryCounts={categoryCounts}
          />
        </div>

        <div className="mb-4 mt-4 flex flex-wrap items-center gap-x-3 gap-y-2">
          <p className="text-footnote text-label-secondary">
            {results.total === 0 ? "No public prompts" : pluralize(results.total, "public prompt")}
            {params.q && (
              <>
                {" for "}
                <span className="font-medium text-label">“{params.q}”</span>
              </>
            )}
          </p>

          {[
            activeType && !lockedType
              ? { key: "type", label: activeType.name, href: buildBrowseHref(pathname, params, { type: "" }) }
              : null,
            activeCategory
              ? {
                  key: "category",
                  label: activeCategory.name,
                  href: buildBrowseHref(pathname, params, { category: "" }),
                }
              : null,
            params.tag
              ? { key: "tag", label: `#${params.tag}`, href: buildBrowseHref(pathname, params, { tag: "" }) }
              : null,
            params.model
              ? {
                  key: "model",
                  label: params.model,
                  href: buildBrowseHref(pathname, params, { model: "" }),
                }
              : null,
          ]
            .filter((chip): chip is { key: string; label: string; href: string } => chip !== null)
            .map((chip) => (
              <Link
                key={chip.key}
                href={chip.href}
                scroll={false}
                className="pressable inline-flex items-center gap-1 rounded-full bg-fill-tertiary px-2.5 py-1 text-footnote font-medium text-label transition-colors hover:bg-fill-secondary"
              >
                {chip.label}
                <Icon name="xmark" size={12} strokeWidth={2.4} className="text-label-tertiary" />
              </Link>
            ))}
        </div>

        {results.prompts.length === 0 ? (
          <EmptyState
            icon="magnifier"
            title={params.q ? `Nothing matches “${params.q}”` : "No public prompts here yet"}
            message={
              params.q
                ? "Try a shorter query, a single keyword, or clear the filters to widen the search."
                : "This corner of the public shelf is empty. You can still keep a private draft on this device."
            }
            action={
              params.q || params.category || params.tag || params.model ? (
                <ButtonLink
                  href={buildBrowseHref(pathname, params, {
                    q: "",
                    category: "",
                    tag: "",
                    model: "",
                    type: lockedType ? params.type : "",
                  })}
                  variant="tinted"
                >
                  Clear search and filters
                </ButtonLink>
              ) : (
                <ButtonLink href="/new" variant="filled" icon="plus">
                  Add a prompt
                </ButtonLink>
              )
            }
          />
        ) : (
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 2xl:grid-cols-3">
            {results.prompts.map((prompt) => (
              <li key={prompt.id} className="flex">
                <PromptCard prompt={prompt} className="w-full" />
              </li>
            ))}
          </ul>
        )}

        <Pagination pathname={pathname} params={params} pageCount={results.pageCount} />
      </div>
    </div>
  );
}
