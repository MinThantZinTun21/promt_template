import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PromptBrowser } from "@/components/PromptBrowser";
import { Icon } from "@/components/ui/Icon";
import { TypeGlyph } from "@/components/ui/TypeGlyph";
import { countsByType } from "@/lib/prompts";
import { parseBrowseParams, type RawSearchParams } from "@/lib/search-params";
import { PROMPT_TYPES, getPromptType } from "@/lib/taxonomy";
import { pluralize } from "@/lib/utils";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return PROMPT_TYPES.map((type) => ({ id: type.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const type = getPromptType(id);
  if (!type) return { title: "Prompt type not found" };

  return {
    title: `${type.name} prompts`,
    description: type.description,
  };
}

export default async function TypePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<RawSearchParams>;
}) {
  const { id } = await params;
  const type = getPromptType(id);
  if (!type) notFound();

  const raw = await searchParams;
  const browseParams = parseBrowseParams(raw);
  const counts = countsByType();

  const index = PROMPT_TYPES.findIndex((item) => item.id === type.id);
  const previous = PROMPT_TYPES[index - 1];
  const next = PROMPT_TYPES[index + 1];

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <nav aria-label="Breadcrumb" className="mb-5 flex items-center gap-1 text-footnote">
        <Link href="/types" className="text-[var(--sys-blue)] hover:underline">
          Prompt types
        </Link>
        <Icon name="chevronRight" size={12} className="text-label-quaternary" strokeWidth={2.2} />
        <span className="text-label-secondary">{type.name}</span>
      </nav>

      <header className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-start">
        <TypeGlyph icon={type.icon} accent={type.accent} size={56} filled />

        <div className="min-w-0 flex-1">
          <h1 className="text-title-1 text-label">{type.name}</h1>
          <p className="mt-1.5 max-w-2xl text-body text-label-secondary">{type.description}</p>
          <p className="mt-3 text-footnote text-label-tertiary">
            {pluralize(counts[type.id] ?? 0, "public prompt")} · also known as{" "}
            {type.keywords.slice(0, 3).join(", ")}
          </p>
        </div>
      </header>

      <PromptBrowser
        pathname={`/types/${type.id}`}
        params={browseParams}
        lockedType={type.id}
      />

      <nav
        aria-label="Adjacent prompt types"
        className="hairline-t mt-12 flex items-center justify-between gap-4 pt-5"
      >
        {previous ? (
          <Link
            href={`/types/${previous.id}`}
            className="group flex min-w-0 items-center gap-2 text-subheadline text-label-secondary transition-colors hover:text-label"
          >
            <Icon
              name="chevronLeft"
              size={15}
              strokeWidth={2.2}
              className="shrink-0 transition-transform group-hover:-translate-x-0.5"
            />
            <span className="truncate">{previous.name}</span>
          </Link>
        ) : (
          <span />
        )}

        {next && (
          <Link
            href={`/types/${next.id}`}
            className="group flex min-w-0 items-center gap-2 text-subheadline text-label-secondary transition-colors hover:text-label"
          >
            <span className="truncate">{next.name}</span>
            <Icon
              name="chevronRight"
              size={15}
              strokeWidth={2.2}
              className="shrink-0 transition-transform group-hover:translate-x-0.5"
            />
          </Link>
        )}
      </nav>
    </div>
  );
}
