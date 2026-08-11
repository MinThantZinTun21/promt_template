"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { canEditPrompt, currentUser } from "@/lib/auth";
import {
  createPrompt,
  deletePrompt,
  getPromptById,
  incrementCopies,
  setPromptFeatured,
  setPromptStatus,
  toggleFavorite,
  updatePrompt,
  type PromptStatus,
} from "@/lib/prompts";
import { isCategoryId, isPromptTypeId } from "@/lib/taxonomy";
import { parseTagInput } from "@/lib/utils";

export type PromptFormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

function fieldErrorsFrom(error: z.ZodError): Record<string, string> {
  const result: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!result[key]) result[key] = issue.message;
  }
  return result;
}

function text(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

const promptSchema = z.object({
  title: z.string().min(6, "Give the prompt a descriptive title.").max(90, "Keep the title under 90 characters."),
  summary: z
    .string()
    .min(20, "Write at least a sentence describing what this prompt does.")
    .max(220, "Keep the summary under 220 characters."),
  body: z.string().min(40, "The prompt itself needs at least 40 characters.").max(12_000, "That prompt is too long."),
  usageNotes: z.string().max(1200, "Keep usage notes under 1200 characters."),
  promptType: z.string().refine(isPromptTypeId, "Choose one of the available prompt types."),
  category: z.string().refine(isCategoryId, "Choose a category."),
});

function revalidatePromptSurfaces(slug?: string) {
  revalidatePath("/");
  revalidatePath("/browse");
  revalidatePath("/types");
  revalidatePath("/library");
  if (slug) revalidatePath(`/p/${slug}`);
}

/**
 * Creates or updates a prompt. `intent` decides the resulting status: keeping it
 * private, or submitting it to the public library for review.
 */
export async function savePromptAction(
  _previous: PromptFormState,
  formData: FormData,
): Promise<PromptFormState> {
  const user = await currentUser();
  if (!user) return { error: "Sign in to save prompts." };

  const parsed = promptSchema.safeParse({
    title: text(formData, "title"),
    summary: text(formData, "summary"),
    body: String(formData.get("body") ?? "").trim(),
    usageNotes: text(formData, "usageNotes"),
    promptType: text(formData, "promptType"),
    category: text(formData, "category"),
  });

  if (!parsed.success) {
    return { fieldErrors: fieldErrorsFrom(parsed.error) };
  }

  const tags = parseTagInput(text(formData, "tags"));
  const models = parseTagInput(text(formData, "models"), 6);
  const intent = text(formData, "intent") === "submit" ? "submit" : "private";
  const editingId = text(formData, "id");
  const forkedFromId = text(formData, "forkedFromId") || null;

  const input = {
    ...parsed.data,
    tags,
    models,
  };

  if (editingId) {
    const existing = getPromptById(editingId);
    if (!existing) return { error: "That prompt no longer exists." };
    if (!canEditPrompt(user, existing.author?.id ?? null)) {
      return { error: "You can only edit prompts you created." };
    }

    // Admins keep a published prompt live; everyone else re-enters review.
    let status: PromptStatus;
    if (intent === "private") {
      status = "private";
    } else if (user.role === "admin" || existing.status === "published") {
      status = "published";
    } else {
      status = "pending";
    }

    const updated = updatePrompt(editingId, { ...input, status });
    if (!updated) return { error: "Could not save your changes." };

    revalidatePromptSurfaces(updated.slug);
    revalidatePath(`/p/${existing.slug}`);
    redirect(`/p/${updated.slug}`);
  }

  const status: PromptStatus =
    intent === "private" ? "private" : user.role === "admin" ? "published" : "pending";

  const created = createPrompt({ ...input, status, authorId: user.id, forkedFromId });
  revalidatePromptSurfaces(created.slug);
  redirect(`/p/${created.slug}${status === "pending" ? "?submitted=1" : ""}`);
}

export async function deletePromptAction(formData: FormData) {
  const user = await currentUser();
  if (!user) redirect("/signin");

  const id = text(formData, "id");
  const prompt = getPromptById(id);
  if (!prompt) redirect("/library");

  if (!canEditPrompt(user, prompt.author?.id ?? null)) redirect(`/p/${prompt.slug}`);

  deletePrompt(id);
  revalidatePromptSurfaces(prompt.slug);
  redirect("/library");
}

/** Duplicates an existing prompt into the signed-in user's private drafts. */
export async function forkPromptAction(formData: FormData) {
  const user = await currentUser();
  const id = text(formData, "id");
  const source = getPromptById(id);

  if (!source) redirect("/browse");
  if (!user) redirect(`/signin?next=/p/${source.slug}`);

  const copy = createPrompt({
    title: `${source.title} (my version)`.slice(0, 90),
    summary: source.summary,
    body: source.body,
    usageNotes: source.usageNotes,
    promptType: source.promptType,
    category: source.category,
    tags: source.tags,
    models: source.models,
    status: "private",
    authorId: user.id,
    forkedFromId: source.id,
  });

  revalidatePromptSurfaces(copy.slug);
  redirect(`/p/${copy.slug}/edit`);
}

export async function toggleFavoriteAction(promptId: string): Promise<{ saved: boolean }> {
  const user = await currentUser();
  if (!user) return { saved: false };

  const saved = toggleFavorite(user.id, promptId);
  revalidatePath("/library");
  return { saved };
}

export async function recordCopyAction(promptId: string): Promise<void> {
  incrementCopies(promptId);
}

const moderationSchema = z.object({
  id: z.string().min(1),
  decision: z.enum(["published", "rejected"]),
  note: z.string().max(400),
});

export async function moderatePromptAction(formData: FormData) {
  const user = await currentUser();
  if (!user || user.role !== "admin") redirect("/");

  const parsed = moderationSchema.safeParse({
    id: text(formData, "id"),
    decision: text(formData, "decision"),
    note: text(formData, "note"),
  });
  if (!parsed.success) redirect("/admin");

  setPromptStatus(parsed.data.id, parsed.data.decision, parsed.data.note);
  const prompt = getPromptById(parsed.data.id);
  revalidatePromptSurfaces(prompt?.slug);
  revalidatePath("/admin");
}

export async function toggleFeaturedAction(formData: FormData) {
  const user = await currentUser();
  if (!user || user.role !== "admin") redirect("/");

  const id = text(formData, "id");
  const prompt = getPromptById(id);
  if (!prompt) redirect("/admin");

  setPromptFeatured(id, !prompt.featured);
  revalidatePromptSurfaces(prompt.slug);
  revalidatePath("/admin");
}
