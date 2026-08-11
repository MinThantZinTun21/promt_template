"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { Icon } from "@/components/ui/Icon";
import { SearchField } from "@/components/ui/SearchField";
import { TypeGlyph } from "@/components/ui/TypeGlyph";
import { searchPersonalPrompts } from "@/lib/personal-store";
import { PROMPT_TYPES, getPromptType } from "@/lib/taxonomy";
import { cx } from "@/lib/utils";

type Hit = {
  slug: string;
  title: string;
  summary: string;
  promptType: string;
  category: string;
};

type Item = {
  kind: "prompt" | "personal" | "type" | "action";
  id: string;
  title: string;
  subtitle: string;
  type?: string;
  href: string;
};

const ACTIONS: Item[] = [
  { kind: "action", id: "browse", title: "Browse all prompts", subtitle: "Every published prompt", href: "/browse" },
  { kind: "action", id: "types", title: "Prompt types", subtitle: `All ${PROMPT_TYPES.length} types`, href: "/types" },
  { kind: "action", id: "new", title: "Add a prompt", subtitle: "Save a private draft in this browser", href: "/new" },
  { kind: "action", id: "library", title: "My library", subtitle: "Private drafts and favorites", href: "/library" },
];

/**
 * Spotlight-style search. Opens on ⌘K or /, searches prompts as you type, and
 * also matches the fixed prompt-type list so search doubles as navigation.
 */
export function CommandPalette() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable === true;

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((value) => !value);
        return;
      }

      if (event.key === "/" && !typing) {
        event.preventDefault();
        setOpen(true);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="pressable hidden h-9 w-56 items-center gap-2 rounded-full bg-fill-tertiary px-3.5 text-label-secondary transition-colors hover:bg-fill-secondary lg:flex xl:w-72"
      >
        <Icon name="magnifier" size={16} strokeWidth={1.9} />
        <span className="flex-1 text-left text-subheadline">Search prompts</span>
        <kbd className="flex items-center gap-0.5 rounded-[5px] bg-fill-secondary px-1.5 py-0.5 text-caption-2 font-medium">
          <Icon name="command" size={10} strokeWidth={2.2} />K
        </kbd>
      </button>

      <button
        type="button"
        aria-label="Search"
        onClick={() => setOpen(true)}
        className="pressable flex size-9 items-center justify-center rounded-full bg-fill-tertiary text-label-secondary lg:hidden"
      >
        <Icon name="magnifier" size={17} strokeWidth={1.9} />
      </button>

      {/* Mounted only while open, so each launch starts from a clean field. */}
      {open && <PaletteDialog onClose={() => setOpen(false)} />}
    </>
  );
}

function PaletteDialog({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const controller = new AbortController();

    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
          signal: controller.signal,
        });
        const data = (await response.json()) as { prompts: Hit[] };
        setHits(data.prompts ?? []);
        setActive(0);
      } catch {
        // Aborted or offline: keep whatever is already on screen.
      } finally {
        setLoading(false);
      }
    }, query ? 140 : 0);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [query]);

  const needle = query.trim().toLowerCase();

  const typeItems: Item[] = needle
    ? PROMPT_TYPES.filter(
        (type) =>
          type.name.toLowerCase().includes(needle) ||
          type.keywords.some((keyword) => keyword.includes(needle)),
      )
        .slice(0, 3)
        .map((type) => ({
          kind: "type" as const,
          id: type.id,
          title: type.name,
          subtitle: type.tagline,
          type: type.id,
          href: `/types/${type.id}`,
        }))
    : [];

  const promptItems: Item[] = hits.map((hit) => ({
    kind: "prompt" as const,
    id: hit.slug,
    title: hit.title,
    subtitle: hit.summary,
    type: hit.promptType,
    href: `/p/${hit.slug}`,
  }));

  const personalItems: Item[] = (needle ? searchPersonalPrompts(query, 5) : []).map((prompt) => ({
    kind: "personal" as const,
    id: prompt.id,
    title: prompt.title,
    subtitle: "Private draft",
    type: prompt.promptType,
    href: `/p/${prompt.id}`,
  }));

  const actionItems: Item[] = needle
    ? ACTIONS.filter((action) => action.title.toLowerCase().includes(needle))
    : ACTIONS.slice(0, 2);

  const items = [...typeItems, ...personalItems, ...promptItems, ...actionItems];
  const searchAllHref = `/browse?q=${encodeURIComponent(query.trim())}`;

  const go = useCallback(
    (href: string) => {
      onClose();
      router.push(href);
    },
    [onClose, router],
  );

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((value) => (items.length ? (value + 1) % items.length : 0));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((value) => (items.length ? (value - 1 + items.length) % items.length : 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      const item = items[active];
      go(item ? item.href : searchAllHref);
    } else if (event.key === "Escape") {
      event.preventDefault();
      onClose();
    }
  };

  useEffect(() => {
    listRef.current
      ?.querySelector<HTMLElement>(`[data-index="${active}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [active]);

  return (
    <div className="fixed inset-0 z-95 flex items-start justify-center px-4 pt-[8vh] sm:pt-[12vh]">
      <button
        type="button"
        aria-label="Close search"
        onClick={onClose}
        className="animate-fade-in absolute inset-0 bg-black/28 backdrop-blur-[3px]"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search prompts"
        onKeyDown={onKeyDown}
        className="animate-sheet-in material-thick relative flex max-h-[70dvh] w-full max-w-xl flex-col overflow-hidden rounded-[var(--r-2xl)] border border-separator shadow-[var(--sh-sheet)]"
      >
        <div className="p-3">
          <SearchField
            value={query}
            onChange={setQuery}
            onSubmit={() => go(items[active]?.href ?? searchAllHref)}
            placeholder="Search prompts, types, tags…"
            inputRef={inputRef}
            autoFocus
            busy={loading}
          />
        </div>

        <div ref={listRef} className="min-h-0 flex-1 overflow-y-auto px-2 pb-2">
          {items.length === 0 ? (
            <p className="px-3 py-8 text-center text-subheadline text-label-secondary">
              {loading ? "Searching…" : `No matches for “${query}”`}
            </p>
          ) : (
            <ul className="flex flex-col">
              {items.map((item, index) => {
                const type = getPromptType(item.type);

                return (
                  <li key={`${item.kind}-${item.id}`}>
                    <button
                      type="button"
                      data-index={index}
                      onMouseEnter={() => setActive(index)}
                      onClick={() => go(item.href)}
                      className={cx(
                        "flex w-full items-center gap-3 rounded-[var(--r-md)] px-2.5 py-2 text-left transition-colors",
                        index === active ? "bg-fill-secondary" : "hover:bg-fill-quaternary",
                      )}
                    >
                      {type ? (
                        <TypeGlyph icon={type.icon} accent={type.accent} size={30} />
                      ) : (
                        <span className="flex size-[30px] items-center justify-center rounded-[9px] bg-fill-tertiary text-label-secondary">
                          <Icon name={item.kind === "action" ? "arrowRight" : "docText"} size={16} />
                        </span>
                      )}

                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-subheadline font-medium text-label">
                          {item.title}
                        </span>
                        <span className="block truncate text-footnote text-label-secondary">
                          {item.subtitle}
                        </span>
                      </span>

                      {item.kind === "type" && (
                        <span className="shrink-0 rounded-full bg-fill-tertiary px-2 py-0.5 text-caption-2 text-label-secondary">
                          Type
                        </span>
                      )}
                      {item.kind === "personal" && (
                        <span className="shrink-0 rounded-full bg-fill-tertiary px-2 py-0.5 text-caption-2 text-label-secondary">
                          Private
                        </span>
                      )}
                      <Icon name="chevronRight" size={14} className="shrink-0 text-label-tertiary" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="hairline-t flex items-center justify-between px-4 py-2.5 text-caption-1 text-label-secondary">
          <span className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Icon name="chevronUpDown" size={12} strokeWidth={2} /> navigate
            </span>
            <span>↩ open</span>
            <span>esc close</span>
          </span>
          {query.trim() && (
            <button
              type="button"
              onClick={() => go(searchAllHref)}
              className="font-medium text-[var(--sys-blue)]"
            >
              See all results
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
