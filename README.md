# Ted Yvan KAMANAN — Portfolio & CMS

Portfolio personnel full-stack (réseaux, sécurité informatique, génie logiciel) avec un espace d'administration sécurisé pour gérer tout le contenu du site : profil, projets, compétences, certifications, parcours, langues et messages.

## Stack technique

- **Frontend** : React 19, TypeScript, Vite 7, Tailwind CSS 4, Framer Motion, shadcn/ui (Radix)
- **Backend** : Express, tRPC 11, validation Zod
- **Base de données** : PostgreSQL avec Drizzle ORM
- **Authentification** : JWT signé (HS256, issuer/audience) dans un cookie `httpOnly` `SameSite=Lax`, mots de passe hachés avec bcrypt, accès admin vérifié côté serveur (`adminProcedure`)

## Fonctionnalités

- Page d'accueil : présentation, compétences, certifications, parcours, langues, projets vedettes, formulaire de contact
- Galerie `/projects` avec recherche et filtre par catégorie, fiches `/projects/:slug`
- Thème clair/sombre, animations respectant `prefers-reduced-motion`
- Espace `/admin` (connexion sur `/admin/login`) : CMS complet du contenu et lecture des messages
- Sécurité : pas d'inscription publique, limitation des tentatives de connexion et des envois du formulaire de contact, erreurs internes masquées en production

## Prérequis

- Node.js 20 ou plus
- Une base PostgreSQL

## Installation

```bash
npm install
cp .env.example .env
```

Renseigne ensuite `.env` (voir [.env.example](.env.example)) :

| Variable | Rôle |
| --- | --- |
| `DATABASE_URL` | Chaîne de connexion PostgreSQL |
| `JWT_SECRET` | Longue chaîne aléatoire pour signer les sessions (`openssl rand -base64 48`) |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Compte admin créé par le seed |
| `PORT` | Port du serveur (3000 par défaut, bascule sur un port libre si occupé) |

Ne commite jamais `.env` : il est ignoré par Git.

## Base de données

```bash
npm run db:migrate   # applique les migrations du dossier drizzle/
npm run seed         # remplit les tables vides et crée le compte admin
```

Le seed ne remplace jamais le contenu existant : il ne remplit que les tables vides et ajoute les projets manquants (identifiés par leur slug). Pour tout réinitialiser, utilise `npm run seed -- --reset` : **cela efface d'abord tout le contenu**.

Pour repartir d'une base vierge sans Node.js, exécute [drizzle/rebuild.sql](drizzle/rebuild.sql) dans l'éditeur SQL de ton hébergeur PostgreSQL ou avec `psql` (après y avoir mis l'email et le mot de passe admin) : il supprime tout, recrée le schéma, insère le contenu et marque les migrations comme appliquées. Ce fichier est généré à partir du schéma et de [server/seedData.ts](server/seedData.ts) : régénère-le s'ils changent.

Après une modification de [drizzle/schema.ts](drizzle/schema.ts), génère une nouvelle migration avec `npm run db:generate`. Ne modifie jamais une migration déjà appliquée.

## Développement

```bash
npm run dev      # Vite + Express sur http://localhost:3000
npm run check    # vérification TypeScript
npm test         # tests Vitest
```

L'administration est accessible sur `http://localhost:3000/admin/login` avec les identifiants `ADMIN_EMAIL` / `ADMIN_PASSWORD` du seed. Le seed ne modifie jamais un compte existant : après avoir changé `ADMIN_PASSWORD` dans `.env`, lance `npm run admin:password`.

## Production

```bash
npm run build    # build du frontend (dist/public) et du serveur (dist/index.js)
npm run start
```

Sur l'hébergeur, définis les mêmes variables d'environnement que dans `.env`, avec `NODE_ENV=production`. Le serveur fait confiance au premier proxy (`trust proxy`) pour connaître l'IP réelle des visiteurs.

## Intégration continue

À chaque push sur `main` et à chaque pull request, GitHub Actions lance `npm run check`, `npm test` et `npm run build` (voir [.github/workflows/ci.yml](.github/workflows/ci.yml)).

## Structure

```text
client/    Frontend React (pages, composants, styles)
server/    API Express + tRPC, authentification, accès base, seed, tests
shared/    Constantes et types partagés
drizzle/   Schéma, migrations et métadonnées Drizzle
```
