# Portfolio TeddyX

Portfolio personnel full-stack développé avec React, TypeScript, Express et PostgreSQL, avec un back-office d’administration pour gérer les projets, compétences, certifications et messages.

## Stack technique

- Frontend : React + TypeScript + Vite + Tailwind
- Backend : Express + tRPC
- Base de données : PostgreSQL + Drizzle ORM
- Authentification : session cookie + bcrypt
- UI : shadcn/ui + Radix + Lucide + Framer Motion

## Fonctionnalités

- Page d’accueil portfolio
- Fiches de projets détaillées
- Section compétences / certifications
- Formulaire de contact
- Espace d’administration sécurisé
- CMS interne pour modifier les contenus du site

## Prérequis

- Node.js 20+
- PostgreSQL
- Un fichier `.env` avec les variables de configuration

## Variables d’environnement

Créez un fichier `.env` à la racine du projet :

```env
DATABASE_URL=postgresql://user:password@localhost:5432/portfolio
PORT=3000
ADMIN_EMAIL=admin@exemple.com
ADMIN_PASSWORD=motdepassefort
```

## Installation

```bash
npm install
# ou
pnpm install
```

## Base de données

Générer ou synchroniser le schéma :

```bash
npm run db:generate
npm run db:push
```

OU pour migrer :

```bash
npm run db:migrate
```

## Peuplement des données

Pour initialiser les contenus de démonstration et créer l’utilisateur admin :

```bash
ADMIN_EMAIL=admin@exemple.com ADMIN_PASSWORD=motdepassefort npm run seed
```

## Lancer le projet

Mode développement :

```bash
npm run dev
```

Production :

```bash
npm run build
npm run start
```

## Accès admin

Ouvrez l’URL suivante dans le navigateur :

```text
http://localhost:3000/admin
```

Identifiants par défaut (si définis via `ADMIN_EMAIL` et `ADMIN_PASSWORD`) :

```text
Email: admin@exemple.com
Mot de passe: motdepassefort
```

## Scripts disponibles

```bash
npm run dev
npm run build
npm run start
npm run check
npm run test
npm run seed
npm run db:generate
npm run db:migrate
npm run db:push
npm run db:studio
```

## Structure du projet

```text
.
├── client/                # Frontend React
├── server/                # Backend Express + tRPC
├── shared/                # Types et constantes partagées
├── drizzle/               # Schéma et migrations Drizzle
├── patches/               # Correctifs applicatifs
├── .env                   # Variables locales
├── package.json
├── tsconfig.json
├── vite.config.ts
├── vitest.config.ts
├── drizzle.config.ts
└── README.md
```

## Notes

- Le back-office est protégé par une vérification de session côté serveur.
- Si la base de données n’est pas configurée, certaines fonctionnalités admin ne fonctionneront pas.
- Le projet utilise le port 3000 par défaut, et bascule sur un port libre si nécessaire.
