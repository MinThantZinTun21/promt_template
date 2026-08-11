import Link from "next/link";

import { Icon } from "@/components/ui/Icon";
import { buildBrowseHref, type BrowseParams } from "@/lib/search-params";
import { cx } from "@/lib/utils";

function pageWindow(current: number, total: number): Array<number | "gap"> {
  if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1);

  const pages = new Set<number>([1, total, current]);
  if (current - 1 > 1) pages.add(current - 1);
  if (current + 1 < total) pages.add(current + 1);

  const sorted = [...pages].sort((a, b) => a - b);
  const output: Array<number | "gap"> = [];

  sorted.forEach((page, index) => {
    if (index > 0 && page - sorted[index - 1] > 1) output.push("gap");
    output.push(page);
  });

  return output;
}

export function Pagination({
  pathname,
  params,
  pageCount,
}: {
  pathname: string;
  params: BrowseParams;
  pageCount: number;
}) {
  if (pageCount <= 1) return null;

  const current = Math.min(params.page, pageCount);
  const items = pageWindow(current, pageCount);

  const arrow = (direction: "prev" | "next") => {
    const target = direction === "prev" ? current - 1 : current + 1;
    const disabled = direction === "prev" ? current <= 1 : current >= pageCount;

    if (disabled) {
      return (
        <span
          aria-hidden="true"
          className="flex size-9 items-center justify-center rounded-full text-label-quaternary"
        >
          <Icon name={direction === "prev" ? "chevronLeft" : "chevronRight"} size={16} strokeWidth={2.2} />
        </span>
      );
    }

    return (
      <Link
        href={buildBrowseHref(pathname, params, { page: target })}
        aria-label={direction === "prev" ? "Previous page" : "Next page"}
        className="pressable flex size-9 items-center justify-center rounded-full text-label-secondary transition-colors hover:bg-fill-tertiary hover:text-label"
      >
        <Icon name={direction === "prev" ? "chevronLeft" : "chevronRight"} size={16} strokeWidth={2.2} />
      </Link>
    );
  };

  return (
    <nav aria-label="Pagination" className="mt-8 flex items-center justify-center gap-1">
      {arrow("prev")}

      {items.map((item, index) =>
        item === "gap" ? (
          <span key={`gap-${index}`} className="px-1 text-footnote text-label-tertiary">
            …
          </span>
        ) : (
          <Link
            key={item}
            href={buildBrowseHref(pathname, params, { page: item })}
            aria-current={item === current ? "page" : undefined}
            className={cx(
              "pressable flex size-9 items-center justify-center rounded-full text-footnote tabular-nums transition-colors",
              item === current
                ? "bg-[var(--sys-blue)] font-semibold text-white"
                : "text-label-secondary hover:bg-fill-tertiary hover:text-label",
            )}
          >
            {item}
          </Link>
        ),
      )}

      {arrow("next")}
    </nav>
  );
}
