// Contenu initial du portfolio (issu du CV), utilisé par server/seed.ts.

export const seedProjects = [
  {
    title: "KoumanPlay",
    slug: "koumanplay",
    shortDescription: "Jeu mobile qui transforme la transmission culturelle ivoirienne en expérience ludique et intergénérationnelle.",
    description: "KoumanPlay est un jeu mobile qui transforme la transmission culturelle ivoirienne en expérience ludique, sensible et intergénérationnelle. Développé en 2026 avec Flutter et Dart.",
    imageUrl: "",
    githubUrl: "",
    liveUrl: "",
    category: "Mobile",
    technologies: "Flutter, Dart",
    featured: 1,
    published: 1,
  },
  {
    title: "TontinCi",
    slug: "tontinci",
    shortDescription: "Application mobile pour créer et gérer des groupes de tontine, suivre les cotisations et l'historique des transactions.",
    description: "TontinCi est une application mobile pour créer, rejoindre et gérer des groupes de tontine, suivre les cotisations et consulter l'historique des transactions. Interface conçue sur Figma, développée avec Flutter et Dart, données et authentification gérées avec Supabase. Projet en cours de développement.",
    imageUrl: "",
    githubUrl: "",
    liveUrl: "",
    category: "Mobile",
    technologies: "Flutter, Dart, Supabase, IconSax, Figma, GitHub",
    featured: 1,
    published: 1,
  },
  {
    title: "PouletFraisCI",
    slug: "pouletfraisci",
    shortDescription: "Site vitrine e-commerce pour promouvoir et commander des produits avicoles locaux.",
    description: "PouletFraisCI est une plateforme web vitrine conçue en 2026 pour promouvoir les produits avicoles locaux et faciliter la commande en ligne. Le projet met en pratique HTML5, CSS3 et JavaScript dans une expérience responsive, claire et orientée conversion.",
    imageUrl: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=1200&q=85",
    githubUrl: "",
    liveUrl: "",
    category: "Frontend",
    technologies: "HTML5, CSS3, JavaScript",
    featured: 1,
    published: 1,
  },
  {
    title: "Portfolio & CMS",
    slug: "portfolio-cms",
    shortDescription: "Ce portfolio : un site full-stack avec un espace d'administration sécurisé pour gérer tout le contenu.",
    description: "Portfolio personnel conçu et développé de bout en bout. Le front est en React 19 + TypeScript avec Vite et Tailwind CSS ; l'API utilise Express et tRPC avec validation Zod côté serveur ; les données sont stockées dans PostgreSQL via Drizzle ORM. Un espace d'administration protégé par JWT (cookie httpOnly, mots de passe hachés avec bcrypt, contrôle des rôles) permet de modifier le profil, les projets, les compétences, les certifications et de lire les messages du formulaire de contact.",
    imageUrl: "",
    githubUrl: "https://github.com/TedYvan1/Portfolio-TeddyX",
    liveUrl: "",
    category: "Full-Stack",
    technologies: "React, TypeScript, Express, tRPC, PostgreSQL, JWT",
    featured: 0,
    published: 1,
  },
];

export const seedSkills = [
  { name: "HTML5", category: "Frontend", level: "Intermediate" as const, icon: "Code2", description: "Structure sémantique et bases solides pour des interfaces accessibles." },
  { name: "CSS3", category: "Frontend", level: "Intermediate" as const, icon: "Palette", description: "Mise en page responsive, composants visuels et design cohérent." },
  { name: "JavaScript", category: "Frontend", level: "Intermediate" as const, icon: "Code2", description: "Interactions web, logique applicative et manipulation du DOM." },
  { name: "React.js", category: "Frontend", level: "Intermediate" as const, icon: "Code2", description: "Construction d'interfaces composables et réutilisables." },
  { name: "Flutter", category: "Frontend", level: "Intermediate" as const, icon: "MonitorSmartphone", description: "Applications mobiles multiplateformes (KoumanPlay, TontinCi)." },
  { name: "Dart", category: "Frontend", level: "Intermediate" as const, icon: "Code2", description: "Langage des applications Flutter." },
  { name: "Design responsive", category: "Frontend", level: "Intermediate" as const, icon: "MonitorSmartphone", description: "Expériences adaptées au mobile, à la tablette et au desktop." },
  { name: "Intégration d'API REST", category: "Frontend", level: "Intermediate" as const, icon: "Network", description: "Consommation d'API REST depuis les interfaces web et mobiles." },
  { name: "Node.js", category: "Backend", level: "Beginner" as const, icon: "Server", description: "Développement serveur en JavaScript." },
  { name: "Express.js", category: "Backend", level: "Beginner" as const, icon: "Server", description: "Création d'API web et de middlewares avec Express." },
  { name: "Développement d'API REST", category: "Backend", level: "Beginner" as const, icon: "Network", description: "Conception de routes, validation des données et réponses HTTP." },
  { name: "Authentification et autorisation", category: "Backend", level: "Beginner" as const, icon: "ShieldCheck", description: "Connexion des utilisateurs et contrôle des droits d'accès." },
  { name: "Tests unitaires et d'intégration", category: "Backend", level: "Beginner" as const, icon: "Terminal", description: "Vérification automatisée du code et des API." },
  { name: "SQL (MySQL & PostgreSQL)", category: "Bases de données", level: "Intermediate" as const, icon: "Database", description: "Requêtes et gestion des données relationnelles." },
  { name: "Supabase", category: "Bases de données", level: "Beginner" as const, icon: "Database", description: "Base PostgreSQL hébergée, authentification et API pour les applications web et mobiles." },
  { name: "Conception et modélisation de bases de données", category: "Bases de données", level: "Intermediate" as const, icon: "Database", description: "Modélisation des entités et des relations avant le développement." },
  { name: "Git & GitHub", category: "Outils", level: "Intermediate" as const, icon: "GitBranch", description: "Versioning, collaboration et suivi des évolutions." },
  { name: "Postman", category: "Outils", level: "Intermediate" as const, icon: "Network", description: "Test et documentation des API REST." },
  { name: "Linux", category: "Outils", level: "Beginner" as const, icon: "Terminal", description: "Ligne de commande et administration de base." },
  { name: "Android Studio", category: "Outils", level: "Beginner" as const, icon: "MonitorSmartphone", description: "Émulateurs et outils de build pour les applications mobiles." },
  { name: "VMware", category: "Outils", level: "Beginner" as const, icon: "MonitorCog", description: "Virtualisation pour les travaux pratiques réseaux et systèmes." },
  { name: "JWT & authentification sécurisée", category: "Sécurité", level: "Beginner" as const, icon: "ShieldCheck", description: "Sessions signées et stockage sûr des mots de passe." },
  { name: "Gestion des accès", category: "Sécurité", level: "Beginner" as const, icon: "ShieldCheck", description: "Rôles et permissions côté serveur." },
  { name: "Sécurité des API", category: "Sécurité", level: "Beginner" as const, icon: "ShieldCheck", description: "Validation des entrées, limitation des requêtes et erreurs maîtrisées." },
].map((skill, index) => ({ ...skill, displayOrder: index + 1 }));

export const seedAboutCards = [
  { label: "01", title: "Construire", description: "Des interfaces accessibles et des APIs qui restent compréhensibles quand le produit grandit.", displayOrder: 1 },
  { label: "02", title: "Comprendre", description: "Un double parcours qui relie les fondamentaux des réseaux, la sécurité informatique et la construction de logiciels utiles.", displayOrder: 2 },
  { label: "03", title: "Sécuriser", description: "Validation côté serveur, moindre privilège et défense en profondeur dès la conception.", displayOrder: 3 },
  { label: "04", title: "Progresser", description: "Apprendre vite, documenter les décisions et livrer des améliorations mesurables.", displayOrder: 4 },
];

export const seedCertifications = [
  { title: "Notions de base sur les réseaux", issuer: "Cybastion IT Academy", dateLabel: "2026", type: "Réseaux", description: "Certification qui renforce les fondamentaux des réseaux et la compréhension des échanges entre systèmes.", displayOrder: 1 },
  { title: "Certificat de participation - VIBEATHON 2026", issuer: "VIBEATHON", dateLabel: "2026", type: "Hackathon", description: "Participation au VIBEATHON 2026, compétition de développement en équipe.", displayOrder: 2 },
  { title: "Introduction à la cybersécurité", issuer: "Cisco Networking Academy", dateLabel: "2025", type: "Sécurité", description: "Premiers repères sur les menaces, la protection des systèmes et les bonnes pratiques de cybersécurité.", displayOrder: 3 },
];

export const seedStrengths = [
  { label: "Analyse & Résolution de problèmes", displayOrder: 1 },
  { label: "Adaptabilité", displayOrder: 2 },
  { label: "Rigueur & Autonomie", displayOrder: 3 },
  { label: "Curiosité intellectuelle", displayOrder: 4 },
];

export const seedLanguages = [
  { name: "Français", level: "Langue maternelle", displayOrder: 1 },
  { name: "Anglais", level: "Niveau intermédiaire", displayOrder: 2 },
];

export const seedEducations = [
  { title: "Licence 3 - Réseaux et Sécurité Informatique", institution: "Université Virtuelle de Côte d'Ivoire (UVCI)", location: "Abidjan", period: "Depuis 2024", description: "Formation universitaire centrée sur les réseaux, la sécurité informatique et l'analyse des infrastructures.", displayOrder: 1 },
  { title: "Licence 3 - Génie Logiciel", institution: "Université Nord-Sud", location: "Bouaké", period: "Depuis 2024", description: "Parcours complémentaire consacré à la conception, au développement et à la maintenance de logiciels.", displayOrder: 2 },
  { title: "Baccalauréat Série D", institution: "Lycée Municipal de Brobo", location: "Brobo, Côte d'Ivoire", period: "De sept. 2023 à juil. 2024", description: null, displayOrder: 3 },
];
