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

## Content

News goes in `content/news`, articles in `content/articles`, and the about text in `content/about` (one file per language). Posts are Markdown with the front matter described in `content/articles/how-to-publish.md`.
