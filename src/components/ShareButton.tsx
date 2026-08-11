"use client";

import { Icon } from "@/components/ui/Icon";
import { useToast } from "@/components/ui/Toast";
import { cx } from "@/lib/utils";

/** Uses the native share sheet where available, otherwise copies the link. */
export function ShareButton({ title, className }: { title: string; className?: string }) {
  const toast = useToast();

  const onClick = async () => {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        // User dismissed the sheet, or sharing is unavailable: fall through to copy.
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      toast.show("Link copied", { tone: "success", icon: "share" });
    } catch {
      toast.show("Could not copy the link", { tone: "error" });
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Share this prompt"
      title="Share"
      className={cx(
        "pressable inline-flex size-10 items-center justify-center rounded-[var(--r-md)] bg-fill-tertiary text-label transition-colors hover:bg-fill-secondary",
        className,
      )}
    >
      <Icon name="share" size={17} strokeWidth={1.85} />
    </button>
  );
}
