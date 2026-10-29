-- =====================================================================
-- Reconstruction complète de la base du portfolio
-- =====================================================================
-- Ce script :
--   1. SUPPRIME toutes les tables du portfolio (y compris les comptes et
--      les messages reçus via le formulaire de contact) ;
--   2. recrée le schéma actuel (équivalent des migrations 0000_next_frank_castle à 0004_cv_update) ;
--   3. insère le contenu issu du CV (profil, projets, compétences, etc.) ;
--   4. crée le compte administrateur ;
--   5. enregistre les migrations comme appliquées, pour que
--      `npm run db:migrate` ne tente pas de les rejouer.
--
-- Utilisation : coller ce fichier dans l'éditeur SQL de ton hébergeur PostgreSQL
-- (nouvelle requête, sans rien sélectionner), remplacer l'email et le mot de
-- passe admin dans la section 4, puis exécuter.
-- Avec psql : psql "$DATABASE_URL" -f drizzle/rebuild.sql
--
-- Fichier généré à partir de drizzle/schema.ts et server/seedData.ts.
-- =====================================================================

BEGIN;

-- Certains hébergeurs installent pgcrypto (crypt/gen_salt) dans un schéma "extensions".
SET LOCAL search_path = public, extensions;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ---------------------------------------------------------------------
-- 1. Suppression de l'existant
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS "aboutCards", "certifications", "educations", "languages", "messages", "projects", "siteProfile", "skills", "strengths", "users" CASCADE;
DROP TYPE IF EXISTS "public"."level", "public"."role";
DROP SCHEMA IF EXISTS drizzle CASCADE;

-- ---------------------------------------------------------------------
-- 2. Schéma
-- ---------------------------------------------------------------------
CREATE TYPE "public"."level" AS ENUM('Beginner', 'Intermediate', 'Advanced');
CREATE TYPE "public"."role" AS ENUM('user', 'admin');
CREATE TABLE "aboutCards" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "aboutCards_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"label" varchar(10) NOT NULL,
	"title" varchar(120) NOT NULL,
	"description" text NOT NULL,
	"displayOrder" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "certifications" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "certifications_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"title" varchar(255) NOT NULL,
	"issuer" varchar(255) NOT NULL,
	"dateLabel" varchar(80) NOT NULL,
	"type" varchar(80) NOT NULL,
	"description" text NOT NULL,
	"linkUrl" varchar(500),
	"displayOrder" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "educations" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "educations_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"title" varchar(255) NOT NULL,
	"institution" varchar(255) NOT NULL,
	"location" varchar(120),
	"period" varchar(120) NOT NULL,
	"description" text,
	"displayOrder" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "languages" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "languages_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(80) NOT NULL,
	"level" varchar(120) NOT NULL,
	"displayOrder" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "messages" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "messages_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(120) NOT NULL,
	"email" varchar(320) NOT NULL,
	"subject" varchar(180) NOT NULL,
	"message" text NOT NULL,
	"read" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "projects" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "projects_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"title" varchar(180) NOT NULL,
	"slug" varchar(180) NOT NULL,
	"shortDescription" text NOT NULL,
	"description" text NOT NULL,
	"imageUrl" varchar(500),
	"githubUrl" varchar(500),
	"liveUrl" varchar(500),
	"category" varchar(100) NOT NULL,
	"technologies" text NOT NULL,
	"featured" integer DEFAULT 0 NOT NULL,
	"published" integer DEFAULT 1 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "projects_slug_unique" UNIQUE("slug")
);

CREATE TABLE "siteProfile" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "siteProfile_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"displayName" varchar(80) DEFAULT 'Ted Yvan KAMANAN' NOT NULL,
	"fullName" varchar(180) DEFAULT 'Konin Ted Yvan Axel Kamanan' NOT NULL,
	"role" varchar(255) DEFAULT 'Recherche de stage en Génie Logiciel et Réseaux' NOT NULL,
	"heroEyebrow" varchar(180) DEFAULT 'À la recherche d''un stage' NOT NULL,
	"heroLocation" varchar(180) DEFAULT 'Abidjan · Bouaké' NOT NULL,
	"heroTitle" varchar(255) DEFAULT 'Je développe des solutions' NOT NULL,
	"heroTitleAccent" varchar(120) DEFAULT 'claires.' NOT NULL,
	"heroSubtitle" varchar(255) DEFAULT 'Je sécurise mes applications.' NOT NULL,
	"heroDescription" text DEFAULT 'Étudiant en Réseaux & Sécurité Informatique et en Génie Logiciel, je conçois des applications web et mobiles avec une forte capacité d''analyse et d''adaptation. Je recherche un stage pour évoluer vers le développement Full Stack.' NOT NULL,
	"heroTags" varchar(500) DEFAULT 'Flutter · Dart · React,Node.js · Express · PostgreSQL,JWT · Sécurité des API' NOT NULL,
	"codeFocus" varchar(80) DEFAULT 'full-stack' NOT NULL,
	"codeMindset" varchar(80) DEFAULT 'secure-by-design' NOT NULL,
	"codeStack" varchar(255) DEFAULT 'Flutter,React,Node.js,PostgreSQL' NOT NULL,
	"codeStatus" varchar(80) DEFAULT 'building' NOT NULL,
	"aboutEyebrow" varchar(120) DEFAULT '01 / À propos' NOT NULL,
	"aboutTitle" varchar(255) DEFAULT 'Une approche hybride, entre produit et infrastructure.' NOT NULL,
	"aboutDescription" text DEFAULT 'Je suis Konin Ted Yvan Axel Kamanan, étudiant en Licence 3 Réseaux et Sécurité Informatique à l''UVCI et en Licence 3 Génie Logiciel à l''Université Nord-Sud de Bouaké. Je combine une formation en développement web et mobile avec rigueur, curiosité technique et volonté d''apprendre les bonnes pratiques (Git, bases de données, sécurité), pour évoluer comme stagiaire puis développeur Full Stack.' NOT NULL,
	"skillsEyebrow" varchar(120) DEFAULT '02 / Compétences' NOT NULL,
	"skillsTitle" varchar(255) DEFAULT 'Les outils que j''utilise pour passer de l''idée au produit.' NOT NULL,
	"skillsDescription" text DEFAULT 'Une base technique en progression constante, organisée autour de la qualité, de la simplicité et de la sécurité.' NOT NULL,
	"certificationsEyebrow" varchar(120) DEFAULT '03 / Certifications' NOT NULL,
	"certificationsTitle" varchar(255) DEFAULT 'Des bases solides, toujours en mouvement.' NOT NULL,
	"certificationsDescription" text DEFAULT 'Des certifications et formations qui reflètent mon parcours entre réseaux, cybersécurité et génie logiciel.' NOT NULL,
	"projectsEyebrow" varchar(120) DEFAULT '04 / Projets sélectionnés' NOT NULL,
	"projectsTitle" varchar(255) DEFAULT 'Quelques problèmes transformés en interfaces.' NOT NULL,
	"projectsDescription" text DEFAULT 'Des projets d''apprentissage et de production qui illustrent ma manière de penser le produit de bout en bout.' NOT NULL,
	"contactEyebrow" varchar(120) DEFAULT '05 / Contact' NOT NULL,
	"contactTitle" varchar(255) DEFAULT 'Construisons quelque chose d''utile.' NOT NULL,
	"contactDescription" text DEFAULT 'Vous avez un projet web, une idée à prototyper ou simplement envie d''échanger ? Écrivez-moi, je réponds sous 48 heures.' NOT NULL,
	"email" varchar(320) DEFAULT 'y.vannky10@gmail.com' NOT NULL,
	"phone" varchar(50) DEFAULT '+225 07 58 11 79 44' NOT NULL,
	"availability" varchar(120) DEFAULT 'Stage · Télétravail ou présentiel' NOT NULL,
	"githubUrl" varchar(500) DEFAULT 'https://github.com/TedYvan1' NOT NULL,
	"linkedinUrl" varchar(500) DEFAULT 'https://www.linkedin.com/in/ted-yvan-kamanan-7b752038b' NOT NULL,
	"cvUrl" varchar(500) DEFAULT '/cv.pdf' NOT NULL,
	"footerBio" text DEFAULT 'Étudiant en réseaux, sécurité informatique et génie logiciel, à la recherche d''un stage.' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "skills" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "skills_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(120) NOT NULL,
	"category" varchar(100) NOT NULL,
	"level" "level" DEFAULT 'Intermediate' NOT NULL,
	"icon" varchar(80),
	"description" text,
	"displayOrder" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "strengths" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "strengths_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"label" varchar(120) NOT NULL,
	"displayOrder" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "users" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"openId" varchar(64) NOT NULL,
	"name" text,
	"email" varchar(320),
	"passwordHash" varchar(255),
	"loginMethod" varchar(64),
	"role" "role" DEFAULT 'user' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"lastSignedIn" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_openId_unique" UNIQUE("openId"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);

-- ---------------------------------------------------------------------
-- 3. Contenu
-- ---------------------------------------------------------------------
-- Profil : toutes les valeurs viennent des valeurs par défaut du schéma.
INSERT INTO "siteProfile" DEFAULT VALUES;

INSERT INTO "projects" ("title", "slug", "shortDescription", "description", "imageUrl", "githubUrl", "liveUrl", "category", "technologies", "featured", "published") VALUES
  ('KoumanPlay', 'koumanplay', 'Jeu mobile qui transforme la transmission culturelle ivoirienne en expérience ludique et intergénérationnelle.', 'KoumanPlay est un jeu mobile qui transforme la transmission culturelle ivoirienne en expérience ludique, sensible et intergénérationnelle. Développé en 2026 avec Flutter et Dart.', '', '', '', 'Mobile', 'Flutter, Dart', 1, 1),
  ('TontinCi', 'tontinci', 'Application mobile pour créer et gérer des groupes de tontine, suivre les cotisations et l''historique des transactions.', 'TontinCi est une application mobile pour créer, rejoindre et gérer des groupes de tontine, suivre les cotisations et consulter l''historique des transactions. Interface conçue sur Figma, développée avec Flutter et Dart, données et authentification gérées avec Supabase. Projet en cours de développement.', '', '', '', 'Mobile', 'Flutter, Dart, Supabase, IconSax, Figma, GitHub', 1, 1),
  ('PouletFraisCI', 'pouletfraisci', 'Site vitrine e-commerce pour promouvoir et commander des produits avicoles locaux.', 'PouletFraisCI est une plateforme web vitrine conçue en 2026 pour promouvoir les produits avicoles locaux et faciliter la commande en ligne. Le projet met en pratique HTML5, CSS3 et JavaScript dans une expérience responsive, claire et orientée conversion.', 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=1200&q=85', '', '', 'Frontend', 'HTML5, CSS3, JavaScript', 1, 1),
  ('Portfolio & CMS', 'portfolio-cms', 'Ce portfolio : un site full-stack avec un espace d''administration sécurisé pour gérer tout le contenu.', 'Portfolio personnel conçu et développé de bout en bout. Le front est en React 19 + TypeScript avec Vite et Tailwind CSS ; l''API utilise Express et tRPC avec validation Zod côté serveur ; les données sont stockées dans PostgreSQL via Drizzle ORM. Un espace d''administration protégé par JWT (cookie httpOnly, mots de passe hachés avec bcrypt, contrôle des rôles) permet de modifier le profil, les projets, les compétences, les certifications et de lire les messages du formulaire de contact.', '', 'https://github.com/TedYvan1/Portfolio-TeddyX', '', 'Full-Stack', 'React, TypeScript, Express, tRPC, PostgreSQL, JWT', 0, 1);

INSERT INTO "skills" ("name", "category", "level", "icon", "description", "displayOrder") VALUES
  ('HTML5', 'Frontend', 'Intermediate', 'Code2', 'Structure sémantique et bases solides pour des interfaces accessibles.', 1),
  ('CSS3', 'Frontend', 'Intermediate', 'Palette', 'Mise en page responsive, composants visuels et design cohérent.', 2),
  ('JavaScript', 'Frontend', 'Intermediate', 'Code2', 'Interactions web, logique applicative et manipulation du DOM.', 3),
  ('React.js', 'Frontend', 'Intermediate', 'Code2', 'Construction d''interfaces composables et réutilisables.', 4),
  ('Flutter', 'Frontend', 'Intermediate', 'MonitorSmartphone', 'Applications mobiles multiplateformes (KoumanPlay, TontinCi).', 5),
  ('Dart', 'Frontend', 'Intermediate', 'Code2', 'Langage des applications Flutter.', 6),
  ('Design responsive', 'Frontend', 'Intermediate', 'MonitorSmartphone', 'Expériences adaptées au mobile, à la tablette et au desktop.', 7),
  ('Intégration d''API REST', 'Frontend', 'Intermediate', 'Network', 'Consommation d''API REST depuis les interfaces web et mobiles.', 8),
  ('Node.js', 'Backend', 'Beginner', 'Server', 'Développement serveur en JavaScript.', 9),
  ('Express.js', 'Backend', 'Beginner', 'Server', 'Création d''API web et de middlewares avec Express.', 10),
  ('Développement d''API REST', 'Backend', 'Beginner', 'Network', 'Conception de routes, validation des données et réponses HTTP.', 11),
  ('Authentification et autorisation', 'Backend', 'Beginner', 'ShieldCheck', 'Connexion des utilisateurs et contrôle des droits d''accès.', 12),
  ('Tests unitaires et d''intégration', 'Backend', 'Beginner', 'Terminal', 'Vérification automatisée du code et des API.', 13),
  ('SQL (MySQL & PostgreSQL)', 'Bases de données', 'Intermediate', 'Database', 'Requêtes et gestion des données relationnelles.', 14),
  ('Supabase', 'Bases de données', 'Beginner', 'Database', 'Base PostgreSQL hébergée, authentification et API pour les applications web et mobiles.', 15),
  ('Conception et modélisation de bases de données', 'Bases de données', 'Intermediate', 'Database', 'Modélisation des entités et des relations avant le développement.', 16),
  ('Git & GitHub', 'Outils', 'Intermediate', 'GitBranch', 'Versioning, collaboration et suivi des évolutions.', 17),
  ('Postman', 'Outils', 'Intermediate', 'Network', 'Test et documentation des API REST.', 18),
  ('Linux', 'Outils', 'Beginner', 'Terminal', 'Ligne de commande et administration de base.', 19),
  ('Android Studio', 'Outils', 'Beginner', 'MonitorSmartphone', 'Émulateurs et outils de build pour les applications mobiles.', 20),
  ('VMware', 'Outils', 'Beginner', 'MonitorCog', 'Virtualisation pour les travaux pratiques réseaux et systèmes.', 21),
  ('JWT & authentification sécurisée', 'Sécurité', 'Beginner', 'ShieldCheck', 'Sessions signées et stockage sûr des mots de passe.', 22),
  ('Gestion des accès', 'Sécurité', 'Beginner', 'ShieldCheck', 'Rôles et permissions côté serveur.', 23),
  ('Sécurité des API', 'Sécurité', 'Beginner', 'ShieldCheck', 'Validation des entrées, limitation des requêtes et erreurs maîtrisées.', 24);

INSERT INTO "aboutCards" ("label", "title", "description", "displayOrder") VALUES
  ('01', 'Construire', 'Des interfaces accessibles et des APIs qui restent compréhensibles quand le produit grandit.', 1),
  ('02', 'Comprendre', 'Un double parcours qui relie les fondamentaux des réseaux, la sécurité informatique et la construction de logiciels utiles.', 2),
  ('03', 'Sécuriser', 'Validation côté serveur, moindre privilège et défense en profondeur dès la conception.', 3),
  ('04', 'Progresser', 'Apprendre vite, documenter les décisions et livrer des améliorations mesurables.', 4);

INSERT INTO "certifications" ("title", "issuer", "dateLabel", "type", "description", "displayOrder") VALUES
  ('Notions de base sur les réseaux', 'Cybastion IT Academy', '2026', 'Réseaux', 'Certification qui renforce les fondamentaux des réseaux et la compréhension des échanges entre systèmes.', 1),
  ('Certificat de participation - VIBEATHON 2026', 'VIBEATHON', '2026', 'Hackathon', 'Participation au VIBEATHON 2026, compétition de développement en équipe.', 2),
  ('Introduction à la cybersécurité', 'Cisco Networking Academy', '2025', 'Sécurité', 'Premiers repères sur les menaces, la protection des systèmes et les bonnes pratiques de cybersécurité.', 3);

INSERT INTO "strengths" ("label", "displayOrder") VALUES
  ('Analyse & Résolution de problèmes', 1),
  ('Adaptabilité', 2),
  ('Rigueur & Autonomie', 3),
  ('Curiosité intellectuelle', 4);

INSERT INTO "languages" ("name", "level", "displayOrder") VALUES
  ('Français', 'Langue maternelle', 1),
  ('Anglais', 'Niveau intermédiaire', 2);

INSERT INTO "educations" ("title", "institution", "location", "period", "description", "displayOrder") VALUES
  ('Licence 3 - Réseaux et Sécurité Informatique', 'Université Virtuelle de Côte d''Ivoire (UVCI)', 'Abidjan', 'Depuis 2024', 'Formation universitaire centrée sur les réseaux, la sécurité informatique et l''analyse des infrastructures.', 1),
  ('Licence 3 - Génie Logiciel', 'Université Nord-Sud', 'Bouaké', 'Depuis 2024', 'Parcours complémentaire consacré à la conception, au développement et à la maintenance de logiciels.', 2),
  ('Baccalauréat Série D', 'Lycée Municipal de Brobo', 'Brobo, Côte d''Ivoire', 'De sept. 2023 à juil. 2024', NULL, 3);

-- ---------------------------------------------------------------------
-- 4. Compte administrateur
-- ---------------------------------------------------------------------
-- ⚠️ Remplace les deux valeurs ci-dessous avant d'exécuter le script.
-- Le mot de passe est haché en bcrypt (compatible avec la connexion du site) :
-- il n'est jamais stocké en clair.
DO $$
DECLARE
  admin_email    text := 'admin@exemple.com';
  admin_password text := 'CHANGE-MOI';
BEGIN
  IF admin_password = 'CHANGE-MOI' OR length(admin_password) < 8 THEN
    RAISE EXCEPTION 'Choisis un vrai mot de passe admin (8 caractères minimum) dans la section 4 du script.';
  END IF;
  INSERT INTO "users" ("openId", "email", "passwordHash", "name", "loginMethod", "role")
  VALUES ('admin-' || admin_email, admin_email, crypt(admin_password, gen_salt('bf', 12)), 'Admin', 'local', 'admin');
END $$;

-- ---------------------------------------------------------------------
-- 5. Journal des migrations Drizzle
-- ---------------------------------------------------------------------
CREATE SCHEMA IF NOT EXISTS drizzle;
CREATE TABLE IF NOT EXISTS drizzle."__drizzle_migrations" (
  id SERIAL PRIMARY KEY,
  hash text NOT NULL,
  created_at bigint
);
INSERT INTO drizzle."__drizzle_migrations" (hash, created_at) VALUES
  ('6161231012e5fc76e4dcc1ea5a718ffb70489e574f4a2fe323fd3fbe3be58dce', 1790896388830),
  ('24048abcc6dbfe567246147b10734e2466d71a6f69cfdf4c6975fd9f3194d533', 1791414044463),
  ('6fa9f488dc7f91dc9ec1c6110bbbdb0df8e5cf45fdc4a2e9a994e252e6518378', 1793294646247),
  ('35e9621428cdd7fc265b515d4011072484504ab7dcfa1f4d7acf7ff1e2a29708', 1793295150532),
  ('1d4ff0b0aee4166e625d412aa7e9cdcb003c877f955ebf6772e046695df37220', 1793300270558);

COMMIT;
