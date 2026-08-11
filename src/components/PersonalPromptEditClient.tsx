"use client";

import { useMemo, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";

import { ForkButton } from "@/components/ForkButton";
import { PersonalPromptForm, type PersonalPromptFormValues } from "@/components/PersonalPromptForm";
import { Button } from "@/components/ui/Button";
import { FormBanner } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { TypeGlyph } from "@/components/ui/TypeGlyph";
import {
  deletePersonalPrompt,
  getPersonalPrompt,
  subscribePersonalStore,
  type PersonalPromptRecord,
} from "@/lib/personal-store";
import type { Prompt } from "@/lib/prompts";
import { getCategory, getPromptType } from "@/lib/taxonomy";

function isPersonalId(id: string) {
  return id.startsWith("ps_");
}

function snapshotPersonalPrompt(id: string) {
  return JSON.stringify(getPersonalPrompt(id) ?? null);
}

export function PersonalPromptEditClient({
  slug,
  publicPrompt,
}: {
  slug: string;
  publicPrompt: Prompt | null;
}) {
  const router = useRouter();
  const snapshot = useSyncExternalStore(
    subscribePersonalStore,
    () => (isPersonalId(slug) ? snapshotPersonalPrompt(slug) : "null"),
    () => "pending",
  );
  const record = useMemo(() => {
    if (snapshot === "pending") return undefined;
    return JSON.parse(snapshot) as PersonalPromptRecord | null;
  }, [snapshot]);

  if (!isPersonalId(slug)) {
    if (!publicPrompt) {
      return (
        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
          <FormBanner tone="error">That prompt no longer exists.</FormBanner>
        </div>
      );
    }

    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <h1 className="text-title-1 text-label">Edit a private copy</h1>
        <p className="mt-2 text-subheadline text-label-secondary">
          Public prompts are read-only. Fork “{publicPrompt.title}” into your private shelf to edit it
          on this device.
        </p>
        <div className="mt-5">
          <ForkButton prompt={publicPrompt} withLabel />
        </div>
      </div>
    );
  }

  if (record === undefined) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <p className="text-footnote text-label-secondary">Loading your private draft…</p>
      </div>
    );
  }

  if (!record) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <FormBanner tone="error">That private prompt no longer exists.</FormBanner>
      </div>
    );
  }

  const initialValues: PersonalPromptFormValues = {
    id: record.id,
    base: record.base,
    title: record.title,
    summary: record.summary,
    body: record.body,
    usageNotes: record.usageNotes,
    promptType: record.promptType,
    category: record.category,
    tags: record.tags,
    models: record.models,
    contributor: record.contributor === "Anonymous" ? "" : record.contributor,
  };

  const type = getPromptType(record.promptType);
  const category = getCategory(record.category);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <nav aria-label="Breadcrumb" className="mb-5 flex items-center gap-1 text-footnote">
        <span className="text-label-secondary">Private shelf</span>
        <Icon name="chevronRight" size={12} className="text-label-quaternary" strokeWidth={2.2} />
        <span className="truncate text-label-secondary">
          {record.base?.publicTitle ?? "Edit"}
        </span>
      </nav>

      <header className="mb-7 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-title-1 text-label">Edit prompt</h1>
          <p className="mt-1.5 max-w-2xl text-subheadline text-label-secondary">
            This draft lives only in your browser. Fork, tweak, and save — no servers, no logins.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {type && <TypeGlyph icon={type.icon} accent={type.accent} size={44} filled />}
            {category && (
              <span className="rounded-full bg-fill-quaternary px-2.5 py-1 text-footnote text-label-secondary">
                {category.name}
              </span>
            )}
          </div>
        </div>
        <span className="rounded-full bg-fill-quaternary px-3 py-1 text-footnote font-semibold text-label-secondary">
          Private draft
        </span>
      </header>

      <PersonalPromptForm initial={initialValues} mode="edit" />

      <section className="mt-10 rounded-[var(--r-xl)] border border-[color-mix(in_srgb,var(--sys-red)_28%,var(--separator))] p-5">
        <h2 className="text-headline text-label">Delete this draft</h2>
        <p className="mt-1 text-footnote text-label-secondary">
          This removes it for you only. It cannot be undone.
        </p>

        <div className="mt-4">
          <Button
            type="button"
            variant="destructive"
            icon="trash"
            className="w-full sm:w-auto"
            onClick={() => {
              deletePersonalPrompt(record.id);
              router.push("/library");
            }}
          >
            Delete draft
          </Button>
        </div>
      </section>
    </div>
  );
}
