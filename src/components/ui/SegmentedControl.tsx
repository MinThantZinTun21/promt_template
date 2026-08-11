"use client";

import Link from "next/link";

import { cx } from "@/lib/utils";

export type Segment = {
  id: string;
  label: string;
  href?: string;
  count?: number;
};

/**
 * iOS segmented control. The selected thumb is a single element that slides,
 * which keeps the movement continuous the way UIKit does it.
 */
export function SegmentedControl({
  segments,
  value,
  onChange,
  size = "md",
  className,
  ariaLabel,
}: {
  segments: Segment[];
  value: string;
  onChange?: (id: string) => void;
  size?: "sm" | "md";
  className?: string;
  ariaLabel?: string;
}) {
  const index = Math.max(
    0,
    segments.findIndex((segment) => segment.id === value),
  );
  const count = segments.length || 1;

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cx(
        "relative isolate inline-grid rounded-[var(--r-md)] bg-fill-tertiary p-0.5",
        size === "sm" ? "h-8" : "h-9",
        className,
      )}
      style={{ gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))` }}
    >
      <span
        aria-hidden="true"
        className="absolute inset-y-0.5 left-0.5 -z-10 rounded-[calc(var(--r-md)-2px)] bg-card shadow-1 transition-transform duration-[var(--duration-standard)] ease-[var(--ease-out)]"
        style={{
          width: `calc((100% - 4px) / ${count})`,
          transform: `translateX(${index * 100}%)`,
        }}
      />

      {segments.map((segment) => {
        const selected = segment.id === value;
        const content = (
          <>
            {segment.label}
            {typeof segment.count === "number" && (
              <span className="ml-1 tabular-nums opacity-55">{segment.count}</span>
            )}
          </>
        );

        const classes = cx(
          "flex items-center justify-center gap-1 truncate rounded-[calc(var(--r-md)-2px)] px-3 text-center transition-colors",
          size === "sm" ? "text-caption-1" : "text-footnote",
          selected ? "font-semibold text-label" : "font-medium text-label-secondary hover:text-label",
        );

        return segment.href ? (
          <Link
            key={segment.id}
            href={segment.href}
            role="tab"
            aria-selected={selected}
            scroll={false}
            className={classes}
          >
            {content}
          </Link>
        ) : (
          <button
            key={segment.id}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange?.(segment.id)}
            className={classes}
          >
            {content}
          </button>
        );
      })}
    </div>
  );
}
