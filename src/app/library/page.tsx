import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { PromptCard } from "@/components/PromptCard";
import { ProfileEditor } from "@/components/ProfileEditor";
import { ButtonLink } from "@/components/ui/Button";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { EmptyState, Stat } from "@/components/ui/Surface";
import { currentUser } from "@/lib/auth";
import { authorStats, searchPrompts, type PromptStatus } from "@/lib/prompts";
import type { RawSearchParams } from "@/lib/search-params";
import { formatCount } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "My library",
  description: "Prompts you saved, published, and kept private.",
};

const TABS = [
  { id: "saved", label: "Saved" },
  { id: "published", label: "Published" },
  { id: "drafts", label: "Private & review" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default async function LibraryPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const user = await currentUser();
  if (!user) redirect("/signin?next=/library");

  const raw = await searchParams;
  const requested = typeof raw.tab === "string" ? raw.tab : "";
  const tab: TabId = TABS.some((item) => item.id === requested) ? (requested as TabId) : "saved";

  const stats = authorStats(user.id);

  const saved = searchPrompts({
    favoritedBy: user.id,
    statuses: ["published", "private", "pending", "rejected"],
    sort: "recent",
    perPage: 60,
    viewerId: user.id,
  });

  const published = searchPrompts({
    authorId: user.id,
    statuses: ["published"],
    sort: "recent",
    perPage: 60,
    viewerId: user.id,
  });

  const drafts = searchPrompts({
    authorId: user.id,
    statuses: ["private", "pending", "rejected"] as PromptStatus[],
    sort: "recent",
    perPage: 60,
    viewerId: user.id,
  });

  const active = { saved, published, drafts }[tab];

  const empty = {
    saved: {
      title: "Nothing saved yet",
      message: "Tap the bookmark on any prompt and it lands here, ready for next time.",
      action: (
        <ButtonLink href="/browse" variant="tinted">
          Browse the library
        </ButtonLink>
      ),
    },
    published: {
      title: "No published prompts yet",
      message: "Submit a prompt to the public library and it appears here once approved.",
      action: (
        <ButtonLink href="/new" variant="filled" icon="plus">
          Add a prompt
        </ButtonLink>
      ),
    },
    drafts: {
      title: "No private prompts",
      message: "Keep your own working templates here — nobody else can see them.",
      action: (
        <ButtonLink href="/new" variant="filled" icon="plus">
          Add a prompt
        </ButtonLink>
      ),
    },
  }[tab];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <header className="mb-6">
        <h1 className="text-title-1 text-label">My library</h1>
        <p className="mt-1 text-subheadline text-label-secondary">
          Everything you saved, published, or kept to yourself.
        </p>
      </header>

      <div className="mb-6 grid gap-4 lg:grid-cols-[1fr_400px]">
        <ProfileEditor name={user.name} handle={user.handle} bio={user.bio} />

        <div className="grid grid-cols-3 gap-2">
          <Stat value={formatCount(stats.published)} label="Published" icon="globe" />
          <Stat value={formatCount(stats.copies)} label="Copies" icon="copy" />
          <Stat value={formatCount(stats.saves)} label="Saves" icon="bookmark" />
        </div>
      </div>

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SegmentedControl
          ariaLabel="Library section"
          value={tab}
          className="w-full sm:w-96"
          segments={TABS.map((item) => ({
            id: item.id,
            label: item.label,
            href: item.id === "saved" ? "/library" : `/library?tab=${item.id}`,
            count: { saved: saved.total, published: published.total, drafts: drafts.total }[item.id],
          }))}
        />

        <ButtonLink href="/new" variant="filled" size="sm" icon="plus" className="sm:shrink-0">
          Add a prompt
        </ButtonLink>
      </div>

      {active.prompts.length === 0 ? (
        <EmptyState
          icon={tab === "saved" ? "bookmark" : "docText"}
          title={empty.title}
          message={empty.message}
          action={empty.action}
        />
      ) : (
        <ul className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {active.prompts.map((prompt) => (
            <li key={prompt.id} className="flex">
              <PromptCard prompt={prompt} signedIn showStatus className="w-full" />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
