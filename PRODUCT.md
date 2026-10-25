# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Visitors (anyone):** want to find out what Camellab is and read its news and articles. The landing page's job is to tell them about the lab.
- **Members:** anyone can sign up. At sign-up they pick student or lecturer (self-declared, not checked). `internal` is for lab staff and admins and is assigned by hand in the database, never self-selected.

## Product Purpose

Camellab is an AI research lab. The site introduces the lab, publishes lab news, and works as a channel for longer articles, much like a Medium publication. Success means a first-time visitor leaves knowing what the lab is about.

## Positioning

Undecided. The lab's specific research areas, people, and distinguishing work haven't been provided yet. Future work must not invent them.

## Operating Context

- News and articles are written as Markdown through Nuxt Content, a git-based CMS (Nuxt Studio is an optional visual editor). Only news and articles go through the CMS.
- Everything else (sign-up, sign-in, password reset, profile) is regular app UI.
- Hosted on Vercel in Singapore (sin1), with Supabase Postgres in a private schema and email sent through Resend. Everything has to fit free-tier limits.

## Capabilities and Constraints

- Stack: Nuxt 4, Nuxt UI v4, Nuxt Content v3, Better Auth.
- Accounts: sign up, then sign in with email or username. Email confirmation is switched by `REQUIRE_EMAIL_VERIFICATION`. Password reset and a profile page (name, username, department or program, bio, role badge) are in place.
- Languages: English and Bahasa Indonesia, with a switch in the UI. How articles get translated is still undecided.

## Brand Commitments

- Name: Camellab.
- No logo, palette, or typeface has been committed. The repo only has the default Nuxt favicon.
- From the user: the design should feel simple, but not bland and not corporate.

## Evidence on Hand

None yet: no real lab description, members, projects, publications, news, or articles. `content/index.md` is a placeholder. Never fabricate members, publications, partners, results, or metrics. Placeholder copy must read as a placeholder and be easy to replace through the CMS.

## Product Principles

1. The lab comes first: the site explains who the lab is before it asks anything of the visitor.
2. The writing is the product: news and articles have to be comfortable to read at length.
3. Open door: anyone can join, and getting an account should take little effort.
4. Honest content: placeholders stay placeholders until the lab supplies real material.

## Accessibility & Inclusion

Bilingual (English and Bahasa Indonesia) from the start. No other specific requirements have been stated.
