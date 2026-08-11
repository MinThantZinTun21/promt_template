import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PromptCard } from "@/components/PromptCard";
import { Avatar } from "@/components/ui/Avatar";
import { EmptyState, Stat } from "@/components/ui/Surface";
import { currentUser } from "@/lib/auth";
import { authorStats, searchPrompts } from "@/lib/prompts";
import { getUserByHandle } from "@/lib/users";
import { formatCount, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await params;
  const profile = getUserByHandle(handle);
  if (!profile) return { title: "Profile not found" };

  return {
    title: `${profile.name} (@${profile.handle})`,
    description: profile.bio || `Prompts published by ${profile.name} on PromptShelf.`,
  };
}

export default async function ProfilePage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const profile = getUserByHandle(handle);
  if (!profile) notFound();

  const viewer = await currentUser();
  const stats = authorStats(profile.id);
  const results = searchPrompts({
    authorId: profile.id,
    statuses: ["published"],
    sort: "popular",
    perPage: 48,
    viewerId: viewer?.id ?? null,
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-start">
        <Avatar name={profile.name} handle={profile.handle} size={72} />

        <div className="min-w-0 flex-1">
          <h1 className="text-title-1 text-label">{profile.name}</h1>
          <p className="mt-0.5 text-subheadline text-label-secondary">@{profile.handle}</p>
          {profile.bio && <p className="mt-3 max-w-xl text-body text-label-secondary">{profile.bio}</p>}
          <p className="mt-3 text-footnote text-label-tertiary">
            On the shelf since {formatDate(profile.createdAt)}
            {profile.role === "admin" && " · Library reviewer"}
          </p>
        </div>

        <div className="grid w-full grid-cols-3 gap-2 sm:w-auto sm:min-w-[300px]">
          <Stat value={formatCount(stats.published)} label="Prompts" icon="docText" />
          <Stat value={formatCount(stats.copies)} label="Copies" icon="copy" />
          <Stat value={formatCount(stats.saves)} label="Saves" icon="bookmark" />
        </div>
      </header>

      {results.prompts.length === 0 ? (
        <EmptyState
          icon="docText"
          title="No published prompts yet"
          message={`${profile.name} has not published anything to the public library so far.`}
        />
      ) : (
        <ul className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {results.prompts.map((prompt) => (
            <li key={prompt.id} className="flex">
              <PromptCard prompt={prompt} signedIn={Boolean(viewer)} className="w-full" />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
