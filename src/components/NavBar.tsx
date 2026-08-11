import Link from "next/link";

import { CommandPalette } from "@/components/CommandPalette";
import { NavLinks } from "@/components/NavLinks";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

export function NavBar() {
  return (
    <header className="material-chrome hairline-b sticky top-0 z-70">
      <div className="mx-auto flex h-[var(--nav-height)] max-w-6xl items-center gap-3 px-4 sm:px-6">
        <Link
          href="/"
          className="pressable flex shrink-0 items-center gap-2 rounded-full pr-1 text-label"
          aria-label="PromptShelf home"
        >
          <span
            className="flex size-7 items-center justify-center rounded-[8px] text-white"
            style={{
              background:
                "linear-gradient(160deg, var(--sys-blue), color-mix(in srgb, var(--sys-indigo) 82%, black))",
            }}
          >
            <Icon name="shelf" size={16} strokeWidth={1.9} />
          </span>
          <span className="text-headline tracking-[-0.02em]">PromptShelf</span>
        </Link>

        <NavLinks />

        <div className="ml-auto flex items-center gap-2">
          <CommandPalette />

          <ButtonLink href="/new" size="sm" variant="filled" icon="plus" pill>
            Add prompt
          </ButtonLink>
        </div>
      </div>
    </header>
  );
}
