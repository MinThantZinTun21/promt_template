import "server-only";

import { execute, getMeta, queryOne, setMeta } from "@/lib/db";
import { reindexPrompt } from "@/lib/prompts";
import { SEED_PASSWORD, SEED_PROMPTS, SEED_USERS, type SeedPrompt } from "@/lib/seed-data";
import { createUser } from "@/lib/users";
import { newId, nowIso, slugify } from "@/lib/utils";

const SEED_VERSION = "1";

/** Community submissions waiting in the moderation queue, so /admin is not empty. */
const PENDING_SUBMISSIONS: SeedPrompt[] = [
  {
    title: "Changelog entry from a merged PR",
    summary:
      "Turns a pull request title and diff summary into a user-facing changelog line that avoids internal jargon.",
    body: `Write a changelog entry for the change below, for an audience of {{audience | end users}}.

Rules:
- One sentence, under 20 words, in present tense.
- Lead with what the user can now do, not what we built.
- No internal component, service, or ticket names.
- If the change is invisible to users, output exactly "internal only" and nothing else.

Then add a "Details" line of at most two sentences, only if a user would need it to take advantage of the change.

Change:
"""
{{pr_description}}
"""`,
    usageNotes: "The 'internal only' escape hatch stops refactors from turning into fake features.",
    promptType: "rewriting",
    category: "engineering",
    tags: ["changelog", "release notes"],
    models: ["Claude", "GPT-5"],
    author: "adaeze",
    views: 0,
    copies: 0,
    saves: 0,
  },
  {
    title: "Onboarding email sequence outline",
    summary:
      "Plans a five-email onboarding sequence around one activation action per email rather than feature tours.",
    body: `Plan a {{count | 5}}-email onboarding sequence for {{product}}.

The activation action is: {{activation_action | creating a first project}}

For each email give:
- Send timing, relative to signup
- The single action this email is asking for — one per email, no exceptions
- Subject line, under 45 characters
- The one sentence of body copy that earns the click
- Who should be excluded from this send (people who already did the action, etc.)
- The metric that tells you this email worked

Rules: no email may introduce more than one action. No feature tours. If an email exists only because sequences usually have five, say so and cut it.

What the product does: {{description}}`,
    usageNotes: "The exclusion rule is what keeps the sequence from nagging people who already converted.",
    promptType: "instruction",
    category: "marketing",
    tags: ["email", "onboarding", "lifecycle"],
    models: ["Claude", "GPT-5"],
    author: "lucas",
    views: 0,
    copies: 0,
    saves: 0,
  },
];

function insertSeedPrompt(
  prompt: SeedPrompt,
  authorId: string | null,
  status: "published" | "pending",
  createdAt: string,
) {
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
        status, author_id, featured, views, copies, saves, created_at, updated_at, published_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
      status,
      authorId,
      prompt.featured ? 1 : 0,
      prompt.views,
      prompt.copies,
      prompt.saves,
      createdAt,
      createdAt,
      status === "published" ? createdAt : null,
    ],
  );

  reindexPrompt(id);
}

async function seed() {
  const userIds = new Map<string, string>();

  for (const seedUser of SEED_USERS) {
    const user = await createUser({
      email: seedUser.email,
      handle: seedUser.handle,
      name: seedUser.name,
      bio: seedUser.bio,
      password: SEED_PASSWORD,
      role: seedUser.role ?? "member",
    });
    userIds.set(seedUser.key, user.id);
  }

  // Spread publish dates across the past few months so date sorting is meaningful.
  const dayMs = 86_400_000;
  const start = Date.now() - SEED_PROMPTS.length * 2 * dayMs;

  SEED_PROMPTS.forEach((prompt, index) => {
    const createdAt = new Date(start + index * 2 * dayMs).toISOString();
    insertSeedPrompt(prompt, userIds.get(prompt.author) ?? null, "published", createdAt);
  });

  PENDING_SUBMISSIONS.forEach((prompt, index) => {
    const createdAt = new Date(Date.now() - (index + 1) * 6 * 3_600_000).toISOString();
    insertSeedPrompt(prompt, userIds.get(prompt.author) ?? null, "pending", createdAt);
  });

  setMeta("seeded", SEED_VERSION);
  setMeta("seeded_at", nowIso());
}

let pending: Promise<void> | null = null;

/**
 * Seeds the starter library once per database. Awaited from the root layout so a
 * fresh clone has content on first page load without a separate setup step.
 */
export function ensureSeeded(): Promise<void> {
  if (getMeta("seeded") === SEED_VERSION) return Promise.resolve();

  pending ??= seed()
    .catch((error) => {
      console.error("[promptshelf] seeding failed", error);
    })
    .finally(() => {
      pending = null;
    });

  return pending;
}
