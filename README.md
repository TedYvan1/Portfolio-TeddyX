# Ted Yvan KAMANAN — Portfolio

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
- Sécurité : pas d'inscription publique, limitation des tentatives de connexion et des envois du formulaire de contact, erreurs internes masquées en production

## Structure

```text
client/    Frontend React (pages, composants, styles)
server/    API Express + tRPC, authentification, accès base, seed, tests
shared/    Constantes et types partagés
drizzle/   Schéma, migrations et métadonnées Drizzle
```
