import "dotenv/config";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { count } from "drizzle-orm";
import type { PgTable } from "drizzle-orm/pg-core";
import { projects, skills, siteProfile, aboutCards, certifications, strengths, languages, educations, users } from "../drizzle/schema";
import { hashPassword } from "./_core/auth";
import { seedProjects, seedSkills, seedAboutCards, seedCertifications, seedStrengths, seedLanguages, seedEducations } from "./seedData";

const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client);

// Par défaut, le seed ne remplit que les tables vides : le contenu modifié depuis l'admin est conservé.
// `npm run seed -- --reset` efface d'abord tout le contenu (projets, compétences, profil…).
const reset = process.argv.includes("--reset");

async function seedIfEmpty(table: PgTable, rows: Record<string, unknown>[], label: string) {
  const [existing] = await db.select({ n: count() }).from(table);
  if (existing.n > 0) {
    console.log(`- ${label} : ${existing.n} ligne(s) déjà présente(s), ignoré`);
    return;
  }
  await db.insert(table).values(rows as any);
  console.log(`- ${label} : ${rows.length} ligne(s) ajoutée(s)`);
}

async function main() {
  if (reset) {
    console.log("--reset : suppression du contenu existant");
    for (const table of [projects, skills, aboutCards, certifications, strengths, languages, educations, siteProfile]) {
      await db.delete(table);
    }
  }
  await seedIfEmpty(siteProfile, [{}], "Profil");
  // Les projets sont identifiés par leur slug : les nouveaux projets du seed sont ajoutés sans toucher aux autres.
  const insertedProjects = await db.insert(projects).values(seedProjects).onConflictDoNothing({ target: projects.slug }).returning({ id: projects.id });
  console.log(`- Projets : ${insertedProjects.length} ligne(s) ajoutée(s)`);
  await seedIfEmpty(skills, seedSkills, "Compétences");
  await seedIfEmpty(aboutCards, seedAboutCards, "Cartes À propos");
  await seedIfEmpty(certifications, seedCertifications, "Certifications");
  await seedIfEmpty(strengths, seedStrengths, "Atouts");
  await seedIfEmpty(languages, seedLanguages, "Langues");
  await seedIfEmpty(educations, seedEducations, "Parcours");

  // Seed admin user if ADMIN_EMAIL + ADMIN_PASSWORD provided
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (adminEmail && adminPassword) {
    const passwordHash = await hashPassword(adminPassword);
    await db
      .insert(users)
      .values({ openId: `admin-${adminEmail}`, email: adminEmail, passwordHash, name: "Admin", role: "admin" })
      .onConflictDoNothing({ target: users.email });
    console.log(`Admin user seeded: ${adminEmail}`);
  }

  console.log("Seed terminé.");
  await client.end();
}

main().catch(async error => {
  console.error(error);
  await client.end();
  process.exit(1);
});
