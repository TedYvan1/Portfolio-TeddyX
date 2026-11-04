import Image from "next/image";
import { ViewTransition } from "react";
import Link from "next/link";
import { pick, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { mediaUrl } from "@/lib/content";
import type { Project } from "@/lib/types";

/** Pseudo-aléatoire stable : la même couverture pour un même slug, à chaque rendu. */
function seeded(slug: string) {
  let state = Array.from(slug).reduce((hash, char) => (hash * 31 + char.charCodeAt(0)) >>> 0, 7);
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 2 ** 32;
  };
}

/**
 * Couverture générée quand un projet n'a pas encore de capture :
 * un mini-graphe (le projet au centre, ses technologies autour), dans l'esprit de l'accueil.
 */
function GeneratedCover({ project, title }: { project: Project; title: string }) {
  const random = seeded(project.slug);
  const tech = project.tech.slice(0, 6);
  const nodes = tech.map((name, index) => {
    const angle = (index / tech.length) * Math.PI * 2 + random() * 0.6;
    const distance = 70 + random() * 40;
    return { name, x: 200 + Math.cos(angle) * distance * 1.5, y: 120 + Math.sin(angle) * distance * 0.75 };
  });
  return (
    <div className="absolute inset-0 bg-surface-2" role="img" aria-label={title}>
      <div aria-hidden="true" className="dot-grid absolute inset-0 opacity-70" />
      <svg viewBox="0 0 400 240" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden="true">
        {nodes.map(node => <line key={`l-${node.name}`} className="cover-link" x1="200" y1="120" x2={node.x} y2={node.y} stroke="var(--muted)" />)}
        {nodes.map(node => (
          <g key={node.name}>
            <circle cx={node.x} cy={node.y} r="5" fill="var(--node-skill)" />
            <text x={node.x} y={node.y + 18} textAnchor="middle" fontSize="11" fill="var(--muted)" fontFamily="var(--font-code), monospace">{node.name}</text>
          </g>
        ))}
        <rect x="186" y="106" width="28" height="28" rx="5" fill="var(--node-project)" />
      </svg>
    </div>
  );
}

export function ProjectCover({ project, locale, sizes, priority = false }: { project: Project; locale: Locale; sizes: string; priority?: boolean }) {
  const src = mediaUrl(project.cover_path);
  const title = pick(project.title, locale);
  if (src) return <Image src={src} alt={title} fill sizes={sizes} priority={priority} className="object-cover" />;
  return <GeneratedCover project={project} title={title} />;
}

export function ProjectCard({ project, locale, dict }: { project: Project; locale: Locale; dict: Dictionary }) {
  const inProgress = project.status === "in_progress";
  return (
    <Link href={`/${locale}/projects/${project.slug}`} className="group panel flex h-full flex-col overflow-hidden transition-colors duration-200 hover:border-muted">
      {/* Même nom que sur la page du projet : la couverture et le titre « voyagent » d'une page à l'autre. */}
      <ViewTransition name={`project-cover-${project.slug}`} share="morph" default="none">
        <div className="relative aspect-[16/10] overflow-hidden border-b border-border">
          <ProjectCover project={project} locale={locale} sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" />
        </div>
      </ViewTransition>
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-center justify-between gap-3">
          <span className="tag flex items-center gap-2">
            <span aria-hidden="true" className="glyph glyph-project" />
            {project.category}{project.year ? ` · ${project.year}` : ""}
          </span>
          <span className={`chip ${inProgress ? "text-journey" : "text-skill"}`}>
            <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${inProgress ? "bg-journey" : "bg-skill"}`} />
            {inProgress ? dict.projects.inProgress : dict.projects.done}
          </span>
        </div>
        <ViewTransition name={`project-title-${project.slug}`} share="morph" default="none">
          <h3 className="mt-3 w-fit text-xl font-bold tracking-tight">{pick(project.title, locale)}</h3>
        </ViewTransition>
        <p className="mt-2 flex-1 text-[15px] leading-7 text-muted">{pick(project.summary, locale)}</p>
        <span className="mt-5 text-sm font-semibold text-accent">
          {dict.projects.read} <span aria-hidden="true" className="inline-block transition-transform group-hover:translate-x-1">→</span>
        </span>
      </div>
    </Link>
  );
}
