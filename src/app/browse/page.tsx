import type { Metadata } from "next";

import { PromptBrowser } from "@/components/PromptBrowser";
import { currentUser } from "@/lib/auth";
import { parseBrowseParams, type RawSearchParams } from "@/lib/search-params";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Browse prompts",
  description:
    "Search and filter the full prompt template library by prompt type, discipline, tag, and model.",
};

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const raw = await searchParams;
  const params = parseBrowseParams(raw);
  const user = await currentUser();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <header className="mb-6">
        <h1 className="text-title-1 text-label">Browse the shelf</h1>
        <p className="mt-1 text-subheadline text-label-secondary">
          Filter by prompt type first — it is the fastest way to find the right shape.
        </p>
      </header>

      <PromptBrowser pathname="/browse" params={params} user={user} />
    </div>
  );
}
