import {
  siAndroidstudio, siCss, siDart, siExpress, siFigma, siFlutter, siGit, siGithub, siHtml5, siJavascript,
  siJsonwebtokens, siLinux, siMysql, siNextdotjs, siNodedotjs, siPostgresql, siPostman, siReact, siSupabase,
  siTypescript, siVmware,
} from "simple-icons";

/**
 * Icône d'une compétence : logo officiel (Simple Icons, chemins SVG 24 × 24) pour une technologie,
 * ou picto dessiné maison pour une notion (API, tests, modélisation…).
 * La correspondance se fait sur le nom saisi dans l'admin ; une compétence inconnue garde ses initiales.
 */
export type TechIcon = { kind: "brand"; path: string; title: string } | { kind: "custom"; id: CustomIcon; title: string };
export type CustomIcon = "api" | "tests" | "model" | "key" | "shield" | "database";

type SimpleIcon = { path: string; title: string };
const brand = (icon: SimpleIcon): TechIcon => ({ kind: "brand", path: icon.path, title: icon.title });

// Ordre important : la première règle qui correspond gagne pour chaque « mot » de la compétence.
const BRANDS: [RegExp, SimpleIcon][] = [
  [/next\.?js/, siNextdotjs],
  [/react/, siReact],
  [/flutter/, siFlutter],
  [/\bdart\b/, siDart],
  [/typescript/, siTypescript],
  [/javascript/, siJavascript],
  [/html/, siHtml5],
  [/\bcss/, siCss],
  [/node/, siNodedotjs],
  [/express/, siExpress],
  [/mysql/, siMysql],
  [/postgre/, siPostgresql],
  [/supabase/, siSupabase],
  [/github/, siGithub],
  [/\bgit\b/, siGit],
  [/postman/, siPostman],
  [/linux/, siLinux],
  [/android/, siAndroidstudio],
  [/vmware/, siVmware],
  [/jwt|json web token/, siJsonwebtokens],
  [/figma/, siFigma],
];

const CUSTOM: [RegExp, CustomIcon, string][] = [
  [/test/, "tests", "Tests"],
  [/s[ée]curit|security/, "shield", "Sécurité"],
  [/acc[èe]s|access/, "key", "Accès"],
  [/mod[ée]lis|model/, "model", "Modélisation"],
  [/\bapi\b/, "api", "API"],
  [/sql|base de donn|database/, "database", "Base de données"],
];

/** Jusqu'à deux icônes par compétence (« Git & GitHub », « HTML5 · CSS3 »…). */
export function techIcons(name: string): TechIcon[] {
  const lower = name.toLowerCase();
  const found: TechIcon[] = [];
  for (const [pattern, icon] of BRANDS) {
    if (pattern.test(lower) && !found.some(item => item.title === icon.title)) found.push(brand(icon));
    if (found.length === 2) return found;
  }
  if (found.length) return found;
  for (const [pattern, id, title] of CUSTOM) {
    if (pattern.test(lower)) return [{ kind: "custom", id, title }];
  }
  return [];
}
