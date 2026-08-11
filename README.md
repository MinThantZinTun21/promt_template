# PromptShelf

A public library of prompt templates, filed by **what the prompt does** rather than by topic. Anyone can browse and search the seeded collection. Favorites, forks, and new drafts stay in this browser — there are no accounts.

The interface follows Apple's Human Interface Guidelines: system font stack, the Dynamic Type scale, translucent chrome, inset grouped lists, generous hit targets, and HIG-standard motion durations and easing.

## Features

- **20 predefined prompt types** — every prompt is filed under exactly one fixed type (System Prompt, Few-Shot Examples, Chain of Thought, Extraction & Structured Output, Agent & Tool Use, …). Types are a closed set so the taxonomy stays useful; free-form tags absorb everything else.
- **A second axis for discipline** — Engineering, Writing, Marketing, Product, Design, Data, Support, Research, and more, so the same prompt shape can be found by the team that needs it.
- **Ranked full-text search** — SQLite FTS5 with BM25 scoring over public titles, summaries, bodies, and tags, plus a ⌘K command palette for jump-to-prompt navigation.
- **Filter and sort without losing your place** — type, discipline, tag, model, and sort are all URL state, so every view is shareable and back-button safe.
- **Fill-in composer** — prompts declare `{{variables}}` with optional defaults (`{{tone | direct}}`); the detail page renders a form, previews the interpolated result, and copies it in one click.
- **Local-first personal shelf** — favorite and fork public prompts, or write a private draft. Personal data lives in `localStorage` and never writes back to SQLite.
- **Light, dark, and system appearance** — persisted per device and applied before first paint, so there is no flash.

## Stack

| Concern | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router, Server Components) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 with HIG design tokens in `globals.css` |
| Database | Read-only SQLite via `node:sqlite` (WAL mode, FTS5) for the public library |
| Personal data | Browser `localStorage` |
| Validation | Zod, on the client for personal drafts |

No ORM: the public data layer is hand-written SQL in `src/lib/prompts.ts`. FTS5 does not survive a query builder's abstraction gracefully, and the schema is small enough that direct SQL is the clearer option.

## Getting started

Requires **Node.js 22.5 or newer** (`node:sqlite` is unavailable before that).

```bash
npm install
npm run dev
```

Open http://localhost:3000. On first boot the app creates `data/promptshelf.db`, applies the schema, and seeds the public library. The database file is gitignored. There is nothing to sign in to.

On Vercel the same seed runs into `/tmp` on each cold start — the public library is generated from `src/lib/seed-data.ts`, not from a checked-in database. Set the project to Node.js 22.5+.

## Scripts

```bash
npm run dev        # dev server
npm run build      # production build
npm run start      # serve the production build
npm run lint       # eslint
npm run typecheck  # tsc --noEmit
npm run db:reset   # delete the SQLite file so the next boot reseeds
```

## Project layout

```
src/
  app/
    api/search/      JSON search endpoint for the public library
    browse/          search, filter, sort (public prompts)
    types/[id]/      one page per predefined prompt type
    p/[slug]/        public or personal prompt detail, plus /edit for drafts
    library/         private drafts stored in this browser
    new/             create a private draft
  components/
    ui/              HIG primitives (Button, InsetGroup, ListRow, Sheet, …)
  lib/
    db.ts            connection and schema
    prompts.ts       public search and reads
    personal-store.ts localStorage schema for drafts and favorites
    taxonomy.ts      the fixed prompt types and disciplines
    variables.ts     {{variable}} parsing and rendering
```

## Notes on the data model

The shared SQLite file is the public library only. Personal prompts are records in `localStorage` (`promptshelf:personal:prompts`) that may optionally reference a public base prompt. Favorites are stored separately (`promptshelf:personal:favorites`). Browse counts show public prompts; `/library` search covers only personal drafts.
