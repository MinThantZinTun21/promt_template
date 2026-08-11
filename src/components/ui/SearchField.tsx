"use client";

import { useEffect, useId, useRef } from "react";

import { Icon } from "@/components/ui/Icon";
import { cx } from "@/lib/utils";

/**
 * HIG search field: leading magnifier, trailing clear affordance that only
 * appears once there is text, and a capsule fill that reads as a control.
 */
export function SearchField({
  value,
  onChange,
  onSubmit,
  placeholder = "Search",
  size = "md",
  autoFocus,
  shortcutHint,
  busy,
  className,
  inputRef,
  ariaLabel,
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
  size?: "sm" | "md" | "lg";
  autoFocus?: boolean;
  shortcutHint?: boolean;
  busy?: boolean;
  className?: string;
  inputRef?: React.RefObject<HTMLInputElement | null>;
  ariaLabel?: string;
}) {
  const id = useId();
  const localRef = useRef<HTMLInputElement>(null);
  const ref = inputRef ?? localRef;

  useEffect(() => {
    if (autoFocus) ref.current?.focus();
  }, [autoFocus, ref]);

  const heights = { sm: "h-9", md: "h-11", lg: "h-14" } as const;
  const text = { sm: "text-subheadline", md: "text-callout", lg: "text-body" } as const;
  const iconSize = { sm: 15, md: 17, lg: 20 } as const;

  return (
    <div
      className={cx(
        "group relative flex items-center rounded-full bg-fill-tertiary transition-[background-color,box-shadow] duration-[var(--duration-fast)]",
        "focus-within:bg-card focus-within:shadow-[0_0_0_3px_color-mix(in_srgb,var(--sys-blue)_28%,transparent),0_0_0_1px_var(--sys-blue)]",
        heights[size],
        className,
      )}
    >
      <span
        className={cx(
          "pointer-events-none absolute left-3.5 text-label-secondary",
          busy && "animate-pulse",
        )}
      >
        <Icon name="magnifier" size={iconSize[size]} strokeWidth={1.9} />
      </span>

      <input
        id={id}
        ref={ref}
        type="search"
        role="searchbox"
        aria-label={ariaLabel ?? placeholder}
        value={value}
        placeholder={placeholder}
        autoComplete="off"
        spellCheck={false}
        enterKeyHint="search"
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            onSubmit?.();
          }
          if (event.key === "Escape" && value) {
            event.preventDefault();
            onChange("");
          }
        }}
        className={cx(
          "h-full w-full min-w-0 rounded-full bg-transparent pl-10 pr-11 text-label outline-none",
          "[&::-webkit-search-cancel-button]:appearance-none",
          text[size],
        )}
      />

      {value ? (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => {
            onChange("");
            ref.current?.focus();
          }}
          className="pressable absolute right-2.5 flex size-6 items-center justify-center rounded-full text-label-tertiary hover:text-label-secondary"
        >
          <Icon name="xmarkCircleFill" size={18} />
        </button>
      ) : (
        shortcutHint && (
          <kbd className="pointer-events-none absolute right-3 hidden items-center gap-0.5 rounded-[5px] bg-fill-secondary px-1.5 py-0.5 text-caption-2 font-medium text-label-secondary sm:flex">
            <Icon name="command" size={10} strokeWidth={2.2} />K
          </kbd>
        )
      )}
    </div>
  );
}
