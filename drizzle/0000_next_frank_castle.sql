CREATE TYPE "public"."level" AS ENUM('Beginner', 'Intermediate', 'Advanced');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('user', 'admin');--> statement-breakpoint
CREATE TABLE "aboutCards" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "aboutCards_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"label" varchar(10) NOT NULL,
	"title" varchar(120) NOT NULL,
	"description" text NOT NULL,
	"displayOrder" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
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
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "messages_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(120) NOT NULL,
	"email" varchar(320) NOT NULL,
	"subject" varchar(180) NOT NULL,
	"message" text NOT NULL,
	"read" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
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
--> statement-breakpoint
CREATE TABLE "siteProfile" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "siteProfile_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"displayName" varchar(80) DEFAULT 'yvan.dev' NOT NULL,
	"fullName" varchar(180) DEFAULT 'Konin Ted Yvan Axel Kamanan' NOT NULL,
	"role" varchar(255) DEFAULT 'Étudiant en Réseaux & Sécurité Informatique et en Génie Logiciel' NOT NULL,
	"heroEyebrow" varchar(180) DEFAULT 'À la recherche d''un stage' NOT NULL,
	"heroLocation" varchar(180) DEFAULT 'Abidjan · Bouaké' NOT NULL,
	"heroTitle" varchar(255) DEFAULT 'Je développe des solutions' NOT NULL,
	"heroTitleAccent" varchar(120) DEFAULT 'clairs.' NOT NULL,
	"heroSubtitle" varchar(255) DEFAULT 'Je sécurise mes applications.' NOT NULL,
	"heroDescription" text DEFAULT 'Étudiant en Réseaux & Sécurité Informatique et en Génie Logiciel. Je conçois des applications web performantes et sécurisées, avec une forte capacité d''analyse et d''adaptation.' NOT NULL,
	"heroTags" varchar(500) DEFAULT 'HTML · CSS · JavaScript,Node · MySQL,Réseaux · JWT' NOT NULL,
	"codeFocus" varchar(80) DEFAULT 'full-stack' NOT NULL,
	"codeMindset" varchar(80) DEFAULT 'secure-by-design' NOT NULL,
	"codeStack" varchar(255) DEFAULT 'React,Node.js,PostgreSQL,Linux' NOT NULL,
	"codeStatus" varchar(80) DEFAULT 'building' NOT NULL,
	"aboutEyebrow" varchar(120) DEFAULT '01 / À propos' NOT NULL,
	"aboutTitle" varchar(255) DEFAULT 'Une approche hybride, entre produit et infrastructure.' NOT NULL,
	"aboutDescription" text DEFAULT 'Je suis Konin Ted Yvan Axel Kamanan, étudiant en Licence 3 Réseaux et Sécurité Informatique à l''UVCI et en Licence 2 Génie Logiciel à l''Université Nord-Sud de Bouaké. J''allie analyse, adaptabilité et curiosité pour concevoir des applications web performantes et sécurisées.' NOT NULL,
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
	"phone" varchar(50) DEFAULT '07 58 11 79 44' NOT NULL,
	"availability" varchar(120) DEFAULT 'Stage recherché' NOT NULL,
	"githubUrl" varchar(500) DEFAULT 'https://github.com/' NOT NULL,
	"linkedinUrl" varchar(500) DEFAULT 'https://linkedin.com/' NOT NULL,
	"cvUrl" varchar(500) DEFAULT '/cv.pdf' NOT NULL,
	"footerBio" text DEFAULT 'Étudiant en réseaux, sécurité informatique et génie logiciel, à la recherche d''un stage.' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
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
--> statement-breakpoint
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
	CONSTRAINT "users_openId_unique" UNIQUE("openId")
);
