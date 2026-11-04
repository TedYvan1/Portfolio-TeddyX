import { pick, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { mediaUrl } from "./content";
import type { SiteContent } from "./types";

export type NodeGroup = "me" | "project" | "skill" | "journey" | "contact";
export type NodeKind = "me" | "hub" | "category" | "leaf";

export type GraphNode = {
  id: string;
  kind: NodeKind;
  group: NodeGroup;
  label: string;
  /** Contenu du panneau de détail (texte simple, sérialisable vers le client). */
  detail: {
    eyebrow: string;
    title: string;
    body?: string;
    tags?: string[];
    action?: { href: string; label: string; external?: boolean };
  };
};

export type GraphLink = { source: string; target: string; kind: "tree" | "uses" };
export type GraphData = { nodes: GraphNode[]; links: GraphLink[] };

// « React.js », « react » et « React » désignent la même techno ; « HTML5 · CSS3 » couvre « HTML5 » et « CSS3 ».
const norm = (value: string) => value.toLowerCase().replace(/\.js\b|[^a-z0-9+#]+/g, " ").trim();
const tokens = (value: string) => norm(value).split(" ").filter(token => token.length > 1);

/** Une techno de projet correspond-elle à une compétence ? (tous ses mots présents dans le nom de la compétence) */
function matches(tech: string, skill: string) {
  const skillTokens = new Set(tokens(skill));
  const techTokens = tokens(tech);
  return techTokens.length > 0 && techTokens.every(token => skillTokens.has(token));
}

export function buildGraph(content: SiteContent, locale: Locale, dict: Dictionary): GraphData {
  const { profile, projects, skills, educations, certifications } = content;
  const g = dict.graph;
  const nodes: GraphNode[] = [];
  const links: GraphLink[] = [];
  const add = (node: GraphNode, parent?: string) => {
    nodes.push(node);
    if (parent) links.push({ source: parent, target: node.id, kind: "tree" });
  };

  add({
    id: "me",
    kind: "me",
    group: "me",
    label: profile.display_name,
    detail: { eyebrow: profile.location, title: profile.display_name, body: pick(profile.bio, locale) || pick(profile.headline, locale), tags: [pick(profile.availability, locale)].filter(Boolean) },
  });

  // ── Projets
  if (projects.length) {
    add({ id: "hub:projects", kind: "hub", group: "project", label: dict.nav.projects, detail: { eyebrow: g.hub, title: dict.nav.projects, body: dict.projects.subtitle, action: { href: `/${locale}/projects`, label: dict.projects.all } } }, "me");
    for (const project of projects) {
      add({
        id: `project:${project.slug}`,
        kind: "leaf",
        group: "project",
        label: pick(project.title, locale),
        detail: {
          eyebrow: `${dict.nav.projects} · ${project.category}${project.year ? ` · ${project.year}` : ""}`,
          title: pick(project.title, locale),
          body: pick(project.summary, locale),
          tags: [project.status === "in_progress" ? dict.projects.inProgress : dict.projects.done, ...project.tech],
          action: { href: `/${locale}/projects/${project.slug}`, label: dict.projects.read },
        },
      }, "hub:projects");
    }
  }

  // ── Compétences : pôle → catégories → compétences
  const skillIds: { id: string; name: string }[] = [];
  if (skills.length) {
    add({ id: "hub:skills", kind: "hub", group: "skill", label: dict.skills.eyebrow, detail: { eyebrow: g.hub, title: dict.skills.title } }, "me");
    skills.forEach((category, index) => {
      const categoryId = `category:${index}`;
      const categoryName = pick(category.name, locale);
      add({ id: categoryId, kind: "category", group: "skill", label: categoryName, detail: { eyebrow: dict.skills.eyebrow, title: categoryName, tags: category.skills.map(skill => skill.name) } }, "hub:skills");
      category.skills.forEach((skill, skillIndex) => {
        const id = `skill:${index}:${skillIndex}`;
        skillIds.push({ id, name: skill.name });
        const usedBy = projects.filter(project => project.tech.some(tech => matches(tech, skill.name))).map(project => pick(project.title, locale));
        add({
          id,
          kind: "leaf",
          group: "skill",
          label: skill.name,
          detail: {
            eyebrow: `${categoryName} · ${dict.skills.levels[skill.level - 1]}`,
            title: skill.name,
            body: usedBy.length ? `${g.usedIn} ${usedBy.join(", ")}.` : undefined,
          },
        }, categoryId);
      });
    });
  }

  // Liens « utilise » : projet ↔ compétence, déduits de la stack du projet.
  for (const project of projects) {
    for (const skill of skillIds) {
      if (project.tech.some(tech => matches(tech, skill.name))) links.push({ source: `project:${project.slug}`, target: skill.id, kind: "uses" });
    }
  }

  // ── Parcours : formations et certifications
  if (educations.length || certifications.length) {
    add({ id: "hub:journey", kind: "hub", group: "journey", label: dict.journey.eyebrow, detail: { eyebrow: g.hub, title: dict.journey.title, action: { href: `/${locale}#journey`, label: g.seeList } } }, "me");
    educations.forEach((item, index) => {
      add({
        id: `education:${index}`,
        kind: "leaf",
        group: "journey",
        label: item.institution.match(/\(([^)]+)\)/)?.[1] ?? item.institution.replace(/^Université\s+/i, ""),
        detail: { eyebrow: `${dict.journey.education} · ${pick(item.period, locale)}`, title: pick(item.title, locale), body: [item.institution, item.location].filter(Boolean).join(" · ") },
      }, "hub:journey");
    });
    certifications.forEach((item, index) => {
      add({
        id: `certification:${index}`,
        kind: "leaf",
        group: "journey",
        label: item.issuer,
        detail: {
          eyebrow: `${dict.journey.certifications}${item.year ? ` · ${item.year}` : ""}`,
          title: pick(item.title, locale),
          body: `${item.issuer} · ${pick(item.kind, locale)}`,
          action: item.url ? { href: item.url, label: g.credential, external: true } : undefined,
        },
      }, "hub:journey");
    });
  }

  // ── Contact
  add({ id: "hub:contact", kind: "hub", group: "contact", label: dict.nav.contact, detail: { eyebrow: g.hub, title: dict.contact.title, body: dict.contact.subtitle, action: { href: `/${locale}#contact`, label: g.writeMe } } }, "me");
  const contacts = [
    { id: "contact:email", label: "Email", body: profile.email, href: `mailto:${profile.email}` },
    { id: "contact:github", label: "GitHub", body: profile.github_url?.replace(/^https?:\/\/(www\.)?/, ""), href: profile.github_url },
    { id: "contact:linkedin", label: "LinkedIn", body: "LinkedIn", href: profile.linkedin_url },
    { id: "contact:cv", label: "CV", body: dict.hero.cv, href: mediaUrl(profile.cv_path) },
  ];
  for (const contact of contacts) {
    if (!contact.href) continue;
    add({
      id: contact.id,
      kind: "leaf",
      group: "contact",
      label: contact.label,
      detail: { eyebrow: dict.nav.contact, title: contact.label, body: contact.body ?? undefined, action: { href: contact.href, label: g.open, external: !contact.href.startsWith("mailto:") } },
    }, "hub:contact");
  }

  return { nodes, links };
}
