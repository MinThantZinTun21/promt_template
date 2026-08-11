"use client";

import { useSyncExternalStore, useTransition } from "react";

import { Icon } from "@/components/ui/Icon";
import { useToast } from "@/components/ui/Toast";
import {
  isFavorite,
  subscribePersonalStore,
  toggleFavorite,
  type PersonalFavoriteKey,
} from "@/lib/personal-store";
import { cx } from "@/lib/utils";

export function FavoriteButton({
  favoriteKey,
  withLabel,
  className,
}: {
  favoriteKey: PersonalFavoriteKey;
  withLabel?: boolean;
  className?: string;
}) {
  const toast = useToast();
  const [pending, startTransition] = useTransition();
  const favorite = useSyncExternalStore(
    subscribePersonalStore,
    () => isFavorite(favoriteKey),
    () => false,
  );

  const onClick = () => {
    startTransition(() => {
      const nextFavorites = toggleFavorite(favoriteKey);
      if (nextFavorites.has(favoriteKey)) {
        toast.show("Saved to your favorites", { tone: "success", icon: "heart" });
      }
    });
  };

  if (withLabel) {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={pending}
        aria-pressed={favorite}
        className={cx(
          "pressable inline-flex h-10 items-center gap-2 rounded-[var(--r-md)] px-4 text-subheadline font-semibold",
          favorite
            ? "bg-[color-mix(in_srgb,var(--sys-pink)_13%,transparent)] text-[var(--sys-pink)]"
            : "bg-fill-tertiary text-label hover:bg-fill-secondary",
          className,
        )}
      >
        <Icon
          name="heart"
          size={17}
          strokeWidth={1.85}
          fill={favorite ? "currentColor" : "none"}
          className={favorite ? "animate-pop" : undefined}
        />
        <span>{favorite ? "Favorited" : "Favorite"}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      aria-pressed={favorite}
      aria-label={favorite ? "Unfavorite prompt" : "Favorite prompt"}
      className={cx(
        "pressable inline-flex shrink-0 items-center justify-center rounded-full transition-colors",
        favorite
          ? "text-[var(--sys-pink)]"
          : "text-label-tertiary hover:bg-fill-tertiary hover:text-label-secondary",
        className,
      )}
    >
      <Icon
        name="heart"
        size={18}
        strokeWidth={1.8}
        fill={favorite ? "currentColor" : "none"}
        className={favorite ? "animate-pop" : undefined}
      />
    </button>
  );
}
