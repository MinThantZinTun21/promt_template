"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { toggleFavoriteAction } from "@/app/actions/prompts";
import { Icon } from "@/components/ui/Icon";
import { useToast } from "@/components/ui/Toast";
import { cx } from "@/lib/utils";

export function FavoriteButton({
  promptId,
  saved,
  signedIn,
  size = 34,
  withLabel,
  className,
}: {
  promptId: string;
  saved: boolean;
  signedIn: boolean;
  size?: number;
  withLabel?: boolean;
  className?: string;
}) {
  const router = useRouter();
  const toast = useToast();
  const [isSaved, setIsSaved] = useState(saved);
  const [pending, startTransition] = useTransition();

  const onClick = () => {
    if (!signedIn) {
      toast.show("Sign in to save prompts", { tone: "info", icon: "lock" });
      router.push("/signin");
      return;
    }

    const next = !isSaved;
    setIsSaved(next);

    startTransition(async () => {
      const result = await toggleFavoriteAction(promptId);
      setIsSaved(result.saved);
      toast.show(result.saved ? "Saved to your library" : "Removed from your library", {
        tone: "success",
        icon: result.saved ? "bookmarkFill" : "bookmark",
      });
    });
  };

  if (withLabel) {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={pending}
        aria-pressed={isSaved}
        className={cx(
          "pressable inline-flex h-10 items-center gap-2 rounded-[var(--r-md)] px-4 text-subheadline font-semibold",
          isSaved
            ? "bg-[color-mix(in_srgb,var(--sys-blue)_13%,transparent)] text-[var(--sys-blue)]"
            : "bg-fill-tertiary text-label hover:bg-fill-secondary",
          className,
        )}
      >
        <Icon name={isSaved ? "bookmarkFill" : "bookmark"} size={17} strokeWidth={1.85} />
        {isSaved ? "Saved" : "Save"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      aria-pressed={isSaved}
      aria-label={isSaved ? "Remove from library" : "Save to library"}
      title={isSaved ? "Remove from library" : "Save to library"}
      style={{ width: size, height: size }}
      className={cx(
        "pressable inline-flex shrink-0 items-center justify-center rounded-full transition-colors",
        isSaved
          ? "text-[var(--sys-blue)]"
          : "text-label-tertiary hover:bg-fill-tertiary hover:text-label-secondary",
        className,
      )}
    >
      <Icon
        name={isSaved ? "bookmarkFill" : "bookmark"}
        size={Math.round(size * 0.5)}
        strokeWidth={1.8}
        className={isSaved ? "animate-pop" : undefined}
      />
    </button>
  );
}
