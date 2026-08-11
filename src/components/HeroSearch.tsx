"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { SearchField } from "@/components/ui/SearchField";
import { cx } from "@/lib/utils";

/** Home-page search that hands off to the browse page on submit. */
export function HeroSearch({ suggestions }: { suggestions: string[] }) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [pending, startTransition] = useTransition();

  const go = (query: string) => {
    const trimmed = query.trim();
    startTransition(() => {
      router.push(trimmed ? `/browse?q=${encodeURIComponent(trimmed)}` : "/browse");
    });
  };

  return (
    <div className="w-full">
      <SearchField
        value={value}
        onChange={setValue}
        onSubmit={() => go(value)}
        placeholder="Search 40+ prompt templates"
        size="lg"
        busy={pending}
        className="shadow-2"
        ariaLabel="Search prompt templates"
      />

      <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5">
        <span className="text-footnote text-label-tertiary">Try</span>
        {suggestions.map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            onClick={() => {
              setValue(suggestion);
              go(suggestion);
            }}
            className={cx(
              "pressable rounded-full bg-fill-tertiary px-2.5 py-1 text-footnote text-label-secondary",
              "transition-colors hover:bg-fill-secondary hover:text-label",
            )}
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}
