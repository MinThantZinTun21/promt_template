import Link from "next/link";

import { HeroSearch } from "@/components/HeroSearch";
import { PromptCard, PromptRow } from "@/components/PromptCard";
import { TypeGrid } from "@/components/TypeGrid";
import { ButtonLink } from "@/components/ui/Button";
import { ChipLink } from "@/components/ui/Chip";
import { Icon } from "@/components/ui/Icon";
import { SectionHeader } from "@/components/ui/Surface";
import { countsByType, libraryStats, searchPrompts, topTags } from "@/lib/prompts";
import { CATEGORIES, PROMPT_TYPES } from "@/lib/taxonomy";
import { formatCount } from "@/lib/utils";

export const dynamic = "force-dynamic";

const SUGGESTIONS = ["json extraction", "code review", "chain of thought", "product photo"];

export default function HomePage() {
  const stats = libraryStats();
  const typeCounts = countsByType();
  const featured = searchPrompts({ featuredOnly: true, perPage: 6, sort: "popular" });
  const recent = searchPrompts({ perPage: 5, sort: "recent" });
  const tags = topTags(12);

  return (
    <>
      <section className="relative overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(1100px 520px at 50% -180px, color-mix(in srgb, var(--sys-blue) 16%, transparent), transparent 70%)",
          }}
        />

        <div className="relative mx-auto max-w-3xl px-4 pb-12 pt-14 text-center sm:px-6 sm:pb-16 sm:pt-20">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-separator bg-card px-3 py-1 text-footnote text-label-secondary shadow-1">
            <Icon name="layers" size={13} className="text-[var(--sys-blue)]" />
            {PROMPT_TYPES.length} prompt types, one shelf
          </span>

          <h1 className="mt-5 text-large-title text-label">
            Find the prompt shape
            <br className="hidden sm:block" /> you actually need.
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-body text-label-secondary">
            An open library of prompt templates, filed by what the prompt does — not by vibes.
            Search it, fill in the blanks, copy it into your tool of choice. Personal drafts stay on this device.
          </p>

          <div className="mx-auto mt-7 max-w-xl">
            <HeroSearch suggestions={SUGGESTIONS} />
          </div>

          <dl className="mx-auto mt-8 flex max-w-md items-center justify-center gap-6 text-center sm:gap-10">
            {[
              { label: "Prompts", value: formatCount(stats.prompts) },
              { label: "Types", value: String(PROMPT_TYPES.length) },
              { label: "Copied", value: formatCount(stats.copies) },
            ].map((item) => (
              <div key={item.label}>
                <dt className="text-caption-1 uppercase tracking-[0.06em] text-label-tertiary">
                  {item.label}
                </dt>
                <dd className="text-title-3 tabular-nums text-label">{item.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 pb-8 sm:px-6">
        <section className="mb-14">
          <SectionHeader
            title="Browse by prompt type"
            subtitle="Every prompt is filed under one of these fixed types."
            action={
              <ButtonLink href="/types" variant="plain" size="sm" iconTrailing="chevronRight">
                See all
              </ButtonLink>
            }
          />
          <TypeGrid counts={typeCounts} limit={9} />
        </section>

        <section className="mb-14">
          <SectionHeader
            title="Featured prompts"
            subtitle="Hand-picked templates that hold up in real work."
            action={
              <ButtonLink
                href="/browse?sort=popular"
                variant="plain"
                size="sm"
                iconTrailing="chevronRight"
              >
                Most used
              </ButtonLink>
            }
          />
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {featured.prompts.map((prompt) => (
              <PromptCard key={prompt.id} prompt={prompt} />
            ))}
          </div>
        </section>

        <section className="mb-14 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <SectionHeader title="Recently added" subtitle="The newest additions to the shelf." />
            <div className="overflow-hidden rounded-[var(--r-xl)] border border-separator bg-card">
              {recent.prompts.map((prompt) => (
                <PromptRow key={prompt.id} prompt={prompt} />
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div>
              <SectionHeader title="By discipline" />
              <div className="flex flex-wrap gap-1.5">
                {CATEGORIES.map((category) => (
                  <ChipLink
                    key={category.id}
                    href={`/browse?category=${category.id}`}
                    icon={category.icon}
                  >
                    {category.name}
                  </ChipLink>
                ))}
              </div>
            </div>

            <div>
              <SectionHeader title="Popular tags" />
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <ChipLink
                    key={tag.tag}
                    href={`/browse?tag=${encodeURIComponent(tag.tag)}`}
                    count={tag.count}
                  >
                    {tag.tag}
                  </ChipLink>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-[var(--r-2xl)] border border-separator bg-card">
          <div className="flex flex-col items-start gap-5 p-6 sm:flex-row sm:items-center sm:p-8">
            <span
              className="flex size-12 shrink-0 items-center justify-center rounded-[14px] text-white"
              style={{
                background:
                  "linear-gradient(160deg, var(--sys-blue), color-mix(in srgb, var(--sys-indigo) 82%, black))",
              }}
            >
              <Icon name="sparkles" size={24} strokeWidth={1.7} />
            </span>

            <div className="min-w-0 flex-1">
              <h2 className="text-title-3 text-label">Got a prompt that earns its keep?</h2>
              <p className="mt-1 text-subheadline text-label-secondary">
                Fork a public template or write your own. New prompts stay in your private shelf on
                this device — the public library remains the shared, seeded collection.
              </p>
            </div>

            <div className="flex shrink-0 gap-2">
              <ButtonLink href="/new" variant="filled" icon="plus">
                Add a draft
              </ButtonLink>
              <ButtonLink href="/browse?sort=recent" variant="gray">
                See what&rsquo;s new
              </ButtonLink>
            </div>
          </div>
        </section>

        <p className="mt-8 text-center text-footnote text-label-tertiary">
          Looking for something specific?{" "}
          <Link href="/browse" className="font-medium text-[var(--sys-blue)]">
            Browse the whole library
          </Link>{" "}
          or press <kbd className="rounded bg-fill-tertiary px-1 py-0.5 text-caption-2">⌘K</kbd>.
        </p>
      </div>
    </>
  );
}
