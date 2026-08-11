import "server-only";

import { execute, getMeta, queryOne, setMeta } from "@/lib/db";
import { reindexPrompt } from "@/lib/prompts";
import { SEED_CONTRIBUTORS, SEED_PROMPTS, type SeedPrompt } from "@/lib/seed-data";
import { newId, nowIso, slugify } from "@/lib/utils";

const SEED_VERSION = "3";

function insertSeedPrompt(prompt: SeedPrompt, createdAt: string) {
  const id = newId("pr");
  const base = slugify(prompt.title) || "prompt";
  let slug = base;
  let suffix = 2;
  while (queryOne("SELECT 1 AS ok FROM prompts WHERE slug = ?", [slug])) {
    slug = `${base}-${suffix}`;
    suffix += 1;
  }

  execute(
    /* sql */ `
      INSERT INTO prompts (
        id, slug, title, summary, body, usage_notes, prompt_type, category, tags, models,
        contributor, featured, views, copies, likes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      id,
      slug,
      prompt.title,
      prompt.summary,
      prompt.body,
      prompt.usageNotes,
      prompt.promptType,
      prompt.category,
      JSON.stringify(prompt.tags),
      JSON.stringify(prompt.models),
      SEED_CONTRIBUTORS[prompt.author] ?? "Anonymous",
      prompt.featured ? 1 : 0,
      prompt.views,
      prompt.copies,
      prompt.likes,
      createdAt,
      createdAt,
    ],
  );

  reindexPrompt(id);
}

function seed() {
  // The public library is regenerated from seed-data.ts whenever the version
  // changes. Personal drafts live in the browser, so wiping SQLite is safe.
  execute("DELETE FROM prompts_fts");
  execute("DELETE FROM prompt_revisions");
  execute("DELETE FROM prompts");

  // Spread creation dates across the past few months so date sorting is meaningful.
  const dayMs = 86_400_000;
  const start = Date.now() - SEED_PROMPTS.length * 2 * dayMs;

  SEED_PROMPTS.forEach((prompt, index) => {
    insertSeedPrompt(prompt, new Date(start + index * 2 * dayMs).toISOString());
  });

  setMeta("seeded", SEED_VERSION);
  setMeta("seeded_at", nowIso());
}

let done = false;

/**
 * Seeds the starter library once per database. Called from the root layout so a
 * fresh clone has content on first page load without a separate setup step.
 */
export function ensureSeeded(): void {
  if (done) return;

  if (getMeta("seeded") === SEED_VERSION) {
    done = true;
    return;
  }

  try {
    seed();
  } catch (error) {
    console.error("[promptshelf] seeding failed", error);
  }

  done = true;
}
