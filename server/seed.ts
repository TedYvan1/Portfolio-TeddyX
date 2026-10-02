import "dotenv/config";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { projects, skills, siteProfile, aboutCards, certifications, users } from "../drizzle/schema";
import { hashPassword } from "./_core/auth";

const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client);

const seedProjects = [
  {
    title: "ChopTaResiCI",
    slug: "choptaresici",
    shortDescription: "Application SaaS de gestion immobilière pensée pour les résidences en Côte d'Ivoire.",
    description: "ChopTaResiCI est une plateforme SaaS complète dédiée à la gestion de résidences en Côte d'Ivoire. Le projet couvre la conception et l'architecture d'une solution web avec une interface React, une API Node.js, une persistance MySQL et une authentification JWT sécurisée. Le projet est actuellement en cours de développement.",
    imageUrl: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=85",
    githubUrl: "https://github.com/",
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
    githubUrl: "https://github.com/",
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
  { name: "React.js", category: "Frontend", level: "Beginner" as const, icon: "Layers3", description: "Construction d'interfaces composables et réutilisables.", displayOrder: 4 },
  { name: "Design responsive", category: "Frontend", level: "Intermediate" as const, icon: "MonitorSmartphone", description: "Expériences adaptées au mobile, à la tablette et au desktop.", displayOrder: 5 },
  { name: "Node.js", category: "Backend", level: "Beginner" as const, icon: "Server", description: "Bases du développement serveur et des APIs web.", displayOrder: 6 },
  { name: "Python", category: "Backend", level: "Beginner" as const, icon: "Terminal", description: "Programmation polyvalente et exploration des services backend.", displayOrder: 7 },
  { name: "MySQL & SQL", category: "Bases de données", level: "Intermediate" as const, icon: "Database", description: "Modélisation relationnelle, requêtes et gestion des données.", displayOrder: 8 },
  { name: "Git & GitHub", category: "Outils", level: "Intermediate" as const, icon: "GitBranch", description: "Versioning, collaboration et suivi des évolutions.", displayOrder: 9 },
  { name: "Linux & VMware", category: "Outils", level: "Beginner" as const, icon: "MonitorCog", description: "Environnements systèmes et virtualisation pour apprendre par la pratique.", displayOrder: 10 },
  { name: "JWT & authentification", category: "Sécurité", level: "Beginner" as const, icon: "ShieldCheck", description: "Principes d'authentification sécurisée pour les applications web.", displayOrder: 11 },
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
  { title: "Licence 3 — Réseaux & Sécurité Informatique", issuer: "Université Virtuelle de Côte d'Ivoire", dateLabel: "Depuis 2024", type: "Formation", description: "Formation universitaire centrée sur les réseaux, la sécurité informatique et l'analyse des infrastructures.", displayOrder: 3 },
  { title: "Licence 2 — Génie Logiciel", issuer: "Université Nord-Sud · Bouaké", dateLabel: "Depuis 2024", type: "Formation", description: "Parcours complémentaire consacré à la conception, au développement et à la maintenance de logiciels.", displayOrder: 4 },
];

async function main() {
  await db.delete(projects);
  await db.delete(skills);
  await db.delete(aboutCards);
  await db.delete(certifications);
  await db.delete(siteProfile);
  await db.insert(siteProfile).values({});
  await db.insert(projects).values(seedProjects);
  await db.insert(skills).values(seedSkills);
  await db.insert(aboutCards).values(seedAboutCards);
  await db.insert(certifications).values(seedCertifications);

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

  console.log("Seed completed (profile + about + certifications + projects + skills)");
  await client.end();
}

main().catch(async error => {
  console.error(error);
  await client.end();
  process.exit(1);
});
