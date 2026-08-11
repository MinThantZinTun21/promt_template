"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";

import {
  ANONYMOUS,
  type PersonalPromptBaseRef,
  type PersonalPromptRecord,
  getPersonalPrompt,
  upsertPersonalPrompt,
} from "@/lib/personal-store";
import {
  ACCENT_VAR,
  CATEGORIES,
  MODEL_SUGGESTIONS,
  PROMPT_TYPES,
  isCategoryId,
  isPromptTypeId,
  type CategoryId,
  type PromptTypeId,
} from "@/lib/taxonomy";
import { cx, newId, nowIso, parseTagInput } from "@/lib/utils";
import { estimateTokens, extractVariables } from "@/lib/variables";
import { Button } from "@/components/ui/Button";
import { Field, FormBanner, TextArea, TextInput } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { TypeGlyph } from "@/components/ui/TypeGlyph";

import { useToast } from "@/components/ui/Toast";

export type PersonalPromptFormValues = {
  id?: string;
  /**
   * When present, this draft is a fork of a public prompt.
   * (Stored only in the browser as a reference.)
   */
  base?: PersonalPromptBaseRef;
  title: string;
  summary: string;
  body: string;
  usageNotes: string;
  promptType: PromptTypeId | "";
  category: CategoryId | "";
  tags: string[];
  models: string[];
  contributor?: string;
};

const EMPTY: PersonalPromptFormValues = {
  title: "",
  summary: "",
  body: "",
  usageNotes: "",
  promptType: "",
  category: "",
  tags: [],
  models: [],
};

const promptSchema = z.object({
  title: z.string().min(6, "Give the prompt a descriptive title.").max(90, "Keep the title under 90 characters."),
  summary: z.string().min(20, "Write at least a sentence describing what this prompt does.").max(220, "Keep the summary under 220 characters."),
  body: z.string().min(40, "The prompt itself needs at least 40 characters.").max(12_000, "That prompt is too long."),
  usageNotes: z.string().max(1200, "Keep usage notes under 1200 characters."),
  promptType: z.string().refine(isPromptTypeId, "Choose one of the available prompt types."),
  category: z.string().refine(isCategoryId, "Choose a category."),
  contributor: z.string().max(40, "Keep the credit under 40 characters.").optional(),
  tagsRaw: z.string().optional(),
  modelsRaw: z.string().optional(),
});

function fieldErrorsFrom(error: z.ZodError): Record<string, string> {
  const result: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!result[key]) result[key] = issue.message;
  }
  return result;
}

export function PersonalPromptForm({
  initial = EMPTY,
  mode,
}: {
  initial?: PersonalPromptFormValues;
  mode: "create" | "edit";
}) {
  const router = useRouter();
  const toast = useToast();

  const [title, setTitle] = useState(initial.title);
  const [summary, setSummary] = useState(initial.summary);
  const [body, setBody] = useState(initial.body);
  const [usageNotes, setUsageNotes] = useState(initial.usageNotes);

  const [promptType, setPromptType] = useState<string>(initial.promptType);
  const [category, setCategory] = useState<string>(initial.category);

  const [tagsRaw, setTagsRaw] = useState(initial.tags.join(", "));
  const [modelsRaw, setModelsRaw] = useState(initial.models.join(", "));

  const [contributor, setContributor] = useState(
    initial.contributor === ANONYMOUS ? "" : initial.contributor ?? "",
  );

  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string> | undefined>(undefined);

  const variables = useMemo(() => extractVariables(body), [body]);
  const tokenCount = useMemo(() => estimateTokens(body), [body]);

  const errors = fieldErrors ?? {};

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setError(undefined);
    setFieldErrors(undefined);
    setPending(true);

    try {
      const parsed = promptSchema.safeParse({
        title,
        summary,
        body,
        usageNotes,
        promptType,
        category,
        contributor: contributor.trim() ? contributor.trim() : undefined,
        tagsRaw,
        modelsRaw,
      });

      if (!parsed.success) {
        setFieldErrors(fieldErrorsFrom(parsed.error));
        setPending(false);
        return;
      }

      const tags = parseTagInput(tagsRaw, 8);
      const models = parseTagInput(modelsRaw, 6);

      const now = nowIso();
      const id = initial.id ?? newId("ps");

      const record: PersonalPromptRecord = {
        id,
        base: initial.base,
        title: parsed.data.title,
        summary: parsed.data.summary,
        body: parsed.data.body.trim(),
        usageNotes: usageNotes.trim(),
        promptType: parsed.data.promptType as PromptTypeId,
        category: parsed.data.category as CategoryId,
        tags,
        models,
        contributor: parsed.data.contributor?.trim() ? parsed.data.contributor.trim() : ANONYMOUS,
        createdAt: now,
        updatedAt: now,
      };

      const existing = initial.id ? getPersonalPrompt(initial.id) : undefined;
      upsertPersonalPrompt({
        ...record,
        createdAt: existing?.createdAt ?? record.createdAt,
      });

      toast.show(mode === "edit" ? "Saved to your private shelf" : "Prompt saved to your private shelf", {
        tone: "success",
        icon: "checkmarkCircleFill",
      });

      router.push(`/p/${id}`);
    } catch {
      setError("Could not save. Try again.");
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      {error && <FormBanner tone="error">{error}</FormBanner>}

      <section className="flex flex-col gap-5 rounded-[var(--r-xl)] border border-separator bg-card p-5">
        <Field
          label="Title"
          required
          htmlFor="title"
          error={errors.title}
          hint="What it does, in plain words. Not a clever name."
        >
          <TextInput
            id="title"
            name="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={90}
            placeholder="Pull request review by severity"
            invalid={Boolean(errors.title)}
            required
          />
        </Field>

        <Field
          label="Summary"
          required
          htmlFor="summary"
          error={errors.summary}
          hint="One or two sentences. This is what people read in search results."
        >
          <TextArea
            id="summary"
            name="summary"
            rows={2}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            maxLength={220}
            placeholder="Reviews a diff and sorts findings into must-fix, should-fix, and taste."
            invalid={Boolean(errors.summary)}
            required
          />
        </Field>
      </section>

      <fieldset className="rounded-[var(--r-xl)] border border-separator bg-card p-5">
        <legend className="px-1 text-footnote font-semibold text-label">
          Prompt type <span className="text-[var(--sys-red)]">*</span>
        </legend>
        <p className="mb-3 text-footnote text-label-secondary">
          Choose the one that describes what the prompt does. This is the primary way people browse.
        </p>

        <div className="grid max-h-72 grid-cols-1 gap-1.5 overflow-y-auto pr-1 sm:grid-cols-2 lg:grid-cols-3">
          {PROMPT_TYPES.map((type) => {
            const selected = promptType === type.id;

            return (
              <button
                key={type.id}
                type="button"
                aria-pressed={selected}
                onClick={() => setPromptType(type.id)}
                className={cx(
                  "flex items-center gap-2.5 rounded-[var(--r-md)] border p-2.5 text-left transition-colors",
                  selected
                    ? "border-transparent bg-[color-mix(in_srgb,var(--sys-blue)_11%,transparent)]"
                    : "border-separator hover:bg-fill-quaternary",
                )}
                style={selected ? { borderColor: ACCENT_VAR[type.accent] } : undefined}
              >
                <TypeGlyph icon={type.icon} accent={type.accent} size={30} filled={selected} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-footnote font-medium text-label">
                    {type.name}
                  </span>
                  <span className="block truncate text-caption-2 text-label-secondary">
                    {type.tagline}
                  </span>
                </span>
                {selected && (
                  <span className="text-[var(--sys-blue)]">
                    <Icon name="checkmark" size={14} strokeWidth={2.6} />
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {errors.promptType && (
          <p className="mt-2 flex items-center gap-1 text-footnote text-[var(--sys-red)]">
            <Icon name="warning" size={13} strokeWidth={2} />
            {errors.promptType}
          </p>
        )}
      </fieldset>

      <fieldset className="rounded-[var(--r-xl)] border border-separator bg-card p-5">
        <legend className="px-1 text-footnote font-semibold text-label">
          Discipline <span className="text-[var(--sys-red)]">*</span>
        </legend>
        <p className="mb-3 text-footnote text-label-secondary">The line of work this belongs to.</p>

        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((option) => {
            const selected = category === option.id;

            return (
              <button
                key={option.id}
                type="button"
                aria-pressed={selected}
                onClick={() => setCategory(option.id)}
                className={cx(
                  "pressable inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-footnote font-medium transition-colors",
                  selected ? "text-white" : "bg-fill-tertiary text-label hover:bg-fill-secondary",
                )}
                style={selected ? { backgroundColor: ACCENT_VAR[option.accent] } : undefined}
              >
                <Icon name={option.icon} size={14} strokeWidth={1.9} />
                {option.name}
              </button>
            );
          })}
        </div>

        {errors.category && (
          <p className="mt-2 flex items-center gap-1 text-footnote text-[var(--sys-red)]">
            <Icon name="warning" size={13} strokeWidth={2} />
            {errors.category}
          </p>
        )}
      </fieldset>

      <section className="flex flex-col gap-5 rounded-[var(--r-xl)] border border-separator bg-card p-5">
        <Field
          label="The prompt"
          required
          htmlFor="body"
          error={errors.body}
          trailing={
            <span className="text-caption-1 tabular-nums text-label-tertiary">
              {body.length} chars · ~{tokenCount} tokens
            </span>
          }
          hint={
            <>
              Wrap anything the reader should replace in double braces:{" "}
              <code className="ps-var text-caption-1">{"{{topic}}"}</code>. Add a suggested value after a pipe:{" "}
              <code className="ps-var text-caption-1">{"{{tone | friendly}}"}</code>.
            </>
          }
        >
          <TextArea
            id="body"
            name="body"
            rows={16}
            mono
            value={body}
            onChange={(event) => setBody(event.target.value)}
            placeholder={"You are a…\n\nRules:\n1. …\n\nInput:\n\"\"\"\n{{input}}\n\"\"\""}
            invalid={Boolean(errors.body)}
            required
          />
        </Field>

        {variables.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-footnote text-label-secondary">
              {variables.length === 1 ? "1 placeholder" : `${variables.length} placeholders`} detected:
            </span>
            {variables.map((variable) => (
              <span key={variable.name} className="ps-var text-caption-1">
                {variable.name}
              </span>
            ))}
          </div>
        )}

        {/*
          Keep usage notes and the rest of the form below the main prompt editor so we
          preserve the Apple HIG vertical rhythm.
        */}
      </section>

      <section className="flex flex-col gap-5 rounded-[var(--r-xl)] border border-separator bg-card p-5">
        <Field
          label="Usage notes"
          htmlFor="usageNotes"
          error={errors.usageNotes}
          hint="Optional. The one thing you learned the hard way about making this work."
        >
          <TextArea
            id="usageNotes"
            name="usageNotes"
            rows={3}
            value={usageNotes}
            onChange={(e) => setUsageNotes(e.target.value)}
            maxLength={1200}
            placeholder="Keep the severity headings verbatim — renaming them makes the model merge the groups."
          />
        </Field>
      </section>

      <section className="flex flex-col gap-5 rounded-[var(--r-xl)] border border-separator bg-card p-5">
        <Field
          label="Tags"
          htmlFor="tags"
          hint="Up to 8, comma separated. Lowercase, specific, no hashtags."
        >
          <TextInput
            id="tags"
            name="tags"
            value={tagsRaw}
            onChange={(e) => setTagsRaw(e.target.value)}
            placeholder="review, diff, severity"
          />
        </Field>

        <Field
          label="Works well with"
          htmlFor="models"
          hint="Models or tools you have actually tested this on."
        >
          <TextInput
            id="models"
            name="models"
            value={modelsRaw}
            onChange={(e) => setModelsRaw(e.target.value)}
            placeholder="Claude, GPT-5"
          />
          <div className="mt-2 flex flex-wrap gap-1.5">
            {MODEL_SUGGESTIONS.slice(0, 10).map((model) => {
              const present = modelsRaw
                .split(",")
                .map((item) => item.trim().toLowerCase())
                .includes(model.toLowerCase());

              return (
                <button
                  key={model}
                  type="button"
                  onClick={() => {
                    setModelsRaw((current) => {
                      const list = current
                        .split(",")
                        .map((item) => item.trim())
                        .filter(Boolean);
                      const next = present
                        ? list.filter((item) => item.toLowerCase() !== model.toLowerCase())
                        : [...list, model];
                      return next.join(", ");
                    });
                  }}
                  className={cx(
                    "pressable rounded-full px-2.5 py-1 text-caption-1 transition-colors",
                    present
                      ? "bg-[color-mix(in_srgb,var(--sys-blue)_14%,transparent)] text-[var(--sys-blue)]"
                      : "bg-fill-quaternary text-label-secondary hover:bg-fill-tertiary",
                  )}
                >
                  {present ? "− " : "+ "}
                  {model}
                </button>
              );
            })}
          </div>
        </Field>
      </section>

      <section className="flex flex-col gap-5 rounded-[var(--r-xl)] border border-separator bg-card p-5">
        <Field
          label="Credit"
          htmlFor="contributor"
          error={errors.contributor}
          hint="Optional. A name or handle to put on this prompt — stored only in your browser."
        >
          <TextInput
            id="contributor"
            name="contributor"
            value={contributor}
            onChange={(e) => setContributor(e.target.value)}
            maxLength={40}
            placeholder="Anonymous"
            invalid={Boolean(errors.contributor)}
          />
        </Field>
      </section>

      <div className="sticky bottom-[calc(var(--tabbar-height)+env(safe-area-inset-bottom,0px))] z-10 flex items-center gap-3 md:bottom-4">
        <div className="material-regular flex w-full items-center gap-3 rounded-[var(--r-lg)] border border-separator px-4 py-3 shadow-2">
          <p className="min-w-0 flex-1 text-footnote text-label-secondary">
            {mode === "edit"
              ? "Saves privately. Your personal shelf lives only in this browser."
              : "Saves privately. Your personal shelf lives only in this browser."}
          </p>

          <Button
            type="submit"
            variant="filled"
            disabled={pending}
            icon={pending ? undefined : "checkmarkCircleFill"}
          >
            {pending ? "Saving…" : mode === "edit" ? "Save changes" : "Save prompt"}
          </Button>
        </div>
      </div>
    </form>
  );
}

