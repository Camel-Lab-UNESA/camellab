-- Run once in the Supabase SQL editor.
--
-- The app's tables live in a private `app` schema. Supabase's Data API only exposes
-- `public`, and anon/authenticated get no privileges here, so the anon key can't
-- reach this data and RLS isn't needed. Only the Nuxt server, logging in as
-- camellab_web, can read or write it.

create role camellab_web login password 'REPLACE_WITH_A_LONG_RANDOM_PASSWORD';

create schema app;
revoke all on schema app from public, anon, authenticated;
grant usage, create on schema app to camellab_web;

-- Unqualified table names (what Better Auth uses) resolve to the app schema.
alter role camellab_web set search_path = app;

-- Later, to make someone an internal user:
--   update app."user" set role = 'internal' where email = 'someone@example.com';
