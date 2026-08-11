import Link from "next/link";

import { CopyButton } from "@/components/CopyButton";
import { FavoriteButton } from "@/components/FavoriteButton";
import { Avatar } from "@/components/ui/Avatar";
import { Icon } from "@/components/ui/Icon";
import { Badge } from "@/components/ui/Surface";
import { TagList } from "@/components/ui/Chip";
import { TypeGlyph } from "@/components/ui/TypeGlyph";
import type { Prompt, PromptStatus } from "@/lib/prompts";
import { getCategory, getPromptType } from "@/lib/taxonomy";
import { cx, formatCount, relativeTime } from "@/lib/utils";
import { extractVariables } from "@/lib/variables";

const STATUS_META: Record<PromptStatus, { label: string; tone: "neutral" | "orange" | "red" | "green" }> = {
  private: { label: "Private", tone: "neutral" },
  pending: { label: "In review", tone: "orange" },
  rejected: { label: "Changes requested", tone: "red" },
  published: { label: "Published", tone: "green" },
};

export function StatusBadge({ status }: { status: PromptStatus }) {
  const meta = STATUS_META[status];
  return <Badge tone={meta.tone}>{meta.label}</Badge>;
}

export function PromptCard({
  prompt,
  signedIn,
  showStatus,
  className,
}: {
  prompt: Prompt;
  signedIn: boolean;
  showStatus?: boolean;
  className?: string;
}) {
  const type = getPromptType(prompt.promptType);
  const category = getCategory(prompt.category);
  const variableCount = extractVariables(prompt.body).length;

  return (
    <article
      className={cx(
        "group relative flex flex-col rounded-[var(--r-xl)] border border-separator bg-card p-4",
        "transition-[transform,box-shadow,border-color] duration-[var(--duration-standard)] ease-[var(--ease-standard)]",
        "hover:-translate-y-0.5 hover:border-[color-mix(in_srgb,var(--label)_12%,transparent)] hover:shadow-2",
        className,
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
            {prompt.featured && (
              <span className="text-[var(--sys-yellow)]" title="Featured">
                <Icon name="starFill" size={11} />
              </span>
            )}
          </div>

          <h3 className="mt-0.5 truncate-2 text-headline leading-snug text-label">
            <Link href={`/p/${prompt.slug}`} className="hover:underline">
              <span className="absolute inset-0 rounded-[var(--r-xl)]" aria-hidden="true" />
              {prompt.title}
            </Link>
          </h3>
        </div>

        <div className="relative z-10 flex shrink-0 items-center gap-0.5">
          {showStatus && prompt.status !== "published" && <StatusBadge status={prompt.status} />}
          <FavoriteButton
            promptId={prompt.id}
            saved={prompt.isFavorite}
            signedIn={signedIn}
            size={32}
          />
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
        {prompt.author ? (
          <Link
            href={`/u/${prompt.author.handle}`}
            className="relative z-10 flex min-w-0 items-center gap-1.5 text-caption-1 text-label-secondary transition-colors hover:text-label"
          >
            <Avatar name={prompt.author.name} handle={prompt.author.handle} size={18} />
            <span className="truncate">{prompt.author.name}</span>
          </Link>
        ) : (
          <span className="text-caption-1 text-label-tertiary">Unknown author</span>
        )}

        <span className="text-label-quaternary">·</span>
        <span className="shrink-0 text-caption-1 text-label-tertiary">
          {relativeTime(prompt.publishedAt ?? prompt.createdAt)}
        </span>

        <div className="ml-auto flex shrink-0 items-center gap-2.5">
          <span
            className="flex items-center gap-1 text-caption-1 tabular-nums text-label-tertiary"
            title={`${prompt.copies} copies`}
          >
            <Icon name="copy" size={12} strokeWidth={1.9} />
            {formatCount(prompt.copies)}
          </span>
          <span className="relative z-10">
            <CopyButton
              text={prompt.body}
              promptId={prompt.id}
              variant="gray"
              size="sm"
              iconOnly
              label="Copy prompt"
            />
          </span>
        </div>
      </div>
    </article>
  );
}

/** Dense one-line variant for sidebars and related lists. */
export function PromptRow({ prompt }: { prompt: Prompt }) {
  const type = getPromptType(prompt.promptType);

  return (
    <Link
      href={`/p/${prompt.slug}`}
      className="flex items-center gap-3 px-4 py-3 transition-colors not-last:hairline-b hover:bg-fill-quaternary"
    >
      {type && <TypeGlyph icon={type.icon} accent={type.accent} size={32} />}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-subheadline font-medium text-label">{prompt.title}</span>
        <span className="block truncate text-caption-1 text-label-secondary">
          {type?.name} · {formatCount(prompt.copies)} copies
        </span>
      </span>
      <Icon name="chevronRight" size={15} className="shrink-0 text-label-tertiary" />
    </Link>
  );
}
