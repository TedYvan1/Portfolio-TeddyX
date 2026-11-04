import type { SiteContent } from "./types";

/**
 * Contenu de secours, repris du CV : affiché tant que Supabase n'est pas configuré
 * (développement local, aperçu). En production, tout vient de la base et de l'admin.
 */
export const fallbackContent: SiteContent = {
  profile: {
    full_name: "Konin Ted Yvan Axel Kamanan",
    display_name: "Ted Yvan Kamanan",
    role: { fr: "Étudiant en réseaux, sécurité et génie logiciel", en: "Networks, security & software engineering student" },
    headline: {
      fr: "Je conçois des applications web et mobiles sécurisées de bout en bout — du réseau jusqu'à l'interface.",
      en: "I build web and mobile apps that are secure end to end — from the network to the interface.",
    },
    bio: {
      fr: "Étudiant en Licence 3 Réseaux et Sécurité Informatique à l'UVCI et en Licence 3 Génie Logiciel à l'Université Nord-Sud de Bouaké. Je combine développement web et mobile, rigueur et curiosité technique, avec un objectif : évoluer comme stagiaire puis développeur Full Stack.",
      en: "Third-year student in Networks & Cybersecurity at UVCI and in Software Engineering at Université Nord-Sud (Bouaké). I combine web and mobile development with rigor and technical curiosity, aiming to grow from intern to full-stack developer.",
    },
    location: "Abidjan · Bouaké",
    email: "y.vannky10@gmail.com",
    phone: "+225 07 58 11 79 44",
    availability: { fr: "Stage · télétravail ou présentiel", en: "Internship · remote or on-site" },
    seeking: {
      fr: "Stage en développement full stack ou en réseaux & sécurité. Période et durée : [À PRÉCISER].",
      en: "Internship in full-stack development or networks & security. Dates and duration: [TO BE CONFIRMED].",
    },
    github_url: "https://github.com/TedYvan1",
    linkedin_url: "https://www.linkedin.com/in/ted-yvan-kamanan-7b752038b",
    cv_path: "/cv.pdf",
    photo_path: null,
  },
  projects: [
    {
      slug: "koumanplay",
      title: { fr: "KoumanPlay", en: "KoumanPlay" },
      summary: {
        fr: "Jeu mobile qui transforme la transmission culturelle ivoirienne en expérience ludique et intergénérationnelle.",
        en: "A mobile game that turns the passing-on of Ivorian culture into a playful, intergenerational experience.",
      },
      context: {
        fr: "KoumanPlay est un jeu mobile qui transforme la transmission culturelle ivoirienne en expérience ludique, sensible et intergénérationnelle.",
        en: "KoumanPlay is a mobile game that turns the passing-on of Ivorian culture into a playful, heartfelt, intergenerational experience.",
      },
      my_role: {}, challenges: {}, solution: {}, results: {},
      category: "Mobile",
      tech: ["Flutter", "Dart"],
      cover_path: null, gallery: [], github_url: null, live_url: null,
      status: "done", year: 2026, featured: true,
    },
    {
      slug: "tontinci",
      title: { fr: "TontinCi", en: "TontinCi" },
      summary: {
        fr: "Application mobile pour créer et gérer des groupes de tontine, suivre les cotisations et l'historique des transactions.",
        en: "A mobile app to create and manage tontine (rotating savings) groups, track contributions and transaction history.",
      },
      context: {
        fr: "Application mobile pour créer, rejoindre et gérer des groupes de tontine, suivre les cotisations et consulter l'historique des transactions. Interface conçue sur Figma, données et authentification avec Supabase.",
        en: "A mobile app to create, join and manage tontine groups, track contributions and browse transaction history. UI designed in Figma, data and authentication with Supabase.",
      },
      my_role: {}, challenges: {}, solution: {}, results: {},
      category: "Mobile",
      tech: ["Flutter", "Dart", "Supabase", "Figma"],
      cover_path: null, gallery: [], github_url: null, live_url: null,
      status: "in_progress", year: 2026, featured: true,
    },
    {
      slug: "pouletfraisci",
      title: { fr: "PouletFraisCI", en: "PouletFraisCI" },
      summary: {
        fr: "Site vitrine e-commerce pour promouvoir et commander des produits avicoles locaux.",
        en: "A showcase e-commerce site to promote and order local poultry products.",
      },
      context: {
        fr: "Plateforme web vitrine pour promouvoir les produits avicoles locaux et faciliter la commande en ligne, en HTML5, CSS3 et JavaScript.",
        en: "A showcase website promoting local poultry products and making online ordering easy, built with HTML5, CSS3 and JavaScript.",
      },
      my_role: {}, challenges: {}, solution: {}, results: {},
      category: "Web",
      tech: ["HTML5", "CSS3", "JavaScript"],
      cover_path: null, gallery: [], github_url: null, live_url: null,
      status: "done", year: 2026, featured: true,
    },
    {
      slug: "portfolio",
      title: { fr: "Ce portfolio", en: "This portfolio" },
      summary: {
        fr: "Site bilingue avec espace d'administration sécurisé : Next.js, Supabase, règles d'accès en base.",
        en: "A bilingual site with a secure admin area: Next.js, Supabase, database-level access rules.",
      },
      context: {
        fr: "Portfolio conçu de bout en bout : Next.js pour le site, Supabase pour la base, l'authentification et le stockage, avec des règles de sécurité appliquées directement dans PostgreSQL.",
        en: "A portfolio built end to end: Next.js for the site, Supabase for the database, authentication and storage, with security rules enforced directly in PostgreSQL.",
      },
      my_role: {}, challenges: {}, solution: {}, results: {},
      category: "Full-Stack",
      tech: ["Next.js", "TypeScript", "Supabase", "PostgreSQL"],
      cover_path: null, gallery: [], github_url: "https://github.com/TedYvan1/Portfolio-TeddyX", live_url: null,
      status: "in_progress", year: 2026, featured: false,
    },
  ],
  labs: [],
  skills: [
    { name: { fr: "Frontend", en: "Frontend" }, skills: [
      { name: "React.js", level: 2 }, { name: "Flutter", level: 2 }, { name: "Dart", level: 2 }, { name: "JavaScript", level: 2 },
      { name: "HTML5 · CSS3", level: 2 }, { name: "Intégration d'API REST", level: 2 },
    ] },
    { name: { fr: "Backend", en: "Backend" }, skills: [
      { name: "Node.js", level: 1 }, { name: "Express.js", level: 1 }, { name: "API REST", level: 1 }, { name: "Tests unitaires & d'intégration", level: 1 },
    ] },
    { name: { fr: "Bases de données", en: "Databases" }, skills: [
      { name: "SQL (MySQL, PostgreSQL)", level: 2 }, { name: "Supabase", level: 1 }, { name: "Modélisation", level: 2 },
    ] },
    { name: { fr: "Sécurité", en: "Security" }, skills: [
      { name: "JWT & authentification", level: 1 }, { name: "Gestion des accès", level: 1 }, { name: "Sécurité des API", level: 1 },
    ] },
    { name: { fr: "Outils", en: "Tools" }, skills: [
      { name: "Git & GitHub", level: 2 }, { name: "Postman", level: 2 }, { name: "Linux", level: 1 }, { name: "Android Studio", level: 1 }, { name: "VMware", level: 1 },
    ] },
  ],
  educations: [
    { title: { fr: "Licence 3 — Réseaux et Sécurité Informatique", en: "Bachelor's (3rd year) — Networks & Cybersecurity" }, institution: "Université Virtuelle de Côte d'Ivoire (UVCI)", location: "Abidjan", period: { fr: "Depuis 2024", en: "Since 2024" }, description: {} },
    { title: { fr: "Licence 3 — Génie Logiciel", en: "Bachelor's (3rd year) — Software Engineering" }, institution: "Université Nord-Sud", location: "Bouaké", period: { fr: "Depuis 2024", en: "Since 2024" }, description: {} },
    { title: { fr: "Baccalauréat série D", en: "High school diploma (science track)" }, institution: "Lycée Municipal de Brobo", location: "Brobo", period: { fr: "2023 – 2024", en: "2023 – 2024" }, description: {} },
  ],
  certifications: [
    { title: { fr: "Notions de base sur les réseaux", en: "Networking fundamentals" }, issuer: "Cybastion IT Academy", year: 2026, kind: { fr: "Réseaux", en: "Networking" }, url: null },
    { title: { fr: "Certificat de participation — VIBEATHON 2026", en: "Certificate of participation — VIBEATHON 2026" }, issuer: "VIBEATHON", year: 2026, kind: { fr: "Hackathon", en: "Hackathon" }, url: null },
    { title: { fr: "Introduction à la cybersécurité", en: "Introduction to cybersecurity" }, issuer: "Cisco Networking Academy", year: 2025, kind: { fr: "Sécurité", en: "Security" }, url: null },
  ],
  languages: [
    { name: { fr: "Français", en: "French" }, level: { fr: "Langue maternelle", en: "Native" } },
    { name: { fr: "Anglais", en: "English" }, level: { fr: "Intermédiaire", en: "Intermediate" } },
  ],
  strengths: [
    { label: { fr: "Analyse & résolution de problèmes", en: "Analysis & problem solving" } },
    { label: { fr: "Adaptabilité", en: "Adaptability" } },
    { label: { fr: "Rigueur & autonomie", en: "Rigor & autonomy" } },
    { label: { fr: "Curiosité intellectuelle", en: "Intellectual curiosity" } },
  ],
  principles: [
    { title: { fr: "Construire", en: "Build" }, body: { fr: "Des interfaces accessibles et des API qui restent compréhensibles quand le produit grandit.", en: "Accessible interfaces and APIs that stay understandable as the product grows." } },
    { title: { fr: "Comprendre", en: "Understand" }, body: { fr: "Un double parcours qui relie les fondamentaux des réseaux, la sécurité et le logiciel.", en: "A dual track connecting networking fundamentals, security and software." } },
    { title: { fr: "Sécuriser", en: "Secure" }, body: { fr: "Validation côté serveur, moindre privilège et défense en profondeur dès la conception.", en: "Server-side validation, least privilege and defense in depth from the start." } },
    { title: { fr: "Progresser", en: "Grow" }, body: { fr: "Apprendre vite, documenter ses décisions et livrer des améliorations mesurables.", en: "Learn fast, document decisions and ship measurable improvements." } },
  ],
};
