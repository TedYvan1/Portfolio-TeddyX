ALTER TABLE "siteProfile" ALTER COLUMN "heroTitleAccent" SET DEFAULT 'claires.';--> statement-breakpoint
UPDATE "siteProfile" SET "heroTitleAccent" = 'claires.' WHERE "heroTitleAccent" = 'clairs.';
