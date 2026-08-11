import { z } from "zod";

import { isCategoryId, isPromptTypeId, type CategoryId, type PromptTypeId } from "@/lib/taxonomy";
import { newId, nowIso } from "@/lib/utils";

export const ANONYMOUS = "Anonymous";

export type PersonalPromptBaseRef = {
  publicId: string;
  publicSlug: string;
  publicTitle: string;
};

export type PersonalPromptRecord = {
  id: string;
  /**
   * When present, this prompt is a fork of a public library prompt.
   * (No local notion of "ownership" exists; it's still just a private draft.)
   */
  base?: PersonalPromptBaseRef;

  title: string;
  summary: string;
  body: string;
  usageNotes: string;

  promptType: PromptTypeId;
  category: CategoryId;
  tags: string[];
  models: string[];
  contributor: string;

  createdAt: string;
  updatedAt: string;
};

export type PersonalFavoriteKey = `public:${string}` | `personal:${string}`;

const STORAGE_KEYS = {
  prompts: "promptshelf:personal:prompts",
  favorites: "promptshelf:personal:favorites",
} as const;

const STORAGE_SCHEMA = {
  prompts: z.record(
    z.string(),
    z.object({
      id: z.string(),
      base: z
        .object({
          publicId: z.string(),
          publicSlug: z.string(),
          publicTitle: z.string(),
        })
        .optional(),
      title: z.string(),
      summary: z.string(),
      body: z.string(),
      usageNotes: z.string(),
      promptType: z.string(),
      category: z.string(),
      tags: z.array(z.string()),
      models: z.array(z.string()),
      contributor: z.string(),
      createdAt: z.string(),
      updatedAt: z.string(),
    }),
  ),
  favorites: z.array(z.string()),
} as const;

const CHANGE_EVENT = "promptshelf:personal-change";

let storeVersion = 0;

function hasWindow() {
  return typeof window !== "undefined";
}

function notify() {
  storeVersion += 1;
  if (!hasWindow()) return;
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function subscribePersonalStore(onStoreChange: () => void) {
  if (!hasWindow()) return () => {};
  window.addEventListener(CHANGE_EVENT, onStoreChange);
  window.addEventListener("storage", onStoreChange);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

export function getPersonalStoreVersion() {
  return `client:${storeVersion}`;
}

function readRaw(key: string): unknown {
  if (!hasWindow()) return undefined;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : undefined;
  } catch {
    return undefined;
  }
}

function writeRaw(key: string, value: unknown) {
  if (!hasWindow()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    notify();
  } catch {
    // Private browsing / quota exceeded. We prefer a stale UI over crashing.
  }
}

export function readPersonalPrompts(): Record<string, PersonalPromptRecord> {
  const parsed = STORAGE_SCHEMA.prompts.safeParse(readRaw(STORAGE_KEYS.prompts));
  if (!parsed.success) return {};
  // Narrow promptType/category at runtime with taxonomy helpers.
  const out: Record<string, PersonalPromptRecord> = {};
  for (const [id, record] of Object.entries(parsed.data)) {
    if (!isPromptTypeId(record.promptType) || !isCategoryId(record.category)) continue;
    out[id] = {
      ...record,
      id,
      promptType: record.promptType,
      category: record.category,
    };
  }
  return out;
}

export function writePersonalPrompts(next: Record<string, PersonalPromptRecord>) {
  writeRaw(STORAGE_KEYS.prompts, next);
}

export function listPersonalPrompts(): PersonalPromptRecord[] {
  const prompts = Object.values(readPersonalPrompts());
  return prompts.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function searchPersonalPrompts(query: string, limit = 8): PersonalPromptRecord[] {
  const tokens = query.toLowerCase().match(/[\p{L}\p{N}_]+/gu) ?? [];
  const prompts = listPersonalPrompts();
  if (!tokens.length) return prompts.slice(0, limit);

  return prompts
    .filter((prompt) => {
      const haystack = [
        prompt.title,
        prompt.summary,
        prompt.body,
        prompt.usageNotes,
        prompt.tags.join(" "),
        prompt.models.join(" "),
        prompt.promptType,
        prompt.category,
      ]
        .join(" ")
        .toLowerCase();
      return tokens.every((token) => haystack.includes(token));
    })
    .slice(0, limit);
}

export function getPersonalPrompt(id: string): PersonalPromptRecord | undefined {
  return readPersonalPrompts()[id];
}

export function upsertPersonalPrompt(record: PersonalPromptRecord) {
  const prompts = readPersonalPrompts();
  prompts[record.id] = record;
  writePersonalPrompts(prompts);
}

export function deletePersonalPrompt(id: string) {
  const prompts = readPersonalPrompts();
  delete prompts[id];
  writePersonalPrompts(prompts);

  // Also remove stale favorites pointing at the deleted record.
  const favorites = readFavorites();
  const nextFavorites = new Set(
    [...favorites].filter((key) => key !== (`personal:${id}` as PersonalFavoriteKey)),
  );
  writeFavorites(nextFavorites);
}

export function readFavorites(): Set<PersonalFavoriteKey> {
  const raw = readRaw(STORAGE_KEYS.favorites);
  const parsed = STORAGE_SCHEMA.favorites.safeParse(raw);
  if (!parsed.success) return new Set();
  return new Set(
    parsed.data.filter((v): v is PersonalFavoriteKey => {
      if (typeof v !== "string") return false;
      return v.startsWith("public:") || v.startsWith("personal:");
    }),
  );
}

export function writeFavorites(next: Set<PersonalFavoriteKey>) {
  writeRaw(STORAGE_KEYS.favorites, [...next]);
}

export function toggleFavorite(key: PersonalFavoriteKey) {
  const favorites = readFavorites();
  if (favorites.has(key)) favorites.delete(key);
  else favorites.add(key);
  writeFavorites(favorites);
  return favorites;
}

export function isFavorite(key: PersonalFavoriteKey) {
  return readFavorites().has(key);
}

export function createPersonalPromptFromPublic(input: {
  publicId: string;
  publicSlug: string;
  publicTitle: string;
  values: {
    title: string;
    summary: string;
    body: string;
    usageNotes: string;
    promptType: PromptTypeId;
    category: CategoryId;
    tags: string[];
    models: string[];
    contributor?: string;
  };
}): PersonalPromptRecord {
  const id = newId("ps");
  const now = nowIso();
  return {
    id,
    base: {
      publicId: input.publicId,
      publicSlug: input.publicSlug,
      publicTitle: input.publicTitle,
    },
    title: input.values.title,
    summary: input.values.summary,
    body: input.values.body,
    usageNotes: input.values.usageNotes,
    promptType: input.values.promptType,
    category: input.values.category,
    tags: input.values.tags,
    models: input.values.models,
    contributor: input.values.contributor?.trim() ? input.values.contributor.trim() : ANONYMOUS,
    createdAt: now,
    updatedAt: now,
  };
}

export function duplicatePersonalPrompt(existing: PersonalPromptRecord): PersonalPromptRecord {
  const now = nowIso();
  const id = newId("ps");
  return {
    ...existing,
    id,
    createdAt: now,
    updatedAt: now,
  };
}


