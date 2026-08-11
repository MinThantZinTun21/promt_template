"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cx } from "@/lib/utils";

const LINKS = [
  { href: "/browse", label: "Browse" },
  { href: "/types", label: "Prompt types" },
  { href: "/library", label: "My library" },
];

export function NavLinks() {
  const pathname = usePathname();

  return (
    <nav className="hidden items-center gap-0.5 md:flex" aria-label="Primary">
      {LINKS.map((link) => {
        const active = pathname === link.href || pathname.startsWith(`${link.href}/`);

        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={cx(
              "rounded-full px-3 py-1.5 text-subheadline transition-colors",
              active
                ? "bg-fill-tertiary font-semibold text-label"
                : "font-medium text-label-secondary hover:bg-fill-quaternary hover:text-label",
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
