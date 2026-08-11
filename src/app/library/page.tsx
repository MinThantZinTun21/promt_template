import type { Metadata } from "next";
import { Suspense } from "react";

import { LibraryClient } from "@/app/library/LibraryClient";

export const metadata: Metadata = {
  title: "My library",
  description: "Private prompt drafts and favorites stored only in this browser.",
};

export default function PersonalLibraryPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <p className="text-footnote text-label-secondary">Loading your private shelf…</p>
        </div>
      }
    >
      <LibraryClient />
    </Suspense>
  );
}
