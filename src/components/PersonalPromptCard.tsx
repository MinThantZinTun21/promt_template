"use client";

import Link from "next/link";

import type { PersonalPromptRecord } from "@/lib/personal-store";
import { getCategory, getPromptType } from "@/lib/taxonomy";
import { cx, relativeTime } from "@/lib/utils";
import { extractVariables } from "@/lib/variables";
import { FavoriteButton } from "@/components/FavoriteButton";
import { PersonalForkButton } from "@/components/PersonalForkButton";
import { CopyButton } from "@/components/CopyButton";
import { Icon } from "@/components/ui/Icon";
import { TagList } from "@/components/ui/Chip";
import { TypeGlyph } from "@/components/ui/TypeGlyph";
import { Avatar } from "@/components/ui/Avatar";

export function PersonalPromptCard({ prompt }: { prompt: PersonalPromptRecord }) {
  const type = getPromptType(prompt.promptType);
  const category = getCategory(prompt.category);
  const variableCount = extractVariables(prompt.body).length;

  return (
    <article
      className={cx(
        "group relative flex flex-col rounded-[var(--r-xl)] border border-separator bg-card p-4",
        "transition-[transform,box-shadow,border-color] duration-[var(--duration-standard)] ease-[var(--ease-standard)]",
        "hover:-translate-y-0.5 hover:border-[color-mix(in_srgb,var(--label)_12%,transparent)] hover:shadow-2",
      )}
    >
      <div className="flex items-start gap-3">
        {type && <TypeGlyph icon={type.icon} accent={type.accent} size={38} />}

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <Link
              href={`/types/${prompt.promptType}`}
              className="truncate text-caption-1 font-medium text-label-secondary transition-colors hover:text-label"
            >
              {type?.name ?? prompt.promptType}
            </Link>
            <span
              className="inline-flex items-center gap-1 rounded-full bg-fill-quaternary px-2 py-0.5 text-caption-2 text-label-tertiary"
              title="Private draft"
            >
              <Icon name="lock" size={12} />
              Draft
            </span>
          </div>

          <h3 className="mt-0.5 truncate-2 text-headline leading-snug text-label">
            <Link href={`/p/${prompt.id}`} className="hover:underline">
              <span className="absolute inset-0 rounded-[var(--r-xl)]" aria-hidden="true" />
              {prompt.title}
            </Link>
          </h3>
        </div>

        <div className="relative z-10 flex shrink-0 items-center gap-1">
          <FavoriteButton favoriteKey={`personal:${prompt.id}`} />
          <PersonalForkButton prompt={prompt} withLabel={false} />
        </div>
      </div>

      <p className="mt-2.5 truncate-3 text-subheadline text-label-secondary">{prompt.summary}</p>

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        {category && (
          <span className="rounded-full bg-fill-quaternary px-2 py-0.5 text-caption-1 text-label-secondary">
            {category.name}
          </span>
        )}
        <TagList tags={prompt.tags} max={2} />
        {variableCount > 0 && (
          <span
            className="flex items-center gap-1 rounded-full px-2 py-0.5 text-caption-1"
            style={{
              color: "var(--sys-blue)",
              backgroundColor: "color-mix(in srgb, var(--sys-blue) 11%, transparent)",
            }}
            title={`${variableCount} fill-in variables`}
          >
            <Icon name="curlyBraces" size={11} strokeWidth={2} />
            {variableCount}
          </span>
        )}
      </div>

      <div className="mt-auto flex items-center gap-2 pt-4">
        <span className="flex min-w-0 items-center gap-1.5 text-caption-1 text-label-secondary">
          <Avatar name={prompt.contributor} size={18} />
          <span className="truncate">{prompt.contributor}</span>
        </span>
        <span className="ml-auto shrink-0 text-caption-1 text-label-tertiary">
          {relativeTime(prompt.updatedAt)}
        </span>
        <span className="ml-2 relative z-10">
          <CopyButton text={prompt.body} variant="gray" size="sm" iconOnly label="Copy prompt" />
        </span>
      </div>
    </article>
  );
}

