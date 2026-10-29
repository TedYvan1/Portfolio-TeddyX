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
--> statement-breakpoint
CREATE TABLE "languages" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "languages_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(80) NOT NULL,
	"level" varchar(120) NOT NULL,
	"displayOrder" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "strengths" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "strengths_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"label" varchar(120) NOT NULL,
	"displayOrder" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
