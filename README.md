# yvan.dev — Portfolio Full-Stack & Cybersécurité

Portfolio professionnel pour Konin Ted Yvan Axel Kamanan. Expérience publique, base de données Supabase (Postgres), espace d'administration protégé et CMS complet.

## Stack

**React 19, Vite 7, TypeScript, Tailwind CSS 4, Framer Motion, Express, tRPC, Drizzle ORM, PostgreSQL (Supabase), Supabase Auth/JS**. Auth admin par JWT (email + mot de passe haché `bcryptjs`) — aucun OAuth Manus.

## Fonctionnalités

- Page d'accueil avec hero (Aurora, BlurText, ShinyText), présentation, compétences, certifications, projets vedettes et contact.
- Galerie `/projects` avec recherche et filtrage par catégorie.
- Pages détail `/projects/:slug`.
- Mode clair/sombre persistant, animations Framer Motion respectant `prefers-reduced-motion`.
- CMS complet : profil (toutes les données du CV), cartes À propos, certifications, projets, compétences, messages.
- Espace `/admin` protégé par rôle `admin` (`adminProcedure`).

## Installation

```bash
npm install
cp .env.example .env
# Renseigne DATABASE_URL, SUPABASE_URL, SUPABASE_ANON_KEY, JWT_SECRET
```

### Supabase

1. Crée un projet sur https://supabase.com
2. Project Settings > Database > Connection string > URI -> `DATABASE_URL`
3. Project Settings > API > `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
4. Ajoute les mêmes valeurs avec préfixe `VITE_` pour le frontend.

### Base de données

```bash
npm run db:generate   # génère drizzle/0000_*.sql
npm run db:migrate    # ou npm run db:push
npm run seed          # charge le profil, cartes, certifications, projets, compétences
# Crée l'admin si ADMIN_EMAIL + ADMIN_PASSWORD sont définis
ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD=secret npm run seed
```

Tables : `users`, `projects`, `skills`, `messages`, `siteProfile`, `aboutCards`, `certifications`.

## Scripts

```bash
npm run dev      # vite + express (tsx watch)
npm run check    # tsc --noEmit
npm run build    # vite build + esbuild server
npm run start    # node dist/index.js
npm test
```

## Variables d'environnement

Voir `.env.example` : `DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `PORT`.

## Déconnexion de Manus

Toutes les dépendances Manus ont été retirées : `vite-plugin-manus-runtime`, debug collector, `__manus__`, OAuth, `server/_core/{sdk,oauth,storage*,map,dataApi,heartbeat,llm,notification,voiceTranscription}`, `Map.tsx`, `AIChatBox.tsx`, `ManusDialog.tsx`, `mysql2` remplacé par `pg` + `postgres`. Droit Drizzle passé à `postgresql`.

## Auth

- `POST /api/trpc/auth.login` { email, password } -> pose cookie `app_session_id` (JWT 7j)
- `POST /api/trpc/auth.register` -> crée un `users` (nécessite `openId`)
- `POST /api/trpc/auth.logout` -> clear cookie
- `useAuth()` lit `auth.me` (ctx.user via JWT).
