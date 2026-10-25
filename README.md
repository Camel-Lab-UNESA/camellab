# Camellab

Site for Camellab, an AI research lab. The landing page introduces the lab; news and longer articles live in `content/`.

## Stack

- Nuxt 4 with Nuxt UI and Nuxt Content
- Better Auth backed by Supabase Postgres
- Resend for confirmation and password reset email
- English and Bahasa Indonesia

## Setup

Requires Node.js and pnpm.

```bash
pnpm install
cp .env.example .env
```

Fill in `.env`, run `supabase/setup.sql` once in the Supabase SQL editor, then create the auth tables:

```bash
pnpm db:migrate
pnpm dev
```

The site runs at `http://localhost:3000`.

## Scripts

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Development server |
| `pnpm build` | Production build |
| `pnpm preview` | Preview the production build |
| `pnpm generate` | Static generation |
| `pnpm db:migrate` | Create or update the Better Auth tables |
| `pnpm test` | Run the front-matter and validation tests |

## Content

News goes in `content/news`, articles in `content/articles`, and the about text in `content/about` (one file per language). Posts are Markdown with the front matter described in `content/articles/how-to-publish.md`.

Users with the `internal` role can also publish from `/admin`. Saving commits the Markdown file to `GITHUB_REPO` on `GITHUB_BRANCH` with the GitHub Contents API, then Vercel redeploys. Requires `GITHUB_TOKEN` with Contents read and write; see `.env.example`.

Each post has a `visibility`: `public`, `members` (anyone signed in), `students`, `lecturers` or `internal`. The internal team reads everything. Pages get posts from `server/api/posts`, which filters by the reader's role; the raw Nuxt Content endpoints for news and articles are closed (`server/utils/content.ts`). Images uploaded in the admin are committed to `public/uploads`. Videos are YouTube links only.

In dev (`pnpm dev`), the admin writes to `content/` and `public/uploads/` on disk instead of committing.
