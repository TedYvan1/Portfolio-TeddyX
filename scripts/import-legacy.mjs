// Reprise des données de la v1 (Express + Drizzle) vers le schéma v2 (supabase/migrations).
//   npm run import:legacy -- --dry-run   → lit la v1 et affiche ce qui serait importé
//   npm run import:legacy                → remplace le contenu de la v2 (les admins sont conservés)
// Variables (.env) : DATABASE_URL (URI Postgres du projet Supabase, rôle postgres : contourne RLS).
// La v2 réutilise le même projet : les tables v1 sont lues dans le schéma « legacy » (migration d'archivage),
// ou dans « public » si l'archivage n'a pas encore eu lieu (aperçu seulement).
// LEGACY_DATABASE_URL / V2_DATABASE_URL permettent de viser deux bases distinctes si besoin.
import postgres from "postgres";

const dryRun = process.argv.includes("--dry-run");
const legacyUrl = process.env.LEGACY_DATABASE_URL ?? process.env.DATABASE_URL;
const v2Url = process.env.V2_DATABASE_URL ?? process.env.DATABASE_URL;
if (!legacyUrl) throw new Error("DATABASE_URL manquante dans .env");

// Traductions anglaises du contenu connu de la v1. Tout texte absent d'ici reste en français ;
// le site affiche alors le français en anglais, en attendant une traduction depuis l'admin.
const EN = {
  "Recherche de stage en Génie Logiciel et Réseaux": "Looking for an internship in software engineering and networks",
  "Étudiant en Réseaux & Sécurité Informatique et en Génie Logiciel, je conçois des applications web et mobiles avec une forte capacité d'analyse et d'adaptation. Je recherche un stage pour évoluer vers le développement Full Stack.":
    "Networks & cybersecurity and software engineering student, I build web and mobile apps with strong analytical and adaptability skills. I'm looking for an internship to grow into full-stack development.",
  "Stage · Télétravail ou présentiel": "Internship · remote or on-site",
  "Frontend": "Frontend",
  "Backend": "Backend",
  "Bases de données": "Databases",
  "Outils": "Tools",
  "Sécurité": "Security",
  "Construire": "Build",
  "Des interfaces accessibles et des APIs qui restent compréhensibles quand le produit grandit.": "Accessible interfaces and APIs that stay understandable as the product grows.",
  "Comprendre": "Understand",
  "Un double parcours qui relie les fondamentaux des réseaux, la sécurité informatique et la construction de logiciels utiles.": "A dual track connecting networking fundamentals, cybersecurity and building useful software.",
  "Sécuriser": "Secure",
  "Validation côté serveur, moindre privilège et défense en profondeur dès la conception.": "Server-side validation, least privilege and defense in depth from the start.",
  "Progresser": "Grow",
  "Apprendre vite, documenter les décisions et livrer des améliorations mesurables.": "Learn fast, document decisions and ship measurable improvements.",
  "Analyse & Résolution de problèmes": "Analysis & problem solving",
  "Adaptabilité": "Adaptability",
  "Rigueur & Autonomie": "Rigor & autonomy",
  "Curiosité intellectuelle": "Intellectual curiosity",
  "Français": "French",
  "Anglais": "English",
  "Langue maternelle": "Native",
  "Niveau intermédiaire": "Intermediate",
  "Licence 3 - Réseaux et Sécurité Informatique": "Bachelor's (3rd year) — Networks & Cybersecurity",
  "Licence 3 - Génie Logiciel": "Bachelor's (3rd year) — Software Engineering",
  "Baccalauréat Série D": "High school diploma (science track)",
  "Depuis 2024": "Since 2024",
  "De sept. 2023 à juil. 2024": "Sept. 2023 – July 2024",
  "Formation universitaire centrée sur les réseaux, la sécurité informatique et l'analyse des infrastructures.": "University program focused on networks, cybersecurity and infrastructure analysis.",
  "Parcours complémentaire consacré à la conception, au développement et à la maintenance de logiciels.": "Complementary program on software design, development and maintenance.",
  "Notions de base sur les réseaux": "Networking fundamentals",
  "Certificat de participation - VIBEATHON 2026": "Certificate of participation — VIBEATHON 2026",
  "Introduction à la cybersécurité": "Introduction to cybersecurity",
  "Réseaux": "Networking",
  "Hackathon": "Hackathon",
  "Jeu mobile qui transforme la transmission culturelle ivoirienne en expérience ludique et intergénérationnelle.": "A mobile game that turns the passing-on of Ivorian culture into a playful, intergenerational experience.",
  "Application mobile pour créer et gérer des groupes de tontine, suivre les cotisations et l'historique des transactions.": "A mobile app to create and manage tontine (rotating savings) groups, track contributions and transaction history.",
  "Site vitrine e-commerce pour promouvoir et commander des produits avicoles locaux.": "A showcase e-commerce site to promote and order local poultry products.",
  "Ce portfolio : un site full-stack avec un espace d'administration sécurisé pour gérer tout le contenu.": "This portfolio: a full-stack site with a secure admin area to manage all its content.",
};

const loc = fr => (fr ? { fr, ...(EN[fr] ? { en: EN[fr] } : {}) } : {});
const LEVEL = { Beginner: 1, Intermediate: 2, Advanced: 3 };

const legacy = postgres(legacyUrl, { prepare: false, max: 1 });
const [{ archived }] = await legacy`select to_regclass('legacy."siteProfile"') is not null as archived`;
const schema = archived ? "legacy" : "public";
if (!archived && !dryRun) throw new Error("Les tables v1 ne sont pas encore archivées : appliquez d'abord supabase/migrations/20261102000000_archive_v1.sql.");
console.log(`Lecture de la v1 dans le schéma « ${schema} ».`);
// Une table absente de la v1 (42P01) compte comme vide ; toute autre erreur (connexion, mot de passe) arrête l'import.
const read = async table =>
  legacy.unsafe(`select * from ${schema}."${table}"`).catch(error => {
    if (error.code === "42P01") return [];
    throw new Error(`Lecture de « ${table} » impossible dans la base v1 : ${error.code ?? ""} ${error.message}`);
  });

const [[profile], projects, skills, cards, certs, strengths, languages, educations, messages] = await Promise.all(
  ["siteProfile", "projects", "skills", "aboutCards", "certifications", "strengths", "languages", "educations", "messages"].map(read),
);
await legacy.end();

const out = {
  profile: profile && {
    id: 1,
    full_name: profile.fullName,
    display_name: profile.displayName,
    role: loc(profile.role),
    headline: loc(profile.heroDescription),
    bio: loc(profile.aboutDescription),
    location: profile.heroLocation,
    email: profile.email,
    phone: profile.phone,
    availability: loc(profile.availability),
    github_url: profile.githubUrl || null,
    linkedin_url: profile.linkedinUrl || null,
  },
  projects: projects.map((p, index) => ({
    slug: p.slug,
    title: { fr: p.title, en: p.title },
    summary: loc(p.shortDescription),
    context: loc(p.description),
    category: p.category,
    tech: p.technologies.split(",").map(t => t.trim()).filter(Boolean),
    // Les images externes (Unsplash) sont gardées telles quelles ; les vraies captures viendront du stockage.
    cover_path: p.imageUrl || null,
    github_url: p.githubUrl || null,
    live_url: p.liveUrl || null,
    status: /en cours/i.test(p.description) ? "in_progress" : "done",
    featured: p.featured === 1,
    published: p.published === 1,
    sort_order: index,
  })),
  categories: [...new Set(skills.map(s => s.category))].map((name, index) => ({ name: loc(name), sort_order: index, key: name })),
  skills,
  principles: cards.map(c => ({ title: loc(c.title), body: loc(c.description), sort_order: c.displayOrder })),
  certifications: certs.map(c => ({ title: loc(c.title), issuer: c.issuer, year: Number.parseInt(c.dateLabel, 10) || null, kind: loc(c.type), url: c.linkUrl || null, sort_order: c.displayOrder })),
  strengths: strengths.map(s => ({ label: loc(s.label), sort_order: s.displayOrder })),
  languages: languages.map(l => ({ name: loc(l.name), level: loc(l.level), sort_order: l.displayOrder })),
  educations: educations.map(e => ({ title: loc(e.title), institution: e.institution, location: e.location, period: loc(e.period), description: loc(e.description), sort_order: e.displayOrder })),
  messages: messages.map(m => ({ name: m.name, email: m.email, subject: m.subject, body: m.message, locale: "fr", sender_hash: `legacy-import-${m.id}`, read: m.read === 1, created_at: m.createdAt })),
};

const untranslated = new Set();
JSON.stringify(out, (key, value) => {
  if (value && typeof value === "object" && "fr" in value && !("en" in value)) untranslated.add(value.fr.slice(0, 60));
  return value;
});

console.log(`Source v1 : profil ${out.profile ? "oui" : "non"}, ${out.projects.length} projets, ${out.skills.length} compétences (${out.categories.length} catégories), ` +
  `${out.principles.length} principes, ${out.certifications.length} certifications, ${out.strengths.length} atouts, ${out.languages.length} langues, ` +
  `${out.educations.length} formations, ${out.messages.length} messages.`);
console.log(`Textes sans traduction anglaise : ${untranslated.size}${untranslated.size ? " (ex. « " + [...untranslated][0] + "… »)" : ""}`);
if (dryRun) process.exit(0);

const v2 = postgres(v2Url, { prepare: false, max: 1 });
await v2.begin(async tx => {
  await tx`truncate public.projects, public.labs, public.skills, public.skill_categories, public.educations, public.certifications,
           public.languages, public.strengths, public.principles, public.messages`;
  if (out.profile) await tx`insert into public.profile ${tx(out.profile)} on conflict (id) do update set ${tx(out.profile)}`;
  if (out.projects.length) await tx`insert into public.projects ${tx(out.projects)}`;
  const categoryIds = {};
  for (const { key, ...category } of out.categories) {
    const [row] = await tx`insert into public.skill_categories ${tx(category)} returning id`;
    categoryIds[key] = row.id;
  }
  if (out.skills.length) {
    await tx`insert into public.skills ${tx(out.skills.map(s => ({ category_id: categoryIds[s.category], name: s.name, level: LEVEL[s.level] ?? 2, sort_order: s.displayOrder })))}`;
  }
  for (const table of ["principles", "certifications", "strengths", "languages", "educations", "messages"]) {
    if (out[table].length) await tx`insert into ${tx("public." + table)} ${tx(out[table])}`;
  }
});
await v2.end();
console.log("Import terminé.");
