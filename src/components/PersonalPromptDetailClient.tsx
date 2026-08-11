"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useSyncExternalStore } from "react";

import { CopyButton } from "@/components/CopyButton";
import { FavoriteButton } from "@/components/FavoriteButton";
import { PersonalForkButton } from "@/components/PersonalForkButton";
import { PromptComposer } from "@/components/PromptComposer";
import { ShareButton } from "@/components/ShareButton";
import { Button } from "@/components/ui/Button";
import { ChipLink } from "@/components/ui/Chip";
import { FormBanner } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { TypeGlyph } from "@/components/ui/TypeGlyph";
import {
  getPersonalPrompt,
  subscribePersonalStore,
  type PersonalFavoriteKey,
  type PersonalPromptRecord,
} from "@/lib/personal-store";
import { getCategory, getPromptType } from "@/lib/taxonomy";
import { formatDate, relativeTime, truncate } from "@/lib/utils";

function snapshotPersonalPrompt(id: string) {
  return JSON.stringify(getPersonalPrompt(id) ?? null);
}

export function PersonalPromptDetailClient({ personalId }: { personalId: string }) {
  const router = useRouter();
  const snapshot = useSyncExternalStore(
    subscribePersonalStore,
    () => snapshotPersonalPrompt(personalId),
    () => "pending",
  );
  const record = useMemo(() => {
    if (snapshot === "pending") return undefined;
    return JSON.parse(snapshot) as PersonalPromptRecord | null;
  }, [snapshot]);

  if (record === undefined) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <p className="text-footnote text-label-secondary">Loading your private draft…</p>
      </div>
    );
  }

  if (!record) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <FormBanner tone="error">That private prompt no longer exists.</FormBanner>
      </div>
    );
  }

  const type = getPromptType(record.promptType);
  const category = getCategory(record.category);
  const favoriteKey: PersonalFavoriteKey = `personal:${record.id}`;

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <nav aria-label="Breadcrumb" className="mb-5 flex flex-wrap items-center gap-1 text-footnote">
        <Link href="/library" className="text-[var(--sys-blue)] hover:underline">
          Library
        </Link>
        <Icon name="chevronRight" size={12} className="text-label-quaternary" strokeWidth={2.2} />
        <span className="truncate text-label-secondary">{truncate(record.title, 80)}</span>
      </nav>

      <header className="mb-6 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 gap-4">
          {type && <TypeGlyph icon={type.icon} accent={type.accent} size={52} filled />}

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full bg-fill-tertiary px-3 py-1 text-footnote font-semibold text-label-secondary">
                <Icon name="lock" size={14} strokeWidth={2} />
                Private shelf
              </span>
              {category && (
                <span className="rounded-full bg-fill-quaternary px-2.5 py-0.5 text-footnote text-label-secondary">
                  {category.name}
                </span>
              )}
            </div>

            <h1 className="mt-1 text-title-1 text-label">{record.title}</h1>
            <p className="mt-2 max-w-2xl text-body text-label-secondary">{record.summary}</p>

            <div className="mt-3.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-footnote text-label-tertiary">
              <span className="flex items-center gap-1">
                <Icon name="clock" size={13} />
                Updated {relativeTime(record.updatedAt)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <CopyButton text={record.body} promptId={record.id} label="Copy prompt" />
          <FavoriteButton favoriteKey={favoriteKey} withLabel />
          <PersonalForkButton prompt={record} withLabel />
          <Button
            type="button"
            variant="bordered"
            icon="pencil"
            onClick={() => router.push(`/p/${record.id}/edit`)}
          >
            Edit
          </Button>
          <ShareButton title={record.title} />
        </div>
      </header>

      <PromptComposer body={record.body} promptId={record.id} />

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-6">
          {record.usageNotes && (
            <section className="rounded-[var(--r-xl)] border border-separator bg-card p-5">
              <h2 className="flex items-center gap-2 text-headline text-label">
                <span className="text-[var(--sys-orange)]">
                  <Icon name="infoCircle" size={18} strokeWidth={1.9} />
                </span>
                How to get the most out of it
              </h2>
              <p className="mt-2 text-subheadline leading-relaxed text-label-secondary">
                {record.usageNotes}
              </p>
            </section>
          )}

          {record.base && (
            <p className="flex items-center gap-2 text-footnote text-label-secondary">
              <Icon name="fork" size={14} />
              Forked from{" "}
              <Link href={`/p/${record.base.publicSlug}`} className="font-medium text-[var(--sys-blue)]">
                {record.base.publicTitle}
              </Link>
            </p>
          )}
        </div>

        <aside className="flex flex-col gap-4">
          <section className="rounded-[var(--r-xl)] border border-separator bg-card p-4">
            <h2 className="mb-3 text-caption-1 font-semibold uppercase tracking-[0.06em] text-label-tertiary">
              Details
            </h2>

            <dl className="flex flex-col gap-3 text-subheadline">
              <div className="flex items-baseline justify-between gap-3">
                <dt className="text-label-secondary">Prompt type</dt>
                <dd className="text-right">
                  {type ? (
                    <Link href={`/types/${record.promptType}`} className="font-medium text-[var(--sys-blue)]">
                      {type.name}
                    </Link>
                  ) : (
                    <span className="font-medium text-[var(--sys-blue)]">{record.promptType}</span>
                  )}
                </dd>
              </div>

              <div className="flex items-baseline justify-between gap-3">
                <dt className="text-label-secondary">Discipline</dt>
                <dd className="text-right">
                  {category ? (
                    <Link
                      href={`/browse?category=${record.category}`}
                      className="font-medium text-[var(--sys-blue)]"
                    >
                      {category.name}
                    </Link>
                  ) : (
                    <span className="font-medium text-[var(--sys-blue)]">{record.category}</span>
                  )}
                </dd>
              </div>

              <div className="flex items-baseline justify-between gap-3">
                <dt className="text-label-secondary">Updated</dt>
                <dd className="text-right text-label">{formatDate(record.updatedAt)}</dd>
              </div>
            </dl>

            {record.models.length > 0 && (
              <>
                <h3 className="mb-2 mt-4 text-caption-1 font-semibold uppercase tracking-[0.06em] text-label-tertiary">
                  Works well with
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {record.models.map((model) => (
                    <ChipLink key={model} href={`/browse?model=${encodeURIComponent(model)}`}>
                      {model}
                    </ChipLink>
                  ))}
                </div>
              </>
            )}

            {record.tags.length > 0 && (
              <>
                <h3 className="mb-2 mt-4 text-caption-1 font-semibold uppercase tracking-[0.06em] text-label-tertiary">
                  Tags
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {record.tags.map((tag) => (
                    <ChipLink key={tag} href={`/browse?tag=${encodeURIComponent(tag)}`}>
                      {tag}
                    </ChipLink>
                  ))}
                </div>
              </>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
