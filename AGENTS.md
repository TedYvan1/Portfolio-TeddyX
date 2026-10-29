# AGENTS.md

## Project overview

This repository is a portfolio and CMS application for a personal brand site. The app is split between a Vite/React frontend and an Express + tRPC backend, backed by PostgreSQL via Drizzle ORM. The admin area is protected by JWT-based auth and `adminProcedure` checks.

See [README.md](README.md) for the full product overview, environment setup, and deployment notes.

## Key directories

- `client/src/`: React app, pages, reusable components, hooks, contexts, and style utilities.
- `server/`: backend entry points, routers, auth, database, and tests.
- `shared/`: shared constants and types used by client and server.
- `drizzle/`: schema, migrations, and database metadata.
- `components.json`: UI component registry for the project’s design system.

## Working conventions

- Keep client and server responsibilities separated: UI logic belongs in `client/src`, API and auth logic in `server/`.
- Prefer the existing architecture and naming patterns instead of introducing new frameworks or patterns without a clear need.
- When changing database behavior, update the Drizzle schema and regenerate or push migrations as needed.
- Treat admin-only access as a first-class concern: routes and actions tied to admin functionality should verify role-based permissions consistently.
- Preserve the project’s current stack choices: React + Vite on the client, Express + tRPC on the server, and Drizzle/Postgres for persistence.
- The project historically removed Manus-specific code and keeps the stack focused on standard Postgres patterns.

## Typical commands

Run project tasks from the repo root:

- `npm install` to install dependencies (npm is the only package manager; `package-lock.json` is the lockfile)
- `npm run dev` to run the Vite + Express app in development mode
- `npm run check` to run the TypeScript type check
- `npm run build` to build the frontend and server bundles
- `npm run build:vercel` to produce the Vercel Build Output (`.vercel/output`) used in production
- `npm test` to run Vitest tests
- `npm run seed` to seed the database content
- `npm run db:generate` and `npm run db:migrate` for Drizzle schema updates

## Environment and configuration

- Configure the required environment variables before running the app or database commands.
- Backend env vars use the service names described in [README.md](README.md), while frontend values must be prefixed with `VITE_` as needed.
- JWT auth and database setup are all part of the standard working environment for this project.

## Safe change guidance

- Keep fixes scoped to the relevant layer and avoid broad refactors.
- Match the existing UI and data flow conventions instead of creating parallel implementations.
- Prefer minimal, explicit edits that align with the codebase’s current patterns.
- Verify with the smallest relevant command after changes, usually `npm run check` and the related test or feature workflow.

## Validation

Before concluding work, validate the changed behavior with the relevant commands, prioritizing:

1. `npm run check` for TypeScript correctness
2. `npm test` for regression coverage
3. Feature-specific checks or manual validation for UI or API changes
