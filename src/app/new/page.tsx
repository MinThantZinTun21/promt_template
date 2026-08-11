import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { PromptForm } from "@/components/PromptForm";
import { currentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Add a prompt",
  description: "Contribute a prompt template to the library, or keep it in your private shelf.",
};

export default async function NewPromptPage() {
  const user = await currentUser();
  if (!user) redirect("/signin?next=/new");

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <header className="mb-7">
        <h1 className="text-title-1 text-label">Add a prompt</h1>
        <p className="mt-1.5 text-subheadline text-label-secondary">
          The prompts that get used are specific about output, and honest about where they fail.
          Write the one you wish you had found.
        </p>
      </header>

      <PromptForm mode="create" />
    </div>
  );
}
