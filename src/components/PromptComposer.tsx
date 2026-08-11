"use client";

import { Fragment, useMemo, useState } from "react";

import { CopyButton } from "@/components/CopyButton";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { cx } from "@/lib/utils";
import {
  countWords,
  estimateTokens,
  extractVariables,
  renderTemplate,
  tokenizeTemplate,
} from "@/lib/variables";

type Mode = "filled" | "template";

/**
 * Renders the prompt body and, when it contains `{{placeholders}}`, a form that
 * fills them in. Copying always copies exactly what the preview shows.
 */
export function PromptComposer({ body, promptId }: { body: string; promptId: string }) {
  const variables = useMemo(() => extractVariables(body), [body]);
  const segments = useMemo(() => tokenizeTemplate(body), [body]);

  const [values, setValues] = useState<Record<string, string>>({});
  const [mode, setMode] = useState<Mode>("filled");

  const rendered = useMemo(() => renderTemplate(body, values), [body, values]);
  const filledCount = variables.filter((variable) => values[variable.name]?.trim()).length;
  const output = mode === "filled" ? rendered : body;

  const setValue = (name: string, value: string) => {
    setValues((current) => ({ ...current, [name]: value }));
  };

  const applyDefaults = () => {
    const next: Record<string, string> = { ...values };
    for (const variable of variables) {
      if (!next[variable.name]?.trim() && variable.defaultValue) {
        next[variable.name] = variable.defaultValue;
      }
    }
    setValues(next);
  };

  const hasDefaults = variables.some((variable) => Boolean(variable.defaultValue));

  return (
    <div className={cx("grid gap-4", variables.length > 0 && "xl:grid-cols-[340px_1fr]")}>
      {variables.length > 0 && (
        <section
          aria-label="Fill in the template"
          className="flex flex-col rounded-[var(--r-xl)] border border-separator bg-card"
        >
          <header className="hairline-b flex items-center gap-2 px-4 py-3">
            <span className="text-[var(--sys-blue)]">
              <Icon name="curlyBraces" size={17} strokeWidth={1.9} />
            </span>
            <h2 className="flex-1 text-subheadline font-semibold text-label">Fill in</h2>
            <span className="text-caption-1 tabular-nums text-label-tertiary">
              {filledCount}/{variables.length}
            </span>
          </header>

          <div className="flex flex-col gap-3.5 p-4">
            {variables.map((variable) => {
              const id = `var-${variable.name}`;
              const value = values[variable.name] ?? "";

              return (
                <div key={variable.name} className="flex flex-col gap-1">
                  <label
                    htmlFor={id}
                    className="flex items-baseline justify-between gap-2 text-footnote font-medium text-label"
                  >
                    {variable.label}
                    {value.trim() ? (
                      <span className="text-[var(--sys-green)]">
                        <Icon name="checkmark" size={12} strokeWidth={2.6} />
                      </span>
                    ) : (
                      <code className="text-caption-2 text-label-quaternary">
                        {`{{${variable.name}}}`}
                      </code>
                    )}
                  </label>

                  {variable.multiline ? (
                    <textarea
                      id={id}
                      rows={4}
                      value={value}
                      placeholder={variable.defaultValue || `Paste your ${variable.label.toLowerCase()}…`}
                      onChange={(event) => setValue(variable.name, event.target.value)}
                      className="resize-y rounded-[var(--r-sm)] border border-separator bg-fill-quaternary px-3 py-2 font-mono text-footnote text-label outline-none transition-colors placeholder:text-label-tertiary focus:border-[var(--sys-blue)] focus:bg-canvas"
                    />
                  ) : (
                    <input
                      id={id}
                      type="text"
                      value={value}
                      placeholder={variable.defaultValue || variable.label}
                      onChange={(event) => setValue(variable.name, event.target.value)}
                      className="h-9 rounded-[var(--r-sm)] border border-separator bg-fill-quaternary px-3 text-footnote text-label outline-none transition-colors placeholder:text-label-tertiary focus:border-[var(--sys-blue)] focus:bg-canvas"
                    />
                  )}
                </div>
              );
            })}
          </div>

          <footer className="hairline-t flex items-center gap-2 px-4 py-3">
            {hasDefaults && (
              <Button variant="gray" size="sm" onClick={applyDefaults}>
                Use suggested values
              </Button>
            )}
            {filledCount > 0 && (
              <Button variant="plain" size="sm" onClick={() => setValues({})}>
                Reset
              </Button>
            )}
          </footer>
        </section>
      )}

      <section aria-label="Prompt" className="min-w-0 rounded-[var(--r-xl)] border border-separator bg-card">
        <header className="hairline-b flex flex-wrap items-center gap-2 px-4 py-3">
          {variables.length > 0 ? (
            <SegmentedControl
              ariaLabel="Preview mode"
              value={mode}
              onChange={(id) => setMode(id as Mode)}
              size="sm"
              className="w-52"
              segments={[
                { id: "filled", label: "Preview" },
                { id: "template", label: "Template" },
              ]}
            />
          ) : (
            <h2 className="text-subheadline font-semibold text-label">Prompt</h2>
          )}

          <span className="ml-auto flex items-center gap-3 text-caption-1 tabular-nums text-label-tertiary">
            <span>{countWords(output)} words</span>
            <span>~{estimateTokens(output)} tokens</span>
          </span>

          <CopyButton
            text={output}
            promptId={promptId}
            variant="tinted"
            size="sm"
            label={mode === "filled" && filledCount > 0 ? "Copy filled" : "Copy"}
          />
        </header>

        <div className="max-h-[62dvh] overflow-auto p-4">
          <pre className="whitespace-pre-wrap break-words font-mono text-footnote leading-[1.65] text-label">
            {mode === "template"
              ? segments.map((segment, index) =>
                  segment.kind === "variable" ? (
                    <span key={index} className="ps-var">
                      {segment.value}
                    </span>
                  ) : (
                    <Fragment key={index}>{segment.value}</Fragment>
                  ),
                )
              : segments.map((segment, index) => {
                  if (segment.kind === "text") return <Fragment key={index}>{segment.value}</Fragment>;

                  const value = values[segment.name]?.trim();
                  const variable = variables.find((item) => item.name === segment.name);
                  const shown = value || variable?.defaultValue;

                  return shown ? (
                    <span key={index} className={value ? "ps-var-filled" : "ps-var"}>
                      {shown}
                    </span>
                  ) : (
                    <span key={index} className="ps-var">
                      {`[${variable?.label.toLowerCase() ?? segment.name}]`}
                    </span>
                  );
                })}
          </pre>
        </div>
      </section>
    </div>
  );
}
