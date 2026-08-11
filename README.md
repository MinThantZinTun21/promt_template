# PromptShelf

A public library of prompt templates, filed by **what the prompt does** rather than by topic. Anyone can browse and search; signed-in members can save, fork, and submit prompts to the shared library.

The interface follows Apple's Human Interface Guidelines: system font stack, the Dynamic Type scale, translucent chrome, inset grouped lists, generous hit targets, and HIG-standard motion durations and easing.

## Features

- **20 predefined prompt types** — every prompt is filed under exactly one fixed type (System Prompt, Few-Shot Examples, Chain of Thought, Extraction & Structured Output, Agent & Tool Use, …). Types are a closed set so the taxonomy stays useful; free-form tags absorb everything else.
- **A second axis for discipline** — Engineering, Writing, Marketing, Product, Design, Data, Support, Research, and more, so the same prompt shape can be found by the team that needs it.
- **Ranked full-text search** — SQLite FTS5 with BM25 scoring over titles, summaries, bodies, and tags, plus a ⌘K command palette for jump-to-prompt navigation.
- **Filter and sort without losing your place** — type, discipline, tag, model, and sort are all URL state, so every view is shareable and back-button safe.
- **Fill-in composer** — prompts declare `{{variables}}` with optional defaults (`{{tone | direct}}`); the detail page renders a form, previews the interpolated result, and copies it in one click.
- **Accounts and a personal library** — save favourites, fork any public prompt into your own copy, keep drafts private, and edit or delete what you authored.
- **Community submissions with review** — members submit to the shared library, an admin publishes or rejects from `/admin`, and featured prompts surface on the home page.
- **Light, dark, and system appearance** — persisted per device and applied before first paint, so there is no flash.

## Stack

| Concern | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router, Server Components, Server Actions) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 with HIG design tokens in `globals.css` |
| Database | SQLite via the built-in `node:sqlite` module, WAL mode, FTS5 |
| Auth | bcrypt password hashing, `jose`-signed JWT in an httpOnly cookie |
| Validation | Zod, at the Server Action boundary |

No ORM: the data layer is hand-written SQL in `src/lib/prompts.ts` and `src/lib/users.ts`. FTS5 does not survive a query builder's abstraction gracefully, and the schema is small enough that direct SQL is the clearer option.

## Getting started

Requires **Node.js 22.5 or newer** (`node:sqlite` is unavailable before that).

```bash
npm install
npm run dev
```

Open http://localhost:3000. On first boot the app creates `data/promptshelf.db`, applies the schema, and seeds six accounts plus 45 starter prompts — 43 published and 2 waiting in the review queue so the moderation flow has something to act on. The database file is gitignored.

Sign in with any seeded account — password `promptshelf`:

| Email | Role |
| --- | --- |
| `team@promptshelf.app` | admin (can moderate and feature) |
| `maya@promptshelf.app` | member |
| `adaeze@promptshelf.app` | member |

Production requires `SESSION_SECRET` (32 characters or more) in the environment — the app throws on startup without it. In development a fallback secret keeps sign-in working with no setup:

```bash
echo "SESSION_SECRET=$(openssl rand -hex 32)" >> .env.local
```

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
    actions/         server actions for auth and prompt mutations
    api/search/      JSON search endpoint powering the command palette
    browse/          search, filter, sort
    types/[id]/      one page per predefined prompt type
    p/[slug]/        prompt detail, plus /edit for the author
    library/         saved, published, and draft prompts
    u/[handle]/      public profile
    admin/           submission review and featuring
  components/
    ui/              HIG primitives (Button, InsetGroup, ListRow, Sheet, …)
  lib/
    db.ts            connection, schema, FTS5 triggers
    prompts.ts       search and CRUD
    taxonomy.ts      the fixed prompt types and disciplines
    variables.ts     {{variable}} parsing and rendering
    auth.ts          sessions and permission checks
```

## Notes on the data model

`prompts` carries the type, discipline, tags, and target models alongside `status` (`private`, `pending`, `published`) and `forked_from`. Search visibility is driven entirely by `status`, so a draft is invisible to everyone but its author and never indexed. Triggers keep the `prompts_fts` virtual table in sync on insert, update, and delete, which means search cannot silently drift from the source rows.
