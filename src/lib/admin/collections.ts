/**
 * Description des contenus éditables : une seule source pour les formulaires, la validation et les listes de l'admin.
 * Les limites reprennent celles des contraintes SQL (supabase/migrations/20261103000000_init.sql).
 */

export type Field =
  | { name: string; label: string; type: "text"; required?: boolean; max?: number; hint?: string }
  | { name: string; label: string; type: "slug"; hint?: string }
  | { name: string; label: string; type: "url"; hint?: string }
  | { name: string; label: string; type: "email"; required?: boolean }
  | { name: string; label: string; type: "localized"; required?: boolean; max: number; multiline?: boolean; rows?: number; hint?: string }
  | { name: string; label: string; type: "number"; min: number; max: number; required?: boolean }
  | { name: string; label: string; type: "date" }
  | { name: string; label: string; type: "boolean"; hint?: string }
  | { name: string; label: string; type: "tags"; hint?: string }
  | { name: string; label: string; type: "select"; options: { value: string; label: string }[]; numeric?: boolean }
  | { name: string; label: string; type: "reference"; table: string; labelColumn: string; localizedLabel?: boolean }
  | { name: string; label: string; type: "file"; accept: string; folder: string; hint?: string }
  | { name: string; label: string; type: "files"; accept: string; folder: string; hint?: string };

export type Collection = {
  key: string;
  table: string;
  label: string;
  singular: string;
  /** Nom féminin (« nouvelle catégorie »). */
  feminine?: boolean;
  description: string;
  /** Colonne affichée comme titre dans la liste ; `localized` si c'est un texte bilingue. */
  titleColumn: string;
  localizedTitle?: boolean;
  /** Indication secondaire dans la liste. */
  subtitle?: (row: Record<string, unknown>) => string;
  /** Lien vers la page publique, pour vérifier après publication. */
  publicPath?: (row: Record<string, unknown>) => string | null;
  /** Colonne de tri principale (avant sort_order), pour regrouper les compétences par catégorie. */
  groupBy?: string;
  fields: Field[];
};

const IMAGE = "image/png,image/jpeg,image/webp,image/avif";

/** Bucket public des fichiers (photo, captures, CV) : mêmes types et même taille maximale que dans la migration. */
export const MEDIA_BUCKET = "media";
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

export const collections: Collection[] = [
  {
    key: "projets",
    table: "projects",
    label: "Projets",
    singular: "projet",
    description: "Les études de cas : visibles sur le site une fois publiées.",
    titleColumn: "title",
    localizedTitle: true,
    subtitle: row => [row.category, row.year, row.published ? "publié" : "brouillon"].filter(Boolean).join(" · "),
    publicPath: row => (row.published ? `/fr/projects/${row.slug}` : null),
    fields: [
      { name: "title", label: "Titre", type: "localized", required: true, max: 120 },
      { name: "slug", label: "Adresse (slug)", type: "slug", hint: "Minuscules, chiffres et tirets : koumanplay, tontin-ci…" },
      { name: "summary", label: "Résumé", type: "localized", required: true, max: 400, multiline: true, rows: 3, hint: "Une ou deux phrases, affichées sur la carte du projet." },
      { name: "category", label: "Catégorie", type: "text", max: 80, hint: "Ex. : Mobile, Web, Réseau." },
      { name: "year", label: "Année", type: "number", min: 2000, max: 2100 },
      { name: "status", label: "État", type: "select", options: [{ value: "in_progress", label: "En cours" }, { value: "done", label: "Terminé" }] },
      { name: "tech", label: "Technologies", type: "tags", hint: "Séparées par des virgules : Flutter, Dart, Supabase." },
      { name: "context", label: "Contexte", type: "localized", max: 20000, multiline: true, rows: 5 },
      { name: "my_role", label: "Mon rôle", type: "localized", max: 20000, multiline: true, rows: 4 },
      { name: "challenges", label: "Défis", type: "localized", max: 20000, multiline: true, rows: 5 },
      { name: "solution", label: "Solution", type: "localized", max: 20000, multiline: true, rows: 5 },
      { name: "results", label: "Résultats", type: "localized", max: 20000, multiline: true, rows: 4 },
      { name: "cover_path", label: "Image de couverture", type: "file", accept: IMAGE, folder: "projects", hint: "Sans image, une couverture est générée à partir des technologies." },
      { name: "gallery", label: "Galerie", type: "files", accept: IMAGE, folder: "projects" },
      { name: "github_url", label: "Code source (URL)", type: "url" },
      { name: "live_url", label: "Démo en ligne (URL)", type: "url" },
      { name: "featured", label: "Mis en avant sur l'accueil", type: "boolean" },
      { name: "published", label: "Publié", type: "boolean", hint: "Décoché, le projet n'est visible que dans l'admin." },
    ],
  },
  {
    key: "labs",
    table: "labs",
    label: "Labs",
    singular: "lab",
    description: "Exercices réseau et sécurité, comptes-rendus.",
    titleColumn: "title",
    localizedTitle: true,
    subtitle: row => [row.platform, row.published ? "publié" : "brouillon"].filter(Boolean).join(" · "),
    publicPath: row => (row.published ? `/fr/labs/${row.slug}` : null),
    fields: [
      { name: "title", label: "Titre", type: "localized", required: true, max: 160 },
      { name: "slug", label: "Adresse (slug)", type: "slug" },
      { name: "summary", label: "Résumé", type: "localized", required: true, max: 400, multiline: true, rows: 3 },
      { name: "platform", label: "Plateforme", type: "text", max: 80, hint: "Ex. : Packet Tracer, TryHackMe, GNS3." },
      { name: "done_on", label: "Réalisé le", type: "date" },
      { name: "tools", label: "Outils", type: "tags", hint: "Séparés par des virgules." },
      { name: "body", label: "Compte-rendu", type: "localized", max: 50000, multiline: true, rows: 14 },
      { name: "cover_path", label: "Image", type: "file", accept: IMAGE, folder: "labs" },
      { name: "published", label: "Publié", type: "boolean" },
    ],
  },
  {
    key: "categories",
    table: "skill_categories",
    label: "Catégories de compétences",
    singular: "catégorie",
    feminine: true,
    description: "Les groupes affichés dans la section Compétences (Frontend, Réseau…).",
    titleColumn: "name",
    localizedTitle: true,
    fields: [{ name: "name", label: "Nom", type: "localized", required: true, max: 80 }],
  },
  {
    key: "competences",
    table: "skills",
    label: "Compétences",
    singular: "compétence",
    feminine: true,
    description: "Chaque compétence appartient à une catégorie, avec un niveau de 1 à 3.",
    titleColumn: "name",
    groupBy: "category_id",
    subtitle: row => ["", "Débutant", "Intermédiaire", "Avancé"][Number(row.level)] ?? "",
    fields: [
      { name: "name", label: "Nom", type: "text", required: true, max: 120 },
      { name: "category_id", label: "Catégorie", type: "reference", table: "skill_categories", labelColumn: "name", localizedLabel: true },
      { name: "level", label: "Niveau", type: "select", numeric: true, options: [{ value: "1", label: "1 — Débutant" }, { value: "2", label: "2 — Intermédiaire" }, { value: "3", label: "3 — Avancé" }] },
    ],
  },
  {
    key: "formations",
    table: "educations",
    label: "Formations",
    singular: "formation",
    feminine: true,
    description: "Le parcours scolaire et universitaire.",
    titleColumn: "title",
    localizedTitle: true,
    subtitle: row => String(row.institution ?? ""),
    fields: [
      { name: "title", label: "Diplôme ou formation", type: "localized", required: true, max: 255 },
      { name: "institution", label: "Établissement", type: "text", required: true, max: 200 },
      { name: "location", label: "Lieu", type: "text", max: 120 },
      { name: "period", label: "Période", type: "localized", max: 120, hint: "Ex. : 2023 — aujourd'hui." },
      { name: "description", label: "Description", type: "localized", max: 2000, multiline: true, rows: 3 },
    ],
  },
  {
    key: "certifications",
    table: "certifications",
    label: "Certifications",
    singular: "certification",
    feminine: true,
    description: "Certificats, attestations, hackathons.",
    titleColumn: "title",
    localizedTitle: true,
    subtitle: row => [row.issuer, row.year].filter(Boolean).join(" · "),
    fields: [
      { name: "title", label: "Intitulé", type: "localized", required: true, max: 255 },
      { name: "issuer", label: "Organisme", type: "text", required: true, max: 200 },
      { name: "year", label: "Année", type: "number", min: 1990, max: 2100 },
      { name: "kind", label: "Type", type: "localized", max: 80, hint: "Ex. : Certificat, Hackathon." },
      { name: "url", label: "Lien de vérification", type: "url" },
    ],
  },
  {
    key: "langues",
    table: "languages",
    label: "Langues",
    singular: "langue",
    feminine: true,
    description: "Langues parlées et niveau.",
    titleColumn: "name",
    localizedTitle: true,
    fields: [
      { name: "name", label: "Langue", type: "localized", required: true, max: 80 },
      { name: "level", label: "Niveau", type: "localized", max: 120 },
    ],
  },
  {
    key: "atouts",
    table: "strengths",
    label: "Atouts",
    singular: "atout",
    description: "Qualités affichées dans la section Profil.",
    titleColumn: "label",
    localizedTitle: true,
    fields: [{ name: "label", label: "Atout", type: "localized", required: true, max: 120 }],
  },
  {
    key: "principes",
    table: "principles",
    label: "Principes",
    singular: "principe",
    description: "Façon de travailler, en quelques points numérotés.",
    titleColumn: "title",
    localizedTitle: true,
    fields: [
      { name: "title", label: "Titre", type: "localized", required: true, max: 120 },
      { name: "body", label: "Texte", type: "localized", max: 1000, multiline: true, rows: 3 },
    ],
  },
];

/** Le profil : une seule ligne (id = 1), mêmes types de champs. */
export const profileFields: Field[] = [
  { name: "full_name", label: "Nom complet", type: "text", required: true, max: 160 },
  { name: "display_name", label: "Nom affiché", type: "text", required: true, max: 120 },
  { name: "role", label: "Rôle", type: "localized", max: 200 },
  { name: "headline", label: "Accroche", type: "localized", max: 300, multiline: true, rows: 2, hint: "La phrase sous ton nom, sur l'accueil." },
  { name: "bio", label: "Présentation", type: "localized", max: 4000, multiline: true, rows: 6 },
  { name: "availability", label: "Disponibilité", type: "localized", max: 200 },
  { name: "seeking", label: "Ce que je cherche", type: "localized", max: 1000, multiline: true, rows: 3 },
  { name: "location", label: "Ville", type: "text", max: 120 },
  { name: "email", label: "E-mail de contact", type: "email", required: true },
  { name: "phone", label: "Téléphone", type: "text", max: 40 },
  { name: "github_url", label: "GitHub (URL)", type: "url" },
  { name: "linkedin_url", label: "LinkedIn (URL)", type: "url" },
  { name: "photo_path", label: "Photo", type: "file", accept: IMAGE, folder: "profile" },
  { name: "cv_path", label: "CV (PDF)", type: "file", accept: "application/pdf", folder: "cv" },
];

/** « Nouveau projet », « Nouvelle compétence ». */
export const newLabel = (collection: Collection) => `${collection.feminine ? "Nouvelle" : "Nouveau"} ${collection.singular}`;

export function findCollection(key: string) {
  return collections.find(collection => collection.key === key) ?? null;
}
