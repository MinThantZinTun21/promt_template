import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { deletePromptAction } from "@/app/actions/prompts";
import { PromptForm } from "@/components/PromptForm";
import { StatusBadge } from "@/components/PromptCard";
import { Icon } from "@/components/ui/Icon";
import { canEditPrompt, currentUser } from "@/lib/auth";
import { getPromptBySlug } from "@/lib/prompts";
import type { CategoryId, PromptTypeId } from "@/lib/taxonomy";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Edit prompt",
};

export default async function EditPromptPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const user = await currentUser();
  if (!user) redirect(`/signin?next=/p/${slug}/edit`);

  const prompt = getPromptBySlug(slug, user.id);
  if (!prompt) notFound();
  if (!canEditPrompt(user, prompt.author?.id ?? null)) redirect(`/p/${prompt.slug}`);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <nav aria-label="Breadcrumb" className="mb-5 flex items-center gap-1 text-footnote">
        <Link href={`/p/${prompt.slug}`} className="text-[var(--sys-blue)] hover:underline">
          {prompt.title}
        </Link>
        <Icon name="chevronRight" size={12} className="text-label-quaternary" strokeWidth={2.2} />
        <span className="text-label-secondary">Edit</span>
      </nav>

      <header className="mb-7 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-title-1 text-label">Edit prompt</h1>
          <p className="mt-1.5 text-subheadline text-label-secondary">
            {prompt.status === "published"
              ? "This prompt is public. Changes go live as soon as you save."
              : prompt.status === "pending"
                ? "Only you can see this prompt while it waits for review."
                : "Only you can see this prompt. Submit it when you want it in the public library."}
          </p>
        </div>
        <StatusBadge status={prompt.status} />
      </header>

      <PromptForm
        mode="edit"
        initial={{
          id: prompt.id,
          title: prompt.title,
          summary: prompt.summary,
          body: prompt.body,
          usageNotes: prompt.usageNotes,
          promptType: prompt.promptType as PromptTypeId,
          category: prompt.category as CategoryId,
          tags: prompt.tags,
          models: prompt.models,
          status: prompt.status,
          forkedFromId: prompt.forkedFromId,
        }}
      />

      <section className="mt-10 rounded-[var(--r-xl)] border border-[color-mix(in_srgb,var(--sys-red)_28%,var(--separator))] p-5">
        <h2 className="text-headline text-label">Delete this prompt</h2>
        <p className="mt-1 text-footnote text-label-secondary">
          This removes it for everyone, including anyone who saved it. It cannot be undone.
        </p>

        <form action={deletePromptAction} className="mt-4">
          <input type="hidden" name="id" value={prompt.id} />
          <button
            type="submit"
            className="pressable inline-flex h-10 items-center gap-2 rounded-[var(--r-md)] bg-[color-mix(in_srgb,var(--sys-red)_12%,transparent)] px-4 text-subheadline font-semibold text-[var(--sys-red)] transition-colors hover:bg-[color-mix(in_srgb,var(--sys-red)_18%,transparent)]"
          >
            <Icon name="trash" size={17} strokeWidth={1.85} />
            Delete prompt
          </button>
        </form>
      </section>
    </div>
  );
}
