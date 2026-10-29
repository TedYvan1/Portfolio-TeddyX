import "dotenv/config";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { count } from "drizzle-orm";
import type { PgTable } from "drizzle-orm/pg-core";
import { projects, skills, siteProfile, aboutCards, certifications, strengths, languages, educations, users } from "../drizzle/schema";
import { hashPassword } from "./_core/auth";

const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client);

const seedProjects = [
  {
    title: "Portfolio & CMS",
    slug: "portfolio-cms",
    shortDescription: "Ce portfolio : un site full-stack avec un espace d'administration sécurisé pour gérer tout le contenu.",
    description: "Portfolio personnel conçu et développé de bout en bout. Le front est en React 19 + TypeScript avec Vite et Tailwind CSS ; l'API utilise Express et tRPC avec validation Zod côté serveur ; les données sont stockées dans PostgreSQL (Supabase) via Drizzle ORM. Un espace d'administration protégé par JWT (cookie httpOnly, mots de passe hachés avec bcrypt, contrôle des rôles) permet de modifier le profil, les projets, les compétences, les certifications et de lire les messages du formulaire de contact.",
    imageUrl: "",
    githubUrl: "https://github.com/TedYvan1/Portfolio-TeddyX",
    liveUrl: "",
    category: "Full-Stack",
    technologies: "React, TypeScript, tRPC, PostgreSQL, Drizzle, JWT",
    featured: 1,
    published: 1,
  },
  {
    title: "ChopTaResiCI",
    slug: "choptaresici",
    shortDescription: "Application SaaS de gestion immobilière pensée pour les résidences en Côte d'Ivoire.",
    description: "ChopTaResiCI est une plateforme SaaS complète dédiée à la gestion de résidences en Côte d'Ivoire. Le projet couvre la conception et l'architecture d'une solution web avec une interface React, une API Node.js, une persistance MySQL et une authentification JWT sécurisée. Le projet est actuellement en cours de développement.",
    imageUrl: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=85",
    githubUrl: "",
    liveUrl: "",
    category: "Full-Stack",
    technologies: "React, Node.js, MySQL, JWT",
    featured: 1,
    published: 1,
  },
  {
    title: "PouletFraisCI",
    slug: "pouletfraisci",
    shortDescription: "Site vitrine e-commerce pour promouvoir et commander des produits avicoles locaux.",
    description: "PouletFraisCI est une plateforme web vitrine conçue pour promouvoir les produits avicoles locaux et faciliter la commande en ligne. Le projet met en pratique les fondamentaux HTML5, CSS3 et JavaScript dans une expérience responsive, claire et orientée conversion.",
    imageUrl: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=1200&q=85",
    githubUrl: "",
    liveUrl: "",
    category: "Frontend",
    technologies: "HTML5, CSS3, JavaScript",
    featured: 1,
    published: 1,
  },
];

const seedSkills = [
  { name: "HTML5", category: "Frontend", level: "Intermediate" as const, icon: "Code2", description: "Structure sémantique et bases solides pour des interfaces accessibles.", displayOrder: 1 },
  { name: "CSS3", category: "Frontend", level: "Intermediate" as const, icon: "Palette", description: "Mise en page responsive, composants visuels et design cohérent.", displayOrder: 2 },
  { name: "JavaScript", category: "Frontend", level: "Intermediate" as const, icon: "Braces", description: "Interactions web, logique applicative et manipulation du DOM.", displayOrder: 3 },
  { name: "React.js", category: "Frontend", level: "Intermediate" as const, icon: "Layers3", description: "Construction d'interfaces composables et réutilisables.", displayOrder: 4 },
  { name: "Design responsive", category: "Frontend", level: "Intermediate" as const, icon: "MonitorSmartphone", description: "Expériences adaptées au mobile, à la tablette et au desktop.", displayOrder: 5 },
  { name: "TypeScript", category: "Frontend", level: "Beginner" as const, icon: "Code2", description: "Typage statique pour des applications plus fiables, côté client comme côté serveur.", displayOrder: 6 },
  { name: "Node.js", category: "Backend", level: "Beginner" as const, icon: "Server", description: "Bases du développement serveur et des APIs web.", displayOrder: 7 },
  { name: "Python", category: "Backend", level: "Beginner" as const, icon: "Terminal", description: "Programmation polyvalente et exploration des services backend.", displayOrder: 8 },
  { name: "SQL (MySQL & PostgreSQL)", category: "Bases de données", level: "Intermediate" as const, icon: "Database", description: "Modélisation relationnelle, requêtes et gestion des données, avec Drizzle ORM côté Node.js.", displayOrder: 9 },
  { name: "Git & GitHub", category: "Outils", level: "Intermediate" as const, icon: "GitBranch", description: "Versioning, collaboration et suivi des évolutions.", displayOrder: 10 },
  { name: "Linux & VMware", category: "Outils", level: "Beginner" as const, icon: "MonitorCog", description: "Environnements systèmes et virtualisation pour apprendre par la pratique.", displayOrder: 11 },
  { name: "JWT & authentification", category: "Sécurité", level: "Beginner" as const, icon: "ShieldCheck", description: "Principes d'authentification sécurisée pour les applications web.", displayOrder: 12 },
  { name: "Figma", category: "Outils", level: "Intermediate" as const, icon: "Palette", description: "Maquettage d'interfaces et prototypage de parcours utilisateur.", displayOrder: 13 },
];

const seedAboutCards = [
  { label: "01", title: "Construire", description: "Des interfaces accessibles et des APIs qui restent compréhensibles quand le produit grandit.", displayOrder: 1 },
  { label: "02", title: "Comprendre", description: "Un double parcours qui relie les fondamentaux des réseaux, la sécurité informatique et la construction de logiciels utiles.", displayOrder: 2 },
  { label: "03", title: "Sécuriser", description: "Validation côté serveur, moindre privilège et défense en profondeur dès la conception.", displayOrder: 3 },
  { label: "04", title: "Progresser", description: "Apprendre vite, documenter les décisions et livrer des améliorations mesurables.", displayOrder: 4 },
];

const seedCertifications = [
  { title: "Notions de base sur les réseaux", issuer: "Cybastion IT Academy", dateLabel: "2026", type: "Réseaux", description: "Certification qui renforce les fondamentaux des réseaux et la compréhension des échanges entre systèmes.", displayOrder: 1 },
  { title: "Introduction à la cybersécurité", issuer: "Cisco Networking Academy", dateLabel: "2025", type: "Sécurité", description: "Premiers repères sur les menaces, la protection des systèmes et les bonnes pratiques de cybersécurité.", displayOrder: 2 },
];

const seedStrengths = [
  { label: "Analyse & Résolution de problèmes", displayOrder: 1 },
  { label: "Adaptabilité", displayOrder: 2 },
  { label: "Rigueur & Autonomie", displayOrder: 3 },
  { label: "Curiosité intellectuelle", displayOrder: 4 },
  { label: "Communication", displayOrder: 5 },
];

const seedLanguages = [
  { name: "Français", level: "Langue maternelle", displayOrder: 1 },
  { name: "Anglais", level: "Niveau intermédiaire", displayOrder: 2 },
];

const seedEducations = [
  { title: "Licence 3 - Réseaux et Sécurité Informatique", institution: "Université Virtuelle de Côte d'Ivoire (UVCI)", location: "Abidjan", period: "Depuis 2024", description: "Formation universitaire centrée sur les réseaux, la sécurité informatique et l'analyse des infrastructures.", displayOrder: 1 },
  { title: "Licence 2 - Génie Logiciel", institution: "Université Nord-Sud", location: "Bouaké", period: "Depuis 2024", description: "Parcours complémentaire consacré à la conception, au développement et à la maintenance de logiciels.", displayOrder: 2 },
  { title: "Baccalauréat Série D", institution: "Lycée Municipal de Brobo", location: "Brobo, Côte d'Ivoire", period: "De sept. 2023 à juil. 2024", description: null, displayOrder: 3 },
];

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
