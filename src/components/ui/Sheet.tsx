"use client";

import { useEffect, useRef, type ReactNode } from "react";

import { IconButton } from "@/components/ui/Button";
import { cx } from "@/lib/utils";

/**
 * Modal presentation: a bottom sheet with a grabber on compact widths and a
 * centered card on regular widths, over a dimmed vibrancy backdrop.
 */
export function Sheet({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  width = "md",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  width?: "sm" | "md" | "lg";
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  const widths = { sm: "sm:max-w-md", md: "sm:max-w-xl", lg: "sm:max-w-3xl" } as const;

  return (
    <div className="fixed inset-0 z-90 flex items-end justify-center sm:items-center sm:p-6">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="animate-fade-in absolute inset-0 bg-black/28 backdrop-blur-[3px]"
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={cx(
          "animate-slide-up relative flex max-h-[92dvh] w-full flex-col overflow-hidden bg-card outline-none",
          "rounded-t-[var(--r-3xl)] shadow-[var(--sh-sheet)]",
          "sm:animate-sheet-in sm:rounded-[var(--r-2xl)]",
          widths[width],
        )}
      >
        <span
          aria-hidden="true"
          className="mx-auto mt-2 h-1.5 w-9 shrink-0 rounded-full bg-label-quaternary sm:hidden"
        />

        <header className="flex items-start gap-3 px-5 pb-3 pt-4 sm:pt-5">
          <div className="min-w-0 flex-1">
            <h2 className="text-title-3 text-label">{title}</h2>
            {description && (
              <p className="mt-1 text-footnote text-label-secondary">{description}</p>
            )}
          </div>
          <IconButton icon="xmark" label="Close" variant="gray" size={30} onClick={onClose} />
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5">{children}</div>

        {footer && (
          <footer className="hairline-t flex items-center justify-end gap-2 px-5 py-3.5 safe-b">
            {footer}
          </footer>
        )}
      </div>
    </div>
  );
}
