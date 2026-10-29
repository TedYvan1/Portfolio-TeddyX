ALTER TABLE "siteProfile" ALTER COLUMN "role" SET DEFAULT 'Recherche de stage en Génie Logiciel et Réseaux';--> statement-breakpoint
ALTER TABLE "siteProfile" ALTER COLUMN "heroDescription" SET DEFAULT 'Étudiant en Réseaux & Sécurité Informatique et en Génie Logiciel, je conçois des applications web et mobiles avec une forte capacité d''analyse et d''adaptation. Je recherche un stage pour évoluer vers le développement Full Stack.';--> statement-breakpoint
ALTER TABLE "siteProfile" ALTER COLUMN "heroTags" SET DEFAULT 'Flutter · Dart · React,Node.js · Express · PostgreSQL,JWT · Sécurité des API';--> statement-breakpoint
ALTER TABLE "siteProfile" ALTER COLUMN "codeStack" SET DEFAULT 'Flutter,React,Node.js,PostgreSQL';--> statement-breakpoint
ALTER TABLE "siteProfile" ALTER COLUMN "aboutDescription" SET DEFAULT 'Je suis Konin Ted Yvan Axel Kamanan, étudiant en Licence 3 Réseaux et Sécurité Informatique à l''UVCI et en Licence 3 Génie Logiciel à l''Université Nord-Sud de Bouaké. Je combine une formation en développement web et mobile avec rigueur, curiosité technique et volonté d''apprendre les bonnes pratiques (Git, bases de données, sécurité), pour évoluer comme stagiaire puis développeur Full Stack.';--> statement-breakpoint
ALTER TABLE "siteProfile" ALTER COLUMN "availability" SET DEFAULT 'Stage · Télétravail ou présentiel';--> statement-breakpoint
UPDATE "siteProfile" SET "role" = 'Recherche de stage en Génie Logiciel et Réseaux' WHERE "role" = 'Étudiant en Réseaux & Sécurité Informatique et en Génie Logiciel';
--> statement-breakpoint
UPDATE "siteProfile" SET "heroDescription" = 'Étudiant en Réseaux & Sécurité Informatique et en Génie Logiciel, je conçois des applications web et mobiles avec une forte capacité d''analyse et d''adaptation. Je recherche un stage pour évoluer vers le développement Full Stack.' WHERE "heroDescription" = 'Étudiant en Réseaux & Sécurité Informatique et en Génie Logiciel. Je conçois des applications web performantes et sécurisées, avec une forte capacité d''analyse et d''adaptation.';
--> statement-breakpoint
UPDATE "siteProfile" SET "heroTags" = 'Flutter · Dart · React,Node.js · Express · PostgreSQL,JWT · Sécurité des API' WHERE "heroTags" = 'React · TypeScript · Node.js,PostgreSQL · MySQL,Réseaux · Linux · JWT';
--> statement-breakpoint
UPDATE "siteProfile" SET "codeStack" = 'Flutter,React,Node.js,PostgreSQL' WHERE "codeStack" = 'React,Node.js,PostgreSQL,Linux';
--> statement-breakpoint
UPDATE "siteProfile" SET "aboutDescription" = 'Je suis Konin Ted Yvan Axel Kamanan, étudiant en Licence 3 Réseaux et Sécurité Informatique à l''UVCI et en Licence 3 Génie Logiciel à l''Université Nord-Sud de Bouaké. Je combine une formation en développement web et mobile avec rigueur, curiosité technique et volonté d''apprendre les bonnes pratiques (Git, bases de données, sécurité), pour évoluer comme stagiaire puis développeur Full Stack.' WHERE "aboutDescription" = 'Je suis Konin Ted Yvan Axel Kamanan, étudiant en Licence 3 Réseaux et Sécurité Informatique à l''UVCI et en Licence 2 Génie Logiciel à l''Université Nord-Sud de Bouaké. J''allie analyse, adaptabilité et curiosité pour concevoir des applications web performantes et sécurisées.';
--> statement-breakpoint
UPDATE "siteProfile" SET "availability" = 'Stage · Télétravail ou présentiel' WHERE "availability" = 'Stage recherché';
