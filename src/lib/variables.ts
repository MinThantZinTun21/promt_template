/**
 * Template placeholder support. A prompt body can contain `{{variable}}` or
 * `{{variable | default value}}` and the app turns those into a fill-in form.
 */

export type TemplateVariable = {
  name: string;
  label: string;
  defaultValue: string;
  multiline: boolean;
};

export type TemplateSegment =
  | { kind: "text"; value: string }
  | { kind: "variable"; value: string; name: string };

const PLACEHOLDER = /\{\{\s*([a-zA-Z0-9_.-]{1,48})\s*(?:\|([^}]*))?\}\}/g;

const LONG_FORM_HINT =
  /(text|content|body|code|document|doc|transcript|article|draft|data|source|notes?|email|snippet|input|context|logs?|feedback|copy|brief|spec|resume|description|conversation|diff|schema|list|examples?)$/i;

export function humanizeVariableName(name: string): string {
  const words = name
    .replace(/[_.-]+/g, " ")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .trim()
    .toLowerCase()
    .split(/\s+/);

  return words
    .map((word, index) => (index === 0 ? word.charAt(0).toUpperCase() + word.slice(1) : word))
    .join(" ");
}

function isMultiline(name: string, defaultValue: string): boolean {
  return LONG_FORM_HINT.test(name) || defaultValue.includes("\n") || defaultValue.length > 64;
}

export function extractVariables(body: string): TemplateVariable[] {
  const found = new Map<string, TemplateVariable>();

  for (const match of body.matchAll(PLACEHOLDER)) {
    const name = match[1];
    const defaultValue = (match[2] ?? "").trim();
    const existing = found.get(name);

    if (existing) {
      // First non-empty default wins so repeated placeholders stay consistent.
      if (!existing.defaultValue && defaultValue) {
        existing.defaultValue = defaultValue;
        existing.multiline = isMultiline(name, defaultValue);
      }
      continue;
    }

    found.set(name, {
      name,
      label: humanizeVariableName(name),
      defaultValue,
      multiline: isMultiline(name, defaultValue),
    });
  }

  return [...found.values()];
}

export function tokenizeTemplate(body: string): TemplateSegment[] {
  const segments: TemplateSegment[] = [];
  let cursor = 0;

  for (const match of body.matchAll(PLACEHOLDER)) {
    const start = match.index ?? 0;
    if (start > cursor) {
      segments.push({ kind: "text", value: body.slice(cursor, start) });
    }
    segments.push({ kind: "variable", value: match[0], name: match[1] });
    cursor = start + match[0].length;
  }

  if (cursor < body.length) {
    segments.push({ kind: "text", value: body.slice(cursor) });
  }

  return segments;
}

/**
 * Substitutes filled values. Empty values fall back to the declared default and,
 * failing that, keep a readable `[name]` marker so nothing silently disappears.
 */
export function renderTemplate(body: string, values: Record<string, string>): string {
  return body.replace(PLACEHOLDER, (_full, rawName: string, rawDefault?: string) => {
    const filled = values[rawName]?.trim();
    if (filled) return values[rawName];

    const fallback = (rawDefault ?? "").trim();
    if (fallback) return fallback;

    return `[${humanizeVariableName(rawName).toLowerCase()}]`;
  });
}

export function countWords(value: string): number {
  const trimmed = value.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

/** Rough token estimate; good enough for a size hint next to the prompt body. */
export function estimateTokens(value: string): number {
  return Math.max(1, Math.round(value.trim().length / 4));
}
