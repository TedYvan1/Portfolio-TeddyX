ALTER TABLE "siteProfile" ALTER COLUMN "displayName" SET DEFAULT 'Ted Yvan KAMANAN';--> statement-breakpoint
ALTER TABLE "siteProfile" ALTER COLUMN "heroTags" SET DEFAULT 'React · TypeScript · Node.js,PostgreSQL · MySQL,Réseaux · Linux · JWT';--> statement-breakpoint
ALTER TABLE "siteProfile" ALTER COLUMN "phone" SET DEFAULT '+225 07 58 11 79 44';--> statement-breakpoint
ALTER TABLE "siteProfile" ALTER COLUMN "githubUrl" SET DEFAULT 'https://github.com/TedYvan1';--> statement-breakpoint
ALTER TABLE "siteProfile" ALTER COLUMN "linkedinUrl" SET DEFAULT 'https://www.linkedin.com/in/ted-yvan-kamanan-7b752038b';--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_email_unique" UNIQUE("email");--> statement-breakpoint
UPDATE "siteProfile" SET "displayName" = 'Ted Yvan KAMANAN' WHERE "displayName" IN ('TeddyX', 'yvan.dev');--> statement-breakpoint
UPDATE "siteProfile" SET "heroTags" = 'React · TypeScript · Node.js,PostgreSQL · MySQL,Réseaux · Linux · JWT' WHERE "heroTags" = 'HTML · CSS · JavaScript,Node · MySQL,Réseaux · JWT';--> statement-breakpoint
UPDATE "siteProfile" SET "phone" = '+225 07 58 11 79 44' WHERE "phone" = '07 58 11 79 44';--> statement-breakpoint
UPDATE "siteProfile" SET "githubUrl" = 'https://github.com/TedYvan1' WHERE "githubUrl" = 'https://github.com/';--> statement-breakpoint
UPDATE "siteProfile" SET "linkedinUrl" = 'https://www.linkedin.com/in/ted-yvan-kamanan-7b752038b' WHERE "linkedinUrl" = 'https://linkedin.com/';
