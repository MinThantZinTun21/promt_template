import Link from "next/link";

import { Icon } from "@/components/ui/Icon";
import { TypeGlyph } from "@/components/ui/TypeGlyph";
import { PROMPT_TYPES } from "@/lib/taxonomy";
import { cx, pluralize } from "@/lib/utils";

export function TypeGrid({
  counts,
  limit,
  showDescription,
  className,
}: {
  counts: Record<string, number>;
  limit?: number;
  showDescription?: boolean;
  className?: string;
}) {
  const types = limit ? PROMPT_TYPES.slice(0, limit) : PROMPT_TYPES;

  return (
    <ul
      className={cx(
        "grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3",
        showDescription && "xl:grid-cols-3",
        className,
      )}
    >
      {types.map((type) => {
        const count = counts[type.id] ?? 0;

        return (
          <li key={type.id}>
            <Link
              href={`/types/${type.id}`}
              className={cx(
                "group flex h-full items-start gap-3 rounded-[var(--r-xl)] border border-separator bg-card p-4",
                "transition-[transform,box-shadow,border-color] duration-[var(--duration-standard)] ease-[var(--ease-standard)]",
                "hover:-translate-y-0.5 hover:shadow-2",
              )}
            >
              <TypeGlyph icon={type.icon} accent={type.accent} size={40} filled />

              <span className="min-w-0 flex-1">
                <span className="block truncate text-headline text-label">{type.name}</span>

                <span className="mt-0.5 block text-footnote text-label-secondary">
                  {showDescription ? type.description : type.tagline}
                </span>

                <span className="mt-2 block text-caption-1 tabular-nums text-label-tertiary">
                  {count > 0 ? pluralize(count, "prompt") : "No prompts yet"}
                </span>
              </span>

              <Icon
                name="chevronRight"
                size={15}
                strokeWidth={2.2}
                className="mt-1 shrink-0 text-label-quaternary transition-transform duration-[var(--duration-fast)] group-hover:translate-x-0.5 group-hover:text-label-tertiary"
              />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
