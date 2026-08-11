"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { signOutAction } from "@/app/actions/auth";
import { Avatar } from "@/components/ui/Avatar";
import { Icon, type IconName } from "@/components/ui/Icon";
import { ThemeControl } from "@/components/ui/ThemeControl";
import { cx } from "@/lib/utils";

type Item = { href: string; label: string; icon: IconName; badge?: number };

export function UserMenu({
  name,
  handle,
  role,
  pendingCount,
}: {
  name: string;
  handle: string;
  role: "member" | "admin";
  pendingCount?: number;
}) {
  const [open, setOpen] = useState(false);
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!container.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const items: Item[] = [
    { href: "/library", label: "My library", icon: "bookmark" },
    { href: `/u/${handle}`, label: "Public profile", icon: "person" },
    { href: "/new", label: "Add a prompt", icon: "plus" },
  ];

  if (role === "admin") {
    items.push({ href: "/admin", label: "Moderation", icon: "shield", badge: pendingCount });
  }

  return (
    <div ref={container} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        onClick={() => setOpen((value) => !value)}
        className="pressable flex items-center gap-1.5 rounded-full pl-0.5 pr-1 outline-offset-2"
      >
        <Avatar name={name} handle={handle} size={30} />
        <Icon name="chevronDown" size={13} className="text-label-tertiary" strokeWidth={2.1} />
        {role === "admin" && (pendingCount ?? 0) > 0 && (
          <span className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full bg-[var(--sys-red)] ring-2 ring-[var(--material-chrome)]" />
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="animate-sheet-in material-thick absolute right-0 top-[calc(100%+8px)] z-80 w-64 overflow-hidden rounded-[var(--r-lg)] border border-separator shadow-3"
        >
          <div className="hairline-b flex items-center gap-3 px-4 py-3">
            <Avatar name={name} handle={handle} size={36} />
            <div className="min-w-0">
              <p className="truncate text-subheadline font-semibold text-label">{name}</p>
              <p className="truncate text-footnote text-label-secondary">@{handle}</p>
            </div>
          </div>

          <div className="p-1.5">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                role="menuitem"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-[var(--r-sm)] px-2.5 py-2 text-subheadline text-label transition-colors hover:bg-fill-tertiary"
              >
                <Icon name={item.icon} size={17} className="text-label-secondary" />
                <span className="flex-1">{item.label}</span>
                {typeof item.badge === "number" && item.badge > 0 && (
                  <span className="rounded-full bg-[var(--sys-red)] px-1.5 py-px text-caption-2 font-semibold text-white">
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>

          <div className="hairline-t flex items-center justify-between gap-3 px-4 py-2.5">
            <span className="text-footnote text-label-secondary">Appearance</span>
            <ThemeControl />
          </div>

          <form action={signOutAction} className="hairline-t p-1.5">
            <button
              type="submit"
              role="menuitem"
              className={cx(
                "flex w-full items-center gap-2.5 rounded-[var(--r-sm)] px-2.5 py-2 text-left",
                "text-subheadline text-[var(--sys-red)] transition-colors hover:bg-[color-mix(in_srgb,var(--sys-red)_10%,transparent)]",
              )}
            >
              <Icon name="signOut" size={17} />
              Sign out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
