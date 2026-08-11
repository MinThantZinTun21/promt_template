import { getPromptBySlug } from "@/lib/prompts";
import { ensureSeeded } from "@/lib/seed";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  ensureSeeded();

  const { searchParams } = new URL(request.url);
  const slugs = (searchParams.get("slugs") ?? "")
    .split(",")
    .map((slug) => slug.trim())
    .filter(Boolean)
    .slice(0, 40);

  const prompts = slugs
    .map((slug) => getPromptBySlug(slug))
    .filter((prompt): prompt is NonNullable<typeof prompt> => Boolean(prompt))
    .map((prompt) => ({
      id: prompt.id,
      slug: prompt.slug,
      title: prompt.title,
      summary: prompt.summary,
      body: prompt.body,
      usageNotes: prompt.usageNotes,
      promptType: prompt.promptType,
      category: prompt.category,
      tags: prompt.tags,
      models: prompt.models,
      contributor: prompt.contributor,
      forkedFromId: prompt.forkedFromId,
      forkedFrom: prompt.forkedFrom,
      featured: prompt.featured,
      views: prompt.views,
      copies: prompt.copies,
      likes: prompt.likes,
      editCount: prompt.editCount,
      createdAt: prompt.createdAt,
      updatedAt: prompt.updatedAt,
    }));

  return Response.json({ prompts });
}
