# AGENTS.md

## Project overview

Portfolio v2 of Ted Yvan Kamanan (networks, cybersecurity, software engineering student). Next.js 16 (App Router, Cache Components) + Supabase (Postgres, Auth, Storage), bilingual FR/EN, with an online admin. Design direction: « Graphe réseau vivant » — dark, sharp corners (one 4px radius), IBM Plex Sans + Mono, each content type has its own colour AND shape (project = square, skill = dot, journey = diamond, contact = ring). No gradients, glows, glass or scroll fade-ins; the home graph is the one animated element.

The v1 (Vite + Express + tRPC + Drizzle) lives on `main` until the v2 cut-over; this branch (`v2`) contains only the new app.

## Key directories

- `src/app/[lang]/`: public site, one route tree per locale (`/fr`, `/en`). `lang` is a root param (`next/root-params`).
- `src/app/admin/`: admin (own root layout, French only). `(panel)/` pages call `requireAdmin()`; `actions.ts` holds every mutation.
- `src/lib/admin/`: `collections.ts` describes each editable table (fields drive forms, validation and lists), `auth.ts` (`requireAdmin`), `form-data.ts` (parsing/validation).
- `src/i18n/`: locales (`config.ts`), UI dictionaries (`dictionaries/*.json`), `getLocale()` / `getDictionary()`.
- `src/lib/supabase/`: `public.ts` (anon client, no cookies — for cached public reads), `server.ts` (session client for admin and Server Actions), `browser.ts` (admin uploads straight to Storage).
- `src/lib/content.ts`: cached content reads (`"use cache"` + `cacheLife` + `cacheTag("content")`).
- `src/proxy.ts`: redirects paths without a locale to `/fr` or `/en` (Accept-Language); on `/admin` it refreshes the Supabase session and sends visitors without one to `/admin/login`.
- `supabase/migrations/`: schema, RLS policies, storage bucket. Source of truth for the database.
- `scripts/import-legacy.mjs`: one-off import of v1 data into the v2 schema.

## Working conventions

- Translatable text is stored as `jsonb` `{ "fr": "...", "en": "..." }` (`Localized`); render it with `pick(value, locale)`, which falls back to the other language.
- Public pages read content through `src/lib/content.ts` only. Admin mutations must call `revalidateTag(CONTENT_TAG, "max")` (or `updateTag`) after writing.
- Never use the cookie-based client inside a `"use cache"` function; never use a service-role key in the app. Security is enforced by RLS (`public.is_admin()`), not by the UI.
- To make a new table editable, add it to `src/lib/admin/collections.ts` (limits must match the SQL constraints). Files are uploaded from the browser, never through a Server Action (Vercel body limit).
- Contact messages go through the `public.submit_message` RPC (rate-limited), never a direct insert.
- Any schema change is a new file in `supabase/migrations/`, validated before use.

## Typical commands

- `npm run dev`, `npm run build`, `npm run start`
- `npm run lint`, `npm run typecheck`
- `npm run import:legacy -- --dry-run` then `npm run import:legacy` (needs `DATABASE_URL` in `.env`; reads v1 tables from the `legacy` schema created by `20261102000000_archive_v1.sql`)

## Validation

Before concluding work: `npm run typecheck`, `npm run lint`, `npm run build`, then check the affected pages in both locales.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
