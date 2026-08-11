import Link from "next/link";
import type { ReactNode } from "react";

import { Icon, type IconName } from "@/components/ui/Icon";
import { cx } from "@/lib/utils";

const BASE =
  "pressable inline-flex max-w-full items-center gap-1.5 rounded-full px-3 py-1.5 text-footnote font-medium";

export function Chip({
  children,
  icon,
  accent,
  selected,
  count,
  className,
}: {
  children: ReactNode;
  icon?: IconName;
  accent?: string;
  selected?: boolean;
  count?: number;
  className?: string;
}) {
  const tint = accent ?? "var(--sys-blue)";

  return (
    <span
      className={cx(BASE, selected ? "text-white" : "bg-fill-tertiary text-label", className)}
      style={selected ? { backgroundColor: tint } : undefined}
    >
      {icon && <Icon name={icon} size={14} strokeWidth={1.9} />}
      <span className="truncate">{children}</span>
      {typeof count === "number" && (
        <span className={cx("tabular-nums", selected ? "opacity-80" : "text-label-tertiary")}>
          {count}
        </span>
      )}
    </span>
  );
}

export function ChipLink({
  href,
  children,
  icon,
  accent,
  selected,
  count,
  className,
  scroll,
}: {
  href: string;
  children: ReactNode;
  icon?: IconName;
  accent?: string;
  selected?: boolean;
  count?: number;
  className?: string;
  scroll?: boolean;
}) {
  const tint = accent ?? "var(--sys-blue)";

  return (
    <Link
      href={href}
      scroll={scroll}
      aria-current={selected ? "true" : undefined}
      className={cx(
        BASE,
        selected
          ? "text-white shadow-[0_1px_3px_rgba(0,0,0,0.16)]"
          : "bg-fill-tertiary text-label hover:bg-fill-secondary",
        className,
      )}
      style={selected ? { backgroundColor: tint } : undefined}
    >
      {icon && <Icon name={icon} size={14} strokeWidth={1.9} />}
      <span className="truncate">{children}</span>
      {typeof count === "number" && (
        <span className={cx("tabular-nums", selected ? "opacity-80" : "text-label-tertiary")}>
          {count}
        </span>
      )}
    </Link>
  );
}

export function TagList({
  tags,
  max = 4,
  hrefFor,
}: {
  tags: string[];
  max?: number;
  hrefFor?: (tag: string) => string;
}) {
  const shown = tags.slice(0, max);
  const rest = tags.length - shown.length;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {shown.map((tag) =>
        hrefFor ? (
          <Link
            key={tag}
            href={hrefFor(tag)}
            className="rounded-full bg-fill-quaternary px-2 py-0.5 text-caption-1 text-label-secondary transition-colors hover:bg-fill-tertiary hover:text-label"
          >
            {tag}
          </Link>
        ) : (
          <span
            key={tag}
            className="rounded-full bg-fill-quaternary px-2 py-0.5 text-caption-1 text-label-secondary"
          >
            {tag}
          </span>
        ),
      )}
      {rest > 0 && <span className="text-caption-1 text-label-tertiary">+{rest}</span>}
    </div>
  );
}
