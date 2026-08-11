import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { SignUpForm } from "@/components/AuthForms";
import { Icon } from "@/components/ui/Icon";
import { currentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Create an account",
  description: "Create a PromptShelf account to save, fork, and publish prompt templates.",
};

const PERKS = [
  { icon: "bookmark" as const, text: "Save any prompt to your own library" },
  { icon: "fork" as const, text: "Fork a template and adapt it privately" },
  { icon: "globe" as const, text: "Publish prompts to the public library" },
];

export default async function SignUpPage() {
  const user = await currentUser();
  if (user) redirect("/library");

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-12 sm:px-6">
      <div className="mb-7 text-center">
        <h1 className="text-title-1 text-label">Create your shelf</h1>
        <p className="mt-1.5 text-subheadline text-label-secondary">
          Free, and browsing never required an account in the first place.
        </p>
      </div>

      <ul className="mb-6 flex flex-col gap-2.5">
        {PERKS.map((perk) => (
          <li key={perk.text} className="flex items-center gap-2.5 text-subheadline text-label">
            <span
              className="flex size-7 shrink-0 items-center justify-center rounded-full"
              style={{
                color: "var(--sys-blue)",
                backgroundColor: "color-mix(in srgb, var(--sys-blue) 12%, transparent)",
              }}
            >
              <Icon name={perk.icon} size={15} strokeWidth={1.9} />
            </span>
            {perk.text}
          </li>
        ))}
      </ul>

      <div className="rounded-[var(--r-xl)] border border-separator bg-card p-5">
        <SignUpForm />
      </div>
    </div>
  );
}
