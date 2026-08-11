"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Icon, type IconName } from "@/components/ui/Icon";
import { cx } from "@/lib/utils";

const TABS: Array<{ href: string; label: string; icon: IconName; match: (path: string) => boolean }> = [
  { href: "/", label: "Home", icon: "house", match: (path) => path === "/" },
  {
    href: "/browse",
    label: "Browse",
    icon: "magnifier",
    match: (path) => path.startsWith("/browse") || path.startsWith("/p/"),
  },
  {
    href: "/types",
    label: "Types",
    icon: "layers",
    match: (path) => path.startsWith("/types"),
  },
  {
    href: "/library",
    label: "Library",
    icon: "bookmark",
    match: (path) => path.startsWith("/library") || path.startsWith("/u/"),
  },
];

/** iOS-style tab bar for compact widths, hidden once the top nav has room. */
export function TabBar() {
  const pathname = usePathname();

  return (
    <div className="material-chrome hairline-t fixed inset-x-0 bottom-0 z-70 md:hidden">
      <nav aria-label="Sections" className="mx-auto grid max-w-lg grid-cols-4 safe-b">
        {TABS.map((tab) => {
          const active = tab.match(pathname);

          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={active ? "page" : undefined}
              className={cx(
                "flex h-[var(--tabbar-height)] flex-col items-center justify-center gap-0.5 transition-colors",
                active ? "text-[var(--sys-blue)]" : "text-label-tertiary",
              )}
            >
              <Icon name={tab.icon} size={22} strokeWidth={active ? 2.1 : 1.7} />
              <span className={cx("text-caption-2", active && "font-semibold")}>{tab.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
