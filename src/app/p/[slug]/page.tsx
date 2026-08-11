import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { forkPromptAction } from "@/app/actions/prompts";
import { CopyButton } from "@/components/CopyButton";
import { FavoriteButton } from "@/components/FavoriteButton";
import { PromptComposer } from "@/components/PromptComposer";
import { PromptRow, StatusBadge } from "@/components/PromptCard";
import { ShareButton } from "@/components/ShareButton";
import { Avatar } from "@/components/ui/Avatar";
import { ButtonLink } from "@/components/ui/Button";
import { ChipLink } from "@/components/ui/Chip";
import { FormBanner } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { SectionHeader } from "@/components/ui/Surface";
import { TypeGlyph } from "@/components/ui/TypeGlyph";
import { canEditPrompt, currentUser } from "@/lib/auth";
import { getPromptBySlug, incrementViews, relatedPrompts } from "@/lib/prompts";
import { getCategory, getPromptType } from "@/lib/taxonomy";
import { formatCount, formatDate, relativeTime, truncate } from "@/lib/utils";
import type { RawSearchParams } from "@/lib/search-params";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const prompt = getPromptBySlug(slug);
  if (!prompt) return { title: "Prompt not found" };

  // Unpublished prompts are still reachable by their author, but never indexed.
  if (prompt.status !== "published") {
    return { title: prompt.title, robots: { index: false, follow: false } };
  }

  const type = getPromptType(prompt.promptType);

  return {
    title: prompt.title,
    description: truncate(prompt.summary, 160),
    openGraph: {
      title: `${prompt.title} — ${type?.name ?? "prompt"} template`,
      description: truncate(prompt.summary, 200),
      type: "article",
    },
  };
}

export default async function PromptPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<RawSearchParams>;
}) {
  const { slug } = await params;
  const raw = await searchParams;
  const user = await currentUser();
  const prompt = getPromptBySlug(slug, user?.id ?? null);

  if (!prompt) notFound();

  const isOwner = canEditPrompt(user, prompt.author?.id ?? null);
  if (prompt.status !== "published" && !isOwner) notFound();

  if (prompt.status === "published" && prompt.author?.id !== user?.id) {
    incrementViews(prompt.id);
  }

  const type = getPromptType(prompt.promptType);
  const category = getCategory(prompt.category);
  const related = relatedPrompts(prompt, user?.id ?? null, 5);
  const justSubmitted = raw.submitted === "1";

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <nav aria-label="Breadcrumb" className="mb-5 flex flex-wrap items-center gap-1 text-footnote">
        <Link href="/browse" className="text-[var(--sys-blue)] hover:underline">
          Browse
        </Link>
        <Icon name="chevronRight" size={12} className="text-label-quaternary" strokeWidth={2.2} />
        <Link href={`/types/${prompt.promptType}`} className="text-[var(--sys-blue)] hover:underline">
          {type?.name ?? prompt.promptType}
        </Link>
        <Icon name="chevronRight" size={12} className="text-label-quaternary" strokeWidth={2.2} />
        <span className="truncate text-label-secondary">{prompt.title}</span>
      </nav>

      {justSubmitted && (
        <div className="mb-5">
          <FormBanner tone="success">
            Submitted for review. Your prompt is visible to you now and will appear in the public
            library once a reviewer approves it.
          </FormBanner>
        </div>
      )}

      {prompt.status === "rejected" && isOwner && (
        <div className="mb-5">
          <FormBanner tone="error">
            A reviewer asked for changes{prompt.reviewNote ? `: ${prompt.reviewNote}` : "."} Edit the
            prompt and submit it again.
          </FormBanner>
        </div>
      )}

      <header className="mb-6 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 gap-4">
          {type && <TypeGlyph icon={type.icon} accent={type.accent} size={52} filled />}

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={`/types/${prompt.promptType}`}
                className="text-footnote font-medium text-label-secondary hover:text-label"
              >
                {type?.name ?? prompt.promptType}
              </Link>
              {prompt.status !== "published" && <StatusBadge status={prompt.status} />}
              {prompt.featured && (
                <span className="flex items-center gap-1 text-footnote text-[var(--sys-yellow)]">
                  <Icon name="starFill" size={12} /> Featured
                </span>
              )}
            </div>

            <h1 className="mt-1 text-title-1 text-label">{prompt.title}</h1>
            <p className="mt-2 max-w-2xl text-body text-label-secondary">{prompt.summary}</p>

            <div className="mt-3.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-footnote text-label-tertiary">
              {prompt.author && (
                <Link
                  href={`/u/${prompt.author.handle}`}
                  className="flex items-center gap-1.5 text-label-secondary transition-colors hover:text-label"
                >
                  <Avatar name={prompt.author.name} handle={prompt.author.handle} size={20} />
                  {prompt.author.name}
                </Link>
              )}
              <span className="flex items-center gap-1">
                <Icon name="clock" size={13} />
                {relativeTime(prompt.publishedAt ?? prompt.createdAt)}
              </span>
              <span className="flex items-center gap-1 tabular-nums">
                <Icon name="copy" size={13} />
                {formatCount(prompt.copies)}
              </span>
              <span className="flex items-center gap-1 tabular-nums">
                <Icon name="bookmark" size={13} />
                {formatCount(prompt.saves)}
              </span>
              <span className="flex items-center gap-1 tabular-nums">
                <Icon name="eye" size={13} />
                {formatCount(prompt.views)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <CopyButton text={prompt.body} promptId={prompt.id} label="Copy prompt" />
          <FavoriteButton
            promptId={prompt.id}
            saved={prompt.isFavorite}
            signedIn={Boolean(user)}
            withLabel
          />
          <form action={forkPromptAction}>
            <input type="hidden" name="id" value={prompt.id} />
            <button
              type="submit"
              className="pressable inline-flex h-10 items-center gap-2 rounded-[var(--r-md)] bg-fill-tertiary px-4 text-subheadline font-semibold text-label transition-colors hover:bg-fill-secondary"
              title="Copy this prompt into your own private draft"
            >
              <Icon name="fork" size={17} strokeWidth={1.85} />
              Fork
            </button>
          </form>
          <ShareButton title={prompt.title} />
          {isOwner && (
            <ButtonLink href={`/p/${prompt.slug}/edit`} variant="bordered" icon="pencil">
              Edit
            </ButtonLink>
          )}
        </div>
      </header>

      <PromptComposer body={prompt.body} promptId={prompt.id} />

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-6">
          {prompt.usageNotes && (
            <section className="rounded-[var(--r-xl)] border border-separator bg-card p-5">
              <h2 className="flex items-center gap-2 text-headline text-label">
                <span className="text-[var(--sys-orange)]">
                  <Icon name="infoCircle" size={18} strokeWidth={1.9} />
                </span>
                How to get the most out of it
              </h2>
              <p className="mt-2 text-subheadline leading-relaxed text-label-secondary">
                {prompt.usageNotes}
              </p>
            </section>
          )}

          {prompt.forkedFrom && (
            <p className="flex items-center gap-2 text-footnote text-label-secondary">
              <Icon name="fork" size={14} />
              Forked from{" "}
              <Link href={`/p/${prompt.forkedFrom.slug}`} className="font-medium text-[var(--sys-blue)]">
                {prompt.forkedFrom.title}
              </Link>
            </p>
          )}

          {related.length > 0 && (
            <section>
              <SectionHeader
                title="Related prompts"
                subtitle={`More ${type?.name.toLowerCase() ?? "similar"} templates and neighbours.`}
              />
              <div className="overflow-hidden rounded-[var(--r-xl)] border border-separator bg-card">
                {related.map((item) => (
                  <PromptRow key={item.id} prompt={item} />
                ))}
              </div>
            </section>
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
                  <Link href={`/types/${prompt.promptType}`} className="font-medium text-[var(--sys-blue)]">
                    {type?.name}
                  </Link>
                </dd>
              </div>

              <div className="flex items-baseline justify-between gap-3">
                <dt className="text-label-secondary">Discipline</dt>
                <dd className="text-right">
                  <Link
                    href={`/browse?category=${prompt.category}`}
                    className="font-medium text-[var(--sys-blue)]"
                  >
                    {category?.name}
                  </Link>
                </dd>
              </div>

              <div className="flex items-baseline justify-between gap-3">
                <dt className="text-label-secondary">Updated</dt>
                <dd className="text-right text-label">{formatDate(prompt.updatedAt)}</dd>
              </div>
            </dl>

            {prompt.models.length > 0 && (
              <>
                <h3 className="mb-2 mt-4 text-caption-1 font-semibold uppercase tracking-[0.06em] text-label-tertiary">
                  Works well with
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {prompt.models.map((model) => (
                    <ChipLink key={model} href={`/browse?model=${encodeURIComponent(model)}`}>
                      {model}
                    </ChipLink>
                  ))}
                </div>
              </>
            )}

            {prompt.tags.length > 0 && (
              <>
                <h3 className="mb-2 mt-4 text-caption-1 font-semibold uppercase tracking-[0.06em] text-label-tertiary">
                  Tags
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {prompt.tags.map((tag) => (
                    <ChipLink key={tag} href={`/browse?tag=${encodeURIComponent(tag)}`}>
                      {tag}
                    </ChipLink>
                  ))}
                </div>
              </>
            )}
          </section>

          {prompt.author && (
            <section className="rounded-[var(--r-xl)] border border-separator bg-card p-4">
              <h2 className="mb-3 text-caption-1 font-semibold uppercase tracking-[0.06em] text-label-tertiary">
                Contributed by
              </h2>
              <Link href={`/u/${prompt.author.handle}`} className="flex items-center gap-3">
                <Avatar name={prompt.author.name} handle={prompt.author.handle} size={40} />
                <span className="min-w-0">
                  <span className="block truncate text-subheadline font-semibold text-label">
                    {prompt.author.name}
                  </span>
                  <span className="block truncate text-footnote text-label-secondary">
                    @{prompt.author.handle}
                  </span>
                </span>
                <Icon name="chevronRight" size={15} className="ml-auto text-label-tertiary" />
              </Link>
            </section>
          )}

          <section className="rounded-[var(--r-xl)] border border-separator bg-card p-4">
            <h2 className="text-caption-1 font-semibold uppercase tracking-[0.06em] text-label-tertiary">
              Template syntax
            </h2>
            <p className="mt-2 text-footnote text-label-secondary">
              Placeholders look like <code className="ps-var text-caption-1">{"{{topic}}"}</code>, and
              a suggested value can follow a pipe:{" "}
              <code className="ps-var text-caption-1">{"{{tone | friendly}}"}</code>. Fill them in
              above and the copy button takes your filled version.
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}
