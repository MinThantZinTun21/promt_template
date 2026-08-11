"use client";

import { useActionState, useMemo, useState } from "react";

import { savePromptAction, type PromptFormState } from "@/app/actions/prompts";
import { Button } from "@/components/ui/Button";
import { Field, FormBanner, TextArea, TextInput } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { TypeGlyph } from "@/components/ui/TypeGlyph";
import {
  ACCENT_VAR,
  CATEGORIES,
  MODEL_SUGGESTIONS,
  PROMPT_TYPES,
  type CategoryId,
  type PromptTypeId,
} from "@/lib/taxonomy";
import { cx } from "@/lib/utils";
import { estimateTokens, extractVariables } from "@/lib/variables";

export type PromptFormValues = {
  id?: string;
  title: string;
  summary: string;
  body: string;
  usageNotes: string;
  promptType: PromptTypeId | "";
  category: CategoryId | "";
  tags: string[];
  models: string[];
  status?: "private" | "pending" | "published" | "rejected";
  forkedFromId?: string | null;
};

const EMPTY: PromptFormValues = {
  title: "",
  summary: "",
  body: "",
  usageNotes: "",
  promptType: "",
  category: "",
  tags: [],
  models: [],
};

export function PromptForm({
  initial = EMPTY,
  mode,
}: {
  initial?: PromptFormValues;
  mode: "create" | "edit";
}) {
  const [state, formAction, pending] = useActionState<PromptFormState, FormData>(
    savePromptAction,
    {},
  );

  const [promptType, setPromptType] = useState<string>(initial.promptType);
  const [category, setCategory] = useState<string>(initial.category);
  const [body, setBody] = useState(initial.body);
  const [models, setModels] = useState(initial.models.join(", "));
  const [visibility, setVisibility] = useState<"private" | "submit">(
    initial.status && initial.status !== "private" ? "submit" : "private",
  );

  const variables = useMemo(() => extractVariables(body), [body]);
  const errors = state.fieldErrors ?? {};

  const alreadyPublished = initial.status === "published";

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {initial.id && <input type="hidden" name="id" value={initial.id} />}
      {initial.forkedFromId && (
        <input type="hidden" name="forkedFromId" value={initial.forkedFromId} />
      )}
      <input type="hidden" name="intent" value={visibility} />
      <input type="hidden" name="promptType" value={promptType} />
      <input type="hidden" name="category" value={category} />

      {state.error && <FormBanner tone="error">{state.error}</FormBanner>}

      <section className="flex flex-col gap-5 rounded-[var(--r-xl)] border border-separator bg-card p-5">
        <Field label="Title" required htmlFor="title" error={errors.title} hint="What it does, in plain words. Not a clever name.">
          <TextInput
            id="title"
            name="title"
            defaultValue={initial.title}
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
            defaultValue={initial.summary}
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
        <p className="mb-3 text-footnote text-label-secondary">
          The line of work this belongs to.
        </p>

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
              {body.length} chars · ~{estimateTokens(body)} tokens
            </span>
          }
          hint={
            <>
              Wrap anything the reader should replace in double braces:{" "}
              <code className="ps-var text-caption-1">{"{{topic}}"}</code>. Add a suggested value
              after a pipe: <code className="ps-var text-caption-1">{"{{tone | friendly}}"}</code>.
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
            defaultValue={initial.usageNotes}
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
            defaultValue={initial.tags.join(", ")}
            placeholder="review, diff, severity"
          />
        </Field>

        <Field
          label="Works well with"
          htmlFor="models"
          hint="Models or tools you have actually tested this on."
        >
          <>
            <TextInput
              id="models"
              name="models"
              value={models}
              onChange={(event) => setModels(event.target.value)}
              placeholder="Claude, GPT-5"
            />
            <div className="mt-2 flex flex-wrap gap-1.5">
              {MODEL_SUGGESTIONS.slice(0, 10).map((model) => {
                const present = models
                  .split(",")
                  .map((item) => item.trim().toLowerCase())
                  .includes(model.toLowerCase());

                return (
                  <button
                    key={model}
                    type="button"
                    onClick={() =>
                      setModels((current) => {
                        const list = current
                          .split(",")
                          .map((item) => item.trim())
                          .filter(Boolean);
                        const next = present
                          ? list.filter((item) => item.toLowerCase() !== model.toLowerCase())
                          : [...list, model];
                        return next.join(", ");
                      })
                    }
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
          </>
        </Field>
      </section>

      <fieldset className="rounded-[var(--r-xl)] border border-separator bg-card p-5">
        <legend className="px-1 text-footnote font-semibold text-label">Where this goes</legend>

        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {[
            {
              id: "private" as const,
              icon: "lock" as const,
              title: "Keep it private",
              body: "Only you can see it. Lives in your library, ready whenever you need it.",
            },
            {
              id: "submit" as const,
              icon: "globe" as const,
              title: alreadyPublished ? "Stay in the public library" : "Submit to the library",
              body: alreadyPublished
                ? "Your edits stay live for everyone."
                : "A reviewer checks it before it appears publicly. You keep authorship.",
            },
          ].map((option) => {
            const selected = visibility === option.id;

            return (
              <button
                key={option.id}
                type="button"
                aria-pressed={selected}
                onClick={() => setVisibility(option.id)}
                className={cx(
                  "flex items-start gap-3 rounded-[var(--r-lg)] border p-3.5 text-left transition-colors",
                  selected
                    ? "border-[var(--sys-blue)] bg-[color-mix(in_srgb,var(--sys-blue)_8%,transparent)]"
                    : "border-separator hover:bg-fill-quaternary",
                )}
              >
                <span
                  className={cx(
                    "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border",
                    selected
                      ? "border-[var(--sys-blue)] bg-[var(--sys-blue)] text-white"
                      : "border-separator-opaque text-transparent",
                  )}
                >
                  <Icon name="checkmark" size={12} strokeWidth={3} />
                </span>
                <span className="min-w-0">
                  <span className="flex items-center gap-1.5 text-subheadline font-semibold text-label">
                    <Icon name={option.icon} size={15} className="text-label-secondary" />
                    {option.title}
                  </span>
                  <span className="mt-0.5 block text-footnote text-label-secondary">
                    {option.body}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="sticky bottom-[calc(var(--tabbar-height)+env(safe-area-inset-bottom,0px))] z-10 flex items-center gap-3 md:bottom-4">
        <div className="material-regular flex w-full items-center gap-3 rounded-[var(--r-lg)] border border-separator px-4 py-3 shadow-2">
          <p className="min-w-0 flex-1 text-footnote text-label-secondary">
            {visibility === "private"
              ? "Saved to your private library."
              : alreadyPublished
                ? "Changes go live immediately."
                : "Goes to the review queue."}
          </p>

          <Button type="submit" variant="filled" disabled={pending} icon={pending ? undefined : "checkmark"}>
            {pending
              ? "Saving…"
              : mode === "edit"
                ? "Save changes"
                : visibility === "private"
                  ? "Save prompt"
                  : "Submit prompt"}
          </Button>
        </div>
      </div>
    </form>
  );
}
