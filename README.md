# Ted Yvan KAMANAN — Portfolio v2

Portfolio bilingue (FR/EN) d'un étudiant en réseaux, sécurité informatique et génie logiciel, avec un espace d'administration en ligne.

## Stack

- **Next.js 16** (App Router, Cache Components), TypeScript, Tailwind CSS 4
- **Supabase** : PostgreSQL avec règles RLS, authentification de l'admin, stockage des images et du CV
- Déploiement : **Vercel**

## Démarrer

```bash
npm install
cp .env.example .env    # renseigner l'URL et la clé publique Supabase
npm run dev             # http://localhost:3000 → redirige vers /fr ou /en
```

## Base de données

Les migrations sont dans [supabase/migrations](supabase/migrations), à exécuter dans l'ordre (SQL Editor → coller → Run) :

1. `20261102000000_archive_v1.sql` range les tables de la v1 dans le schéma `legacy` (rien n'est supprimé) ;
2. `20261103000000_init.sql` crée le schéma v2 (tables bilingues, règles de sécurité, bucket `media`).

Remplir la base avec le contenu du CV (celui affiché tant que Supabase n'est pas configuré) :

```bash
npm run seed:cv -- --dry-run   # aperçu
npm run seed:cv                # remplace le contenu (messages et admins conservés)
```

Ou reprendre les données de la v1 :

```bash
npm run import:legacy -- --dry-run   # aperçu
npm run import:legacy                # import (remplace le contenu de la v2)
```

## Administration

L'admin est sur `/admin` (connexion par e-mail et mot de passe Supabase). Pour créer le compte :

1. Supabase → **Authentication → Users → Add user** (e-mail + mot de passe, « Auto Confirm User » coché) ;
2. SQL Editor, en remplaçant l'adresse :

   ```sql
   insert into public.admins (user_id)
   select id from auth.users where email = 'ton-adresse@exemple.com';
   ```

Tout le contenu se modifie depuis l'admin (profil, projets, labs, compétences, parcours…). Les fichiers partent directement du navigateur vers le bucket `media` ; chaque enregistrement met à jour le site public immédiatement. Les droits sont appliqués par la base (RLS) : un compte qui n'est pas dans `admins` ne peut rien modifier, même en contournant l'interface.

## Structure

```text
src/app/[lang]/   Site public, une arborescence par langue
src/app/admin/    Administration (connexion, contenus, messages)
src/i18n/         Langues et dictionnaires de l'interface
src/lib/          Lecture du contenu (mise en cache) et clients Supabase
src/lib/admin/    Description des contenus éditables, contrôle d'accès, lecture des formulaires
supabase/         Migrations SQL
scripts/          Import des données de la v1
```
