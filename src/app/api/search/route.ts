import { searchPrompts } from "@/lib/prompts";
import { ensureSeeded } from "@/lib/seed";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  ensureSeeded();

  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").slice(0, 120).trim();

  const result = searchPrompts({
    q: q || undefined,
    perPage: 8,
    sort: q ? "relevance" : "popular",
  });

  return Response.json({
    total: result.total,
    prompts: result.prompts.map((prompt) => ({
      slug: prompt.slug,
      title: prompt.title,
      summary: prompt.summary,
      promptType: prompt.promptType,
      category: prompt.category,
    })),
  });
}
