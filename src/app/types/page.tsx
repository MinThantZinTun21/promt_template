import type { Metadata } from "next";

import { TypeGrid } from "@/components/TypeGrid";
import { countsByType } from "@/lib/prompts";
import { PROMPT_TYPES } from "@/lib/taxonomy";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Prompt types",
  description:
    "The 20 predefined prompt types used to organise the library: system prompts, instructions, personas, few-shot, chain of thought, extraction, classification, agents, image and video prompts, and more.",
};

export default async function TypesPage() {
  const counts = countsByType();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <header className="mb-8 max-w-2xl">
        <h1 className="text-title-1 text-label">Prompt types</h1>
        <p className="mt-2 text-body text-label-secondary">
          Every prompt in the library is filed under exactly one of these {PROMPT_TYPES.length}{" "}
          types. The type describes what the prompt does structurally, which is usually what you
          are actually looking for — the subject matter is a secondary filter.
        </p>
      </header>

      <TypeGrid counts={counts} showDescription />
    </div>
  );
}
