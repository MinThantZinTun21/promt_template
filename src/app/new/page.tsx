import type { Metadata } from "next";

import { PersonalPromptForm } from "@/components/PersonalPromptForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Add a prompt",
  description: "Create a prompt draft saved only in your private shelf.",
};

export default async function NewPromptPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <header className="mb-7">
        <h1 className="text-title-1 text-label">Add a prompt</h1>
        <p className="mt-1.5 text-subheadline text-label-secondary">
          New prompts stay in your private shelf on this device. The public library is the seeded collection everyone can browse.
        </p>
      </header>

      <PersonalPromptForm mode="create" />
    </div>
  );
}
