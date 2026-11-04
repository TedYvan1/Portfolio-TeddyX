import Image from "next/image";
import { ViewTransition } from "react";
import Link from "next/link";
import { pick, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { mediaUrl } from "@/lib/content";
import type { Project } from "@/lib/types";

/**
 * Couverture générée tant qu'il n'y a pas de capture : un croquis au crayon,
 * le projet au centre et ses technologies reliées autour, sur papier hachuré.
 */
function GeneratedCover({ project, title }: { project: Project; title: string }) {
  const tech = project.tech.slice(0, 5);
  const spots = [[90, 60], [310, 56], [330, 190], [80, 196], [200, 214]];
  return (
    <div className="absolute inset-0 bg-[repeating-linear-gradient(-45deg,var(--paper)_0_10px,var(--sheet)_10px_20px)]" role="img" aria-label={title}>
      <svg viewBox="0 0 400 250" preserveAspectRatio="xMidYMid meet" className="absolute inset-0 h-full w-full" aria-hidden="true">
        {tech.map((name, index) => {
          const [x, y] = spots[index];
          return (
            <g key={name}>
              <path d={`M200 125 Q${(200 + x) / 2 + (index % 2 ? 14 : -14)} ${(125 + y) / 2} ${x} ${y}`} fill="none" stroke="var(--ink-2)" strokeWidth="1.6" strokeDasharray="5 4" strokeLinecap="round" />
              <text x={x} y={y + 5} textAnchor="middle" fontSize="15" fontFamily="var(--font-code), cursive" fill="var(--ink)" paintOrder="stroke" stroke="var(--sheet)" strokeWidth="6" strokeLinejoin="round">{name}</text>
            </g>
          );
        })}
        <rect x="150" y="104" width="100" height="42" fill="var(--sheet)" stroke="var(--ink)" strokeWidth="1.8" transform="rotate(-2 200 125)" />
        <text x="200" y="134" textAnchor="middle" fontSize="26" fontWeight="700" fontFamily="var(--font-body), cursive" fill="var(--ink)">{title.slice(0, 2).toUpperCase()}</text>
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

/** Tampon encreur : « Livré » en vert, « En cours » en ambre. */
export function Stamp({ project, dict }: { project: Project; dict: Dictionary }) {
  const inProgress = project.status === "in_progress";
  return <span className={`stamp ${inProgress ? "stamp-wait" : ""}`}>{inProgress ? dict.projects.inProgress : dict.projects.done}</span>;
}

/** Fiche bristol posée légèrement de travers ; elle se redresse et se soulève au survol. */
export function ProjectCard({ project, locale, dict, index = 0 }: { project: Project; locale: Locale; dict: Dictionary; index?: number }) {
  const tilt = [-1.2, 0.9, -0.5, 1.3][index % 4];
  return (
    <Link href={`/${locale}/projects/${project.slug}`} className="card-lift group panel flex h-full flex-col overflow-hidden" style={{ transform: `rotate(${tilt}deg)` }}>
      {/* Même nom que sur la page du projet : la couverture et le titre « voyagent » d'une page à l'autre. */}
      <ViewTransition name={`project-cover-${project.slug}`} share="morph" default="none">
        <div className="relative aspect-[16/10] overflow-hidden border-b-[1.5px] border-ink">
          <ProjectCover project={project} locale={locale} sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" />
        </div>
      </ViewTransition>
      <div className="flex flex-1 flex-col p-5 pt-4">
        <div className="flex items-center justify-between gap-3 font-mono text-[12px] tracking-wider text-muted">
          <span>N° {String(index + 1).padStart(2, "0")} · {project.category}{project.year ? ` · ${project.year}` : ""}</span>
          <i aria-hidden="true" className="h-3 w-3 rounded-full border-[1.5px] border-ink bg-(--paper)" />
        </div>
        <ViewTransition name={`project-title-${project.slug}`} share="morph" default="none">
          <h3 className="mt-3 w-fit text-[clamp(1.6rem,2.4vw,2.1rem)] leading-none font-bold">{pick(project.title, locale)}</h3>
        </ViewTransition>
        <p className="mt-2 flex-1 text-[15px] leading-relaxed text-muted">{pick(project.summary, locale)}</p>
        <div className="mt-5 flex items-end justify-between">
          <Stamp project={project} dict={dict} />
          <span aria-hidden="true" className="grid h-10 w-10 place-items-center rounded-(--radius) border-[1.5px] border-ink transition-colors group-hover:bg-ink group-hover:text-sheet">→</span>
        </div>
        <span className="sr-only">{dict.projects.read}</span>
      </div>
    </Link>
  );
}
