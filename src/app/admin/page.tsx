import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { moderatePromptAction, toggleFeaturedAction } from "@/app/actions/prompts";
import { Avatar } from "@/components/ui/Avatar";
import { Icon } from "@/components/ui/Icon";
import { TypeGlyph } from "@/components/ui/TypeGlyph";
import { EmptyState, Stat } from "@/components/ui/Surface";
import { currentUser } from "@/lib/auth";
import { libraryStats, searchPrompts } from "@/lib/prompts";
import { getPromptType } from "@/lib/taxonomy";
import { countUsers } from "@/lib/users";
import { formatCount, relativeTime, truncate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Moderation",
  description: "Review community prompt submissions.",
};

export default async function AdminPage() {
  const user = await currentUser();
  if (!user) redirect("/signin?next=/admin");
  if (user.role !== "admin") redirect("/");

  const queue = searchPrompts({
    statuses: ["pending"],
    sort: "recent",
    perPage: 40,
    viewerId: user.id,
  });

  const published = searchPrompts({
    statuses: ["published"],
    sort: "recent",
    perPage: 8,
    viewerId: user.id,
  });

  const stats = libraryStats();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <header className="mb-6">
        <h1 className="text-title-1 text-label">Moderation</h1>
        <p className="mt-1 text-subheadline text-label-secondary">
          Community submissions waiting on a decision. Approving publishes immediately.
        </p>
      </header>

      <div className="mb-8 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat value={String(queue.total)} label="In review" icon="clock" />
        <Stat value={formatCount(stats.prompts)} label="Published" icon="globe" />
        <Stat value={formatCount(stats.copies)} label="Copies" icon="copy" />
        <Stat value={formatCount(countUsers())} label="Members" icon="person" />
      </div>

      {queue.prompts.length === 0 ? (
        <EmptyState
          icon="checkmarkCircleFill"
          title="Queue is clear"
          message="Nothing is waiting for review right now."
        />
      ) : (
        <ul className="flex flex-col gap-4">
          {queue.prompts.map((prompt) => {
            const type = getPromptType(prompt.promptType);

            return (
              <li
                key={prompt.id}
                className="overflow-hidden rounded-[var(--r-xl)] border border-separator bg-card"
              >
                <div className="flex items-start gap-3 p-4">
                  {type && <TypeGlyph icon={type.icon} accent={type.accent} size={38} filled />}

                  <div className="min-w-0 flex-1">
                    <p className="text-caption-1 text-label-secondary">{type?.name}</p>
                    <h2 className="text-headline text-label">
                      <Link href={`/p/${prompt.slug}`} className="hover:underline">
                        {prompt.title}
                      </Link>
                    </h2>
                    <p className="mt-1 truncate-2 text-footnote text-label-secondary">
                      {prompt.summary}
                    </p>

                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-caption-1 text-label-tertiary">
                      {prompt.author && (
                        <span className="flex items-center gap-1.5">
                          <Avatar
                            name={prompt.author.name}
                            handle={prompt.author.handle}
                            size={16}
                          />
                          {prompt.author.name}
                        </span>
                      )}
                      <span>submitted {relativeTime(prompt.createdAt)}</span>
                      <span>{prompt.body.length} chars</span>
                    </div>
                  </div>

                  <Link
                    href={`/p/${prompt.slug}`}
                    className="pressable flex size-9 shrink-0 items-center justify-center rounded-full bg-fill-tertiary text-label-secondary"
                    aria-label="Open prompt"
                  >
                    <Icon name="arrowUpRight" size={16} strokeWidth={1.9} />
                  </Link>
                </div>

                <pre className="mx-4 max-h-32 overflow-hidden rounded-[var(--r-md)] bg-fill-quaternary p-3 font-mono text-caption-1 leading-relaxed text-label-secondary">
                  {truncate(prompt.body, 420)}
                </pre>

                <div className="mt-4 flex flex-col gap-2 border-t border-separator p-4 sm:flex-row sm:items-center">
                  <form action={moderatePromptAction} className="flex flex-1 items-center gap-2">
                    <input type="hidden" name="id" value={prompt.id} />
                    <input type="hidden" name="decision" value="rejected" />
                    <input
                      type="text"
                      name="note"
                      maxLength={400}
                      placeholder="Reason for changes (shown to the author)"
                      className="h-9 min-w-0 flex-1 rounded-[var(--r-sm)] border border-separator bg-fill-quaternary px-3 text-footnote text-label outline-none focus:border-[var(--sys-blue)]"
                    />
                    <button
                      type="submit"
                      className="pressable h-9 shrink-0 rounded-[var(--r-sm)] bg-[color-mix(in_srgb,var(--sys-red)_12%,transparent)] px-3 text-footnote font-semibold text-[var(--sys-red)]"
                    >
                      Request changes
                    </button>
                  </form>

                  <form action={moderatePromptAction} className="shrink-0">
                    <input type="hidden" name="id" value={prompt.id} />
                    <input type="hidden" name="decision" value="published" />
                    <input type="hidden" name="note" value="" />
                    <button
                      type="submit"
                      className="pressable inline-flex h-9 items-center gap-1.5 rounded-[var(--r-sm)] bg-[var(--sys-blue)] px-4 text-footnote font-semibold text-white"
                    >
                      <Icon name="checkmark" size={14} strokeWidth={2.6} />
                      Publish
                    </button>
                  </form>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <section className="mt-10">
        <h2 className="mb-3 text-title-3 text-label">Recently published</h2>
        <div className="overflow-hidden rounded-[var(--r-xl)] border border-separator bg-card">
          {published.prompts.map((prompt) => (
            <div
              key={prompt.id}
              className="flex items-center gap-3 px-4 py-3 not-last:hairline-b"
            >
              <div className="min-w-0 flex-1">
                <Link
                  href={`/p/${prompt.slug}`}
                  className="block truncate text-subheadline font-medium text-label hover:underline"
                >
                  {prompt.title}
                </Link>
                <p className="truncate text-caption-1 text-label-tertiary">
                  {getPromptType(prompt.promptType)?.name} · {relativeTime(prompt.publishedAt)}
                </p>
              </div>

              <form action={toggleFeaturedAction}>
                <input type="hidden" name="id" value={prompt.id} />
                <button
                  type="submit"
                  aria-label={prompt.featured ? "Remove from featured" : "Mark as featured"}
                  title={prompt.featured ? "Remove from featured" : "Mark as featured"}
                  className="pressable flex size-9 items-center justify-center rounded-full text-label-tertiary transition-colors hover:bg-fill-tertiary"
                  style={prompt.featured ? { color: "var(--sys-yellow)" } : undefined}
                >
                  <Icon name={prompt.featured ? "starFill" : "star"} size={17} strokeWidth={1.8} />
                </button>
              </form>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
