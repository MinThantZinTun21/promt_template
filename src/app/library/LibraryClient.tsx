"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { useSearchParams } from "next/navigation";

import { BrowseSearch } from "@/components/BrowseSearch";
import { PersonalPromptCard } from "@/components/PersonalPromptCard";
import { PromptCard } from "@/components/PromptCard";
import { ButtonLink } from "@/components/ui/Button";
import { EmptyState, SectionHeader } from "@/components/ui/Surface";
import {
  getPersonalPrompt,
  getPersonalStoreVersion,
  readFavorites,
  searchPersonalPrompts,
  subscribePersonalStore,
  type PersonalPromptRecord,
} from "@/lib/personal-store";
import type { Prompt } from "@/lib/prompts";
import { pluralize } from "@/lib/utils";

function matchesQuery(haystack: string, query: string) {
  const tokens = query.toLowerCase().split(/\s+/).filter(Boolean);
  const text = haystack.toLowerCase();
  return tokens.every((token) => text.includes(token));
}

export function LibraryClient() {
  const searchParams = useSearchParams();
  const q = (searchParams.get("q") ?? "").trim();
  const version = useSyncExternalStore(
    subscribePersonalStore,
    getPersonalStoreVersion,
    () => "server",
  );
  const [favoritePublic, setFavoritePublic] = useState<Prompt[]>([]);

  const drafts = useMemo(() => {
    void version;
    return searchPersonalPrompts(q, 200);
  }, [q, version]);

  const favoritePersonal = useMemo(() => {
    void version;
    return [...readFavorites()]
      .filter((key) => key.startsWith("personal:"))
      .map((key) => getPersonalPrompt(key.slice("personal:".length)))
      .filter((prompt): prompt is PersonalPromptRecord => Boolean(prompt))
      .filter((prompt) =>
        q ? matchesQuery(`${prompt.title} ${prompt.summary} ${prompt.tags.join(" ")}`, q) : true,
      );
  }, [q, version]);

  const publicSlugs = useMemo(() => {
    void version;
    return [...readFavorites()]
      .filter((key) => key.startsWith("public:"))
      .map((key) => key.slice("public:".length));
  }, [version]);

  useEffect(() => {
    if (publicSlugs.length === 0) {
      Promise.resolve().then(() => setFavoritePublic([]));
      return;
    }

    const controller = new AbortController();
    fetch(`/api/prompts?slugs=${encodeURIComponent(publicSlugs.join(","))}`, {
      signal: controller.signal,
    })
      .then((response) => response.json() as Promise<{ prompts: Prompt[] }>)
      .then((data) => setFavoritePublic(data.prompts ?? []))
      .catch(() => {
        // Offline or aborted: keep whatever we already have.
      });

    return () => controller.abort();
  }, [publicSlugs]);

  const filteredFavoritePublic = useMemo(() => {
    if (!q) return favoritePublic;
    return favoritePublic.filter((prompt) =>
      matchesQuery(`${prompt.title} ${prompt.summary} ${prompt.tags.join(" ")}`, q),
    );
  }, [favoritePublic, q]);

  const favoriteCount = filteredFavoritePublic.length + favoritePersonal.length;
  const empty = drafts.length === 0 && favoriteCount === 0;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <header className="mb-6">
        <h1 className="text-title-1 text-label">My library</h1>
        <p className="mt-1 text-subheadline text-label-secondary">
          Private drafts and favorites stored only in this browser.
          {!empty
            ? ` ${pluralize(drafts.length, "draft")} · ${pluralize(favoriteCount, "favorite")}.`
            : ""}
        </p>
      </header>

      <div className="mb-4">
        <BrowseSearch initialQuery={q} placeholder="Search your private drafts and favorites…" />
      </div>

      {version === "server" ? (
        <p className="text-footnote text-label-secondary">Loading your private shelf…</p>
      ) : empty ? (
        <EmptyState
          icon="magnifier"
          title={q ? `Nothing in your shelf matches “${q}”` : "Your shelf is empty"}
          message={
            q
              ? "Try fewer keywords, or clear the search."
              : "Favorite or fork a public prompt, or create a brand-new draft."
          }
          action={
            q ? (
              <ButtonLink href="/library" variant="tinted">
                Clear search
              </ButtonLink>
            ) : (
              <ButtonLink href="/new" variant="filled" icon="plus">
                Add a draft
              </ButtonLink>
            )
          }
        />
      ) : (
        <div className="flex flex-col gap-10">
          {drafts.length > 0 && (
            <section>
              <SectionHeader title="Private drafts" subtitle="Created or forked in this browser." />
              <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 2xl:grid-cols-3">
                {drafts.map((prompt) => (
                  <li key={prompt.id}>
                    <PersonalPromptCard prompt={prompt} />
                  </li>
                ))}
              </ul>
            </section>
          )}

          {favoriteCount > 0 && (
            <section>
              <SectionHeader title="Favorites" subtitle="Saved locally, never sent to the server." />
              <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 2xl:grid-cols-3">
                {favoritePersonal.map((prompt) => (
                  <li key={`personal-${prompt.id}`}>
                    <PersonalPromptCard prompt={prompt} />
                  </li>
                ))}
                {filteredFavoritePublic.map((prompt) => (
                  <li key={`public-${prompt.id}`}>
                    <PromptCard prompt={prompt} className="w-full" />
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
