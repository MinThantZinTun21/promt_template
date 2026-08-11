import Link from "next/link";

import { Icon } from "@/components/ui/Icon";
import { ThemeControl } from "@/components/ui/ThemeControl";
import { currentUser } from "@/lib/auth";
import { PROMPT_TYPES } from "@/lib/taxonomy";

export async function SiteFooter() {
  const user = await currentUser();
  const highlights = PROMPT_TYPES.slice(0, 6);

  const accountLinks = user
    ? [
        { href: "/new", label: "Add a prompt" },
        { href: "/library", label: "My library" },
        { href: `/u/${user.handle}`, label: "My profile" },
      ]
    : [
        { href: "/new", label: "Add a prompt" },
        { href: "/signin", label: "Sign in" },
        { href: "/signup", label: "Create account" },
      ];

  return (
    <footer className="hairline-t mt-16 bg-canvas">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-8 md:flex-row md:justify-between">
          <div className="max-w-xs">
            <div className="flex items-center gap-2">
              <span
                className="flex size-6 items-center justify-center rounded-[7px] text-white"
                style={{
                  background:
                    "linear-gradient(160deg, var(--sys-blue), color-mix(in srgb, var(--sys-indigo) 82%, black))",
                }}
              >
                <Icon name="shelf" size={14} strokeWidth={1.9} />
              </span>
              <span className="text-headline text-label">PromptShelf</span>
            </div>
            <p className="mt-3 text-footnote text-label-secondary">
              A public library of prompt templates, organised by prompt type so you can find the
              shape you need and fill in the blanks.
            </p>
            <div className="mt-4">
              <ThemeControl />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            <nav aria-label="Library">
              <h2 className="text-caption-1 font-semibold uppercase tracking-[0.06em] text-label-tertiary">
                Library
              </h2>
              <ul className="mt-3 flex flex-col gap-2 text-footnote">
                <li>
                  <Link href="/browse" className="text-label-secondary hover:text-label">
                    Browse all
                  </Link>
                </li>
                <li>
                  <Link href="/types" className="text-label-secondary hover:text-label">
                    Prompt types
                  </Link>
                </li>
                <li>
                  <Link href="/browse?sort=recent" className="text-label-secondary hover:text-label">
                    Recently added
                  </Link>
                </li>
                <li>
                  <Link href="/browse?sort=popular" className="text-label-secondary hover:text-label">
                    Most used
                  </Link>
                </li>
              </ul>
            </nav>

            <nav aria-label="Popular types">
              <h2 className="text-caption-1 font-semibold uppercase tracking-[0.06em] text-label-tertiary">
                Popular types
              </h2>
              <ul className="mt-3 flex flex-col gap-2 text-footnote">
                {highlights.map((type) => (
                  <li key={type.id}>
                    <Link
                      href={`/types/${type.id}`}
                      className="text-label-secondary hover:text-label"
                    >
                      {type.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <nav aria-label="Account">
              <h2 className="text-caption-1 font-semibold uppercase tracking-[0.06em] text-label-tertiary">
                Account
              </h2>
              <ul className="mt-3 flex flex-col gap-2 text-footnote">
                {accountLinks.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-label-secondary hover:text-label">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>

        <p className="mt-10 text-caption-1 text-label-tertiary">
          Prompts are contributed by the community and reviewed before they appear in the public
          library.
        </p>
      </div>
    </footer>
  );
}
