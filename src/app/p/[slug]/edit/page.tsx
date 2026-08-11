import type { Metadata } from "next";

import { getPromptBySlug } from "@/lib/prompts";
import { PersonalPromptEditClient } from "@/components/PersonalPromptEditClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Edit prompt",
};

export default async function EditPromptPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const publicPrompt = slug.startsWith("ps_") ? null : getPromptBySlug(slug) ?? null;

  return <PersonalPromptEditClient slug={slug} publicPrompt={publicPrompt} />;
}
