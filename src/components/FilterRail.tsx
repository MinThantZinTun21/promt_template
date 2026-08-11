import Link from "next/link";

import { ChipLink } from "@/components/ui/Chip";
import { Icon } from "@/components/ui/Icon";
import { TypeGlyph } from "@/components/ui/TypeGlyph";
import { ACCENT_VAR, CATEGORIES, PROMPT_TYPES } from "@/lib/taxonomy";
import { activeFilterCount, buildBrowseHref, type BrowseParams } from "@/lib/search-params";
import { cx } from "@/lib/utils";

function RailHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-2 px-1 text-caption-1 font-semibold uppercase tracking-[0.06em] text-label-tertiary">
      {children}
    </h2>
  );
}

/**
 * Sidebar filters for regular widths. Prompt type is the primary axis, so it
 * gets a full list with live result counts rather than a dropdown.
 */
export function FilterRail({
  pathname,
  params,
  typeCounts,
  categoryCounts,
  tags,
  lockedType,
}: {
  pathname: string;
  params: BrowseParams;
  typeCounts: Record<string, number>;
  categoryCounts: Record<string, number>;
  tags: Array<{ tag: string; count: number }>;
  lockedType?: boolean;
}) {
  const filterCount = activeFilterCount(params);

  return (
    <aside className="hidden w-60 shrink-0 lg:block">
      <div className="sticky top-[calc(var(--nav-height)+16px)] flex max-h-[calc(100dvh-var(--nav-height)-32px)] flex-col gap-6 overflow-y-auto pb-6 pr-1">
        {filterCount > 0 && (
          <Link
            href={buildBrowseHref(pathname, params, {
              type: lockedType ? params.type : "",
              category: "",
              tag: "",
              model: "",
            })}
            className="flex items-center justify-center gap-1.5 rounded-[var(--r-md)] bg-fill-tertiary py-2 text-footnote font-medium text-label transition-colors hover:bg-fill-secondary"
          >
            <Icon name="xmark" size={13} strokeWidth={2.2} />
            Clear {filterCount === 1 ? "filter" : `${filterCount} filters`}
          </Link>
        )}

        {!lockedType && (
          <section>
            <RailHeading>Prompt type</RailHeading>
            <ul className="flex flex-col">
              {PROMPT_TYPES.map((type) => {
                const count = typeCounts[type.id] ?? 0;
                const selected = params.type === type.id;

                return (
                  <li key={type.id}>
                    <Link
                      href={buildBrowseHref(pathname, params, {
                        type: selected ? "" : type.id,
                      })}
                      aria-current={selected ? "true" : undefined}
                      className={cx(
                        "flex items-center gap-2.5 rounded-[var(--r-sm)] px-2 py-1.5 transition-colors",
                        selected ? "bg-fill-tertiary" : "hover:bg-fill-quaternary",
                        count === 0 && !selected && "opacity-45",
                      )}
                    >
                      <TypeGlyph icon={type.icon} accent={type.accent} size={24} />
                      <span
                        className={cx(
                          "min-w-0 flex-1 truncate text-footnote",
                          selected ? "font-semibold text-label" : "text-label",
                        )}
                      >
                        {type.name}
                      </span>
                      <span className="shrink-0 text-caption-1 tabular-nums text-label-tertiary">
                        {count}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        <section>
          <RailHeading>Discipline</RailHeading>
          <div className="flex flex-wrap gap-1.5 px-1">
            {CATEGORIES.map((category) => {
              const count = categoryCounts[category.id] ?? 0;
              const selected = params.category === category.id;
              if (count === 0 && !selected) return null;

              return (
                <ChipLink
                  key={category.id}
                  href={buildBrowseHref(pathname, params, {
                    category: selected ? "" : category.id,
                  })}
                  selected={selected}
                  accent={ACCENT_VAR[category.accent]}
                  count={count}
                  scroll={false}
                >
                  {category.name}
                </ChipLink>
              );
            })}
          </div>
        </section>

        {tags.length > 0 && (
          <section>
            <RailHeading>Tags</RailHeading>
            <div className="flex flex-wrap gap-1.5 px-1">
              {tags.map((tag) => {
                const selected = params.tag.toLowerCase() === tag.tag.toLowerCase();

                return (
                  <ChipLink
                    key={tag.tag}
                    href={buildBrowseHref(pathname, params, { tag: selected ? "" : tag.tag })}
                    selected={selected}
                    scroll={false}
                  >
                    {tag.tag}
                  </ChipLink>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </aside>
  );
}

/** Horizontally scrolling type filter for compact widths. */
export function TypeFilterStrip({
  pathname,
  params,
  typeCounts,
}: {
  pathname: string;
  params: BrowseParams;
  typeCounts: Record<string, number>;
}) {
  const ordered = [...PROMPT_TYPES].sort(
    (a, b) => (typeCounts[b.id] ?? 0) - (typeCounts[a.id] ?? 0),
  );

  return (
    <div className="-mx-4 overflow-x-auto px-4 pb-1 lg:hidden [&::-webkit-scrollbar]:hidden">
      <div className="flex w-max items-center gap-1.5">
        <ChipLink
          href={buildBrowseHref(pathname, params, { type: "" })}
          selected={!params.type}
          scroll={false}
        >
          All types
        </ChipLink>

        {ordered.map((type) => {
          const count = typeCounts[type.id] ?? 0;
          const selected = params.type === type.id;
          if (count === 0 && !selected) return null;

          return (
            <ChipLink
              key={type.id}
              href={buildBrowseHref(pathname, params, { type: selected ? "" : type.id })}
              selected={selected}
              accent={ACCENT_VAR[type.accent]}
              icon={type.icon}
              count={count}
              scroll={false}
            >
              {type.name}
            </ChipLink>
          );
        })}
      </div>
    </div>
  );
}

/** Compact-width discipline row, shown under the type strip. */
export function CategoryFilterStrip({
  pathname,
  params,
  categoryCounts,
}: {
  pathname: string;
  params: BrowseParams;
  categoryCounts: Record<string, number>;
}) {
  return (
    <div className="-mx-4 overflow-x-auto px-4 pb-1 lg:hidden [&::-webkit-scrollbar]:hidden">
      <div className="flex w-max items-center gap-1.5">
        {CATEGORIES.map((category) => {
          const count = categoryCounts[category.id] ?? 0;
          const selected = params.category === category.id;
          if (count === 0 && !selected) return null;

          return (
            <ChipLink
              key={category.id}
              href={buildBrowseHref(pathname, params, {
                category: selected ? "" : category.id,
              })}
              selected={selected}
              accent={ACCENT_VAR[category.accent]}
              count={count}
              scroll={false}
            >
              {category.name}
            </ChipLink>
          );
        })}
      </div>
    </div>
  );
}
