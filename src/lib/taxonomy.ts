import type { IconName } from "@/components/ui/Icon";

export type AccentColor =
  | "blue"
  | "green"
  | "indigo"
  | "orange"
  | "pink"
  | "purple"
  | "red"
  | "teal"
  | "yellow"
  | "mint"
  | "brown"
  | "cyan";

export type PromptTypeId =
  | "system-prompt"
  | "instruction"
  | "persona"
  | "few-shot"
  | "chain-of-thought"
  | "summarization"
  | "rewriting"
  | "extraction"
  | "classification"
  | "translation"
  | "brainstorming"
  | "code-generation"
  | "code-review"
  | "rag-qa"
  | "agent-tooling"
  | "image-prompt"
  | "video-prompt"
  | "analysis"
  | "evaluation"
  | "meta-prompt";

export type PromptType = {
  id: PromptTypeId;
  name: string;
  tagline: string;
  description: string;
  icon: IconName;
  accent: AccentColor;
  /** Extra words folded into the search index so type-adjacent queries match. */
  keywords: string[];
};

/**
 * The fixed set of prompt types every prompt must belong to. Kept as a closed
 * list so browsing stays predictable and every type gets a real landing page.
 */
export const PROMPT_TYPES: PromptType[] = [
  {
    id: "system-prompt",
    name: "System Prompt",
    tagline: "Set the ground rules",
    description:
      "Defines an assistant's identity, boundaries, and behaviour for an entire conversation. Goes in the system slot, not the user turn.",
    icon: "sliders",
    accent: "blue",
    keywords: ["system message", "guardrails", "behaviour", "assistant setup", "developer message"],
  },
  {
    id: "instruction",
    name: "Instruction",
    tagline: "One clear task",
    description:
      "A direct zero-shot request that states the task, the context, and the expected output shape without examples.",
    icon: "target",
    accent: "indigo",
    keywords: ["zero shot", "task", "directive", "command", "single turn"],
  },
  {
    id: "persona",
    name: "Persona & Role",
    tagline: "Adopt an expert voice",
    description:
      "Asks the model to answer as a specific role or character so tone, vocabulary, and priorities shift accordingly.",
    icon: "personCircle",
    accent: "purple",
    keywords: ["role play", "act as", "character", "voice", "expert"],
  },
  {
    id: "few-shot",
    name: "Few-Shot Examples",
    tagline: "Teach by demonstration",
    description:
      "Includes two or more input/output pairs so the model infers the pattern instead of relying on description alone.",
    icon: "squareStack",
    accent: "teal",
    keywords: ["examples", "demonstrations", "in context learning", "one shot", "pattern"],
  },
  {
    id: "chain-of-thought",
    name: "Chain of Thought",
    tagline: "Reason step by step",
    description:
      "Requests explicit intermediate reasoning before the final answer, which improves accuracy on multi-step problems.",
    icon: "flowSteps",
    accent: "pink",
    keywords: ["step by step", "reasoning", "think", "scratchpad", "deliberate", "tree of thought"],
  },
  {
    id: "summarization",
    name: "Summarization",
    tagline: "Compress without losing meaning",
    description:
      "Condenses long source material into a shorter form with a controlled length, audience, and level of detail.",
    icon: "textAlignLeft",
    accent: "orange",
    keywords: ["summary", "tldr", "condense", "abstract", "digest", "recap"],
  },
  {
    id: "rewriting",
    name: "Rewriting & Editing",
    tagline: "Same meaning, better form",
    description:
      "Transforms existing text: tone, grammar, reading level, length, or format, while preserving the original intent.",
    icon: "pencil",
    accent: "yellow",
    keywords: ["edit", "proofread", "rephrase", "tone", "polish", "paraphrase", "copy edit"],
  },
  {
    id: "extraction",
    name: "Extraction & Structured Output",
    tagline: "Text in, JSON out",
    description:
      "Pulls specific fields out of unstructured input and returns them in a strict machine-readable schema.",
    icon: "curlyBraces",
    accent: "green",
    keywords: ["json", "schema", "parse", "fields", "structured", "entities", "ner", "table"],
  },
  {
    id: "classification",
    name: "Classification & Tagging",
    tagline: "Sort into known buckets",
    description:
      "Assigns input to one or more predefined labels, with rules for ties, confidence, and the unknown case.",
    icon: "tag",
    accent: "mint",
    keywords: ["label", "categorize", "sentiment", "triage", "routing", "intent", "moderation"],
  },
  {
    id: "translation",
    name: "Translation & Localization",
    tagline: "Cross languages carefully",
    description:
      "Converts content between languages while handling idiom, formality, names, and locale-specific formatting.",
    icon: "globe",
    accent: "cyan",
    keywords: ["translate", "localize", "i18n", "language", "formality", "locale"],
  },
  {
    id: "brainstorming",
    name: "Brainstorming & Ideation",
    tagline: "Generate many options",
    description:
      "Produces a wide spread of distinct ideas under explicit constraints, optimising for variety before quality.",
    icon: "sparkles",
    accent: "pink",
    keywords: ["ideas", "naming", "divergent", "options", "creative", "concepts"],
  },
  {
    id: "code-generation",
    name: "Code Generation",
    tagline: "Write the implementation",
    description:
      "Asks for working code against a stated stack, interface, and set of constraints, tests included where useful.",
    icon: "chevronCode",
    accent: "blue",
    keywords: ["code", "implement", "function", "component", "scaffold", "sql", "script"],
  },
  {
    id: "code-review",
    name: "Code Review & Debugging",
    tagline: "Find what is wrong",
    description:
      "Reviews a diff or traces a failure, ranking findings by severity and proposing a minimal correct fix.",
    icon: "magnifierCode",
    accent: "red",
    keywords: ["review", "bug", "debug", "refactor", "diff", "pull request", "stack trace"],
  },
  {
    id: "rag-qa",
    name: "Q&A over Documents",
    tagline: "Answer only from sources",
    description:
      "Grounds answers in supplied context with citations, and requires an explicit abstain when the context is silent.",
    icon: "docText",
    accent: "indigo",
    keywords: ["rag", "retrieval", "citations", "grounded", "context", "knowledge base", "abstain"],
  },
  {
    id: "agent-tooling",
    name: "Agent & Tool Use",
    tagline: "Plan, call tools, verify",
    description:
      "Instructs an autonomous loop: when to call which tool, how to handle failure, and when the task is done.",
    icon: "wrench",
    accent: "brown",
    keywords: ["agent", "tools", "function calling", "react", "mcp", "planning", "autonomous"],
  },
  {
    id: "image-prompt",
    name: "Image Generation",
    tagline: "Describe the shot",
    description:
      "Composes subject, style, lighting, lens, and negative constraints for diffusion and image models.",
    icon: "photo",
    accent: "purple",
    keywords: ["midjourney", "dall-e", "stable diffusion", "art", "illustration", "photography", "style"],
  },
  {
    id: "video-prompt",
    name: "Video Generation",
    tagline: "Direct motion over time",
    description:
      "Describes camera movement, pacing, and shot continuity for text-to-video and image-to-video models.",
    icon: "film",
    accent: "teal",
    keywords: ["sora", "veo", "runway", "camera", "motion", "shot", "b-roll", "animation"],
  },
  {
    id: "analysis",
    name: "Data Analysis",
    tagline: "Turn numbers into decisions",
    description:
      "Interprets datasets and metrics, states assumptions, and separates observation from recommendation.",
    icon: "chartBar",
    accent: "green",
    keywords: ["data", "metrics", "insight", "statistics", "spreadsheet", "cohort", "forecast"],
  },
  {
    id: "evaluation",
    name: "Evaluation & Grading",
    tagline: "Score against a rubric",
    description:
      "Acts as a judge: applies a rubric to candidate output and returns per-criterion scores with justification.",
    icon: "checklist",
    accent: "orange",
    keywords: ["llm as judge", "rubric", "grade", "score", "critique", "quality", "eval"],
  },
  {
    id: "meta-prompt",
    name: "Meta-Prompting",
    tagline: "Prompts that build prompts",
    description:
      "Uses the model to draft, critique, or optimise another prompt, usually against a stated objective.",
    icon: "wandStars",
    accent: "blue",
    keywords: ["prompt engineering", "optimize", "improve prompt", "rewrite prompt", "self critique"],
  },
];

export const PROMPT_TYPE_IDS = PROMPT_TYPES.map((t) => t.id);

const PROMPT_TYPE_MAP = new Map<string, PromptType>(PROMPT_TYPES.map((t) => [t.id, t]));

export function getPromptType(id: string | null | undefined): PromptType | undefined {
  return id ? PROMPT_TYPE_MAP.get(id) : undefined;
}

export function isPromptTypeId(value: unknown): value is PromptTypeId {
  return typeof value === "string" && PROMPT_TYPE_MAP.has(value);
}

/* ------------------------------------------------------------------ */

export type CategoryId =
  | "writing"
  | "engineering"
  | "marketing"
  | "product"
  | "design"
  | "data"
  | "education"
  | "support"
  | "research"
  | "business"
  | "personal";

export type Category = {
  id: CategoryId;
  name: string;
  icon: IconName;
  accent: AccentColor;
};

/** Secondary axis: which line of work the prompt belongs to. */
export const CATEGORIES: Category[] = [
  { id: "writing", name: "Writing", icon: "pencil", accent: "yellow" },
  { id: "engineering", name: "Engineering", icon: "chevronCode", accent: "blue" },
  { id: "marketing", name: "Marketing", icon: "megaphone", accent: "pink" },
  { id: "product", name: "Product", icon: "cube", accent: "indigo" },
  { id: "design", name: "Design", icon: "paintbrush", accent: "purple" },
  { id: "data", name: "Data", icon: "chartBar", accent: "green" },
  { id: "education", name: "Education", icon: "bookOpen", accent: "orange" },
  { id: "support", name: "Support", icon: "lifebuoy", accent: "teal" },
  { id: "research", name: "Research", icon: "flask", accent: "mint" },
  { id: "business", name: "Business", icon: "briefcase", accent: "brown" },
  { id: "personal", name: "Personal", icon: "heart", accent: "red" },
];

const CATEGORY_MAP = new Map<string, Category>(CATEGORIES.map((c) => [c.id, c]));

export function getCategory(id: string | null | undefined): Category | undefined {
  return id ? CATEGORY_MAP.get(id) : undefined;
}

export function isCategoryId(value: unknown): value is CategoryId {
  return typeof value === "string" && CATEGORY_MAP.has(value);
}

/* ------------------------------------------------------------------ */

/** Suggested model tags. Free-form entries are allowed too. */
export const MODEL_SUGGESTIONS = [
  "GPT-5",
  "GPT-4o",
  "o-series",
  "Claude",
  "Claude Code",
  "Gemini",
  "Grok",
  "Llama",
  "Mistral",
  "DeepSeek",
  "Qwen",
  "Cursor",
  "Midjourney",
  "Stable Diffusion",
  "Sora",
  "Veo",
  "Any model",
] as const;

export const SORT_OPTIONS = [
  { id: "relevance", name: "Relevance" },
  { id: "recent", name: "Newest" },
  { id: "popular", name: "Most used" },
  { id: "alpha", name: "A–Z" },
] as const;

export type SortId = (typeof SORT_OPTIONS)[number]["id"];

export function isSortId(value: unknown): value is SortId {
  return typeof value === "string" && SORT_OPTIONS.some((s) => s.id === value);
}

export const ACCENT_VAR: Record<AccentColor, string> = {
  blue: "var(--sys-blue)",
  green: "var(--sys-green)",
  indigo: "var(--sys-indigo)",
  orange: "var(--sys-orange)",
  pink: "var(--sys-pink)",
  purple: "var(--sys-purple)",
  red: "var(--sys-red)",
  teal: "var(--sys-teal)",
  yellow: "var(--sys-yellow)",
  mint: "var(--sys-mint)",
  brown: "var(--sys-brown)",
  cyan: "var(--sys-cyan)",
};
