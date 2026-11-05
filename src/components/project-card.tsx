import Image from "next/image";
import { ViewTransition } from "react";
import Link from "next/link";
import { pick, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { mediaUrl } from "@/lib/content";
import type { Project } from "@/lib/types";

const COVER_COLORS = ["var(--blue)", "var(--red)", "var(--yellow)"];

/**
 * Couverture d'album générée tant qu'il n'y a pas de capture :
 * aplat de couleur tramé, rayons d'action, titre en lettrage, numéro d'épisode.
 */
function GeneratedCover({ project, title, issue, index }: { project: Project; title: string; issue: string; index: number }) {
  const color = COVER_COLORS[index % COVER_COLORS.length];
  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: color }} role="img" aria-label={title}>
      {/* Rayons d'action depuis le centre */}
      <svg viewBox="0 0 400 250" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full opacity-25" aria-hidden="true">
        {Array.from({ length: 18 }, (_, ray) => {
          const a1 = (ray / 18) * Math.PI * 2, a2 = a1 + 0.12;
          return <path key={ray} d={`M200 125 L${200 + Math.cos(a1) * 400} ${125 + Math.sin(a1) * 400} L${200 + Math.cos(a2) * 400} ${125 + Math.sin(a2) * 400} Z`} fill="#141210" />;
        })}
      </svg>
      <div aria-hidden="true" className="cover-dots dots-strong absolute inset-0" />
      <span aria-hidden="true" className="absolute top-3 left-3 border-2 border-[#141210] bg-[#fffaf0] px-2 py-0.5 text-xs font-bold text-[#141210] tabular-nums">{issue} {index + 1} · {project.year ?? ""}</span>
      <span aria-hidden="true" className="pop-title absolute inset-x-4 top-1/2 -translate-y-1/2 -rotate-3 text-center text-[clamp(2.4rem,5vw,3.6rem)] [overflow-wrap:anywhere]" style={{ color: color === "var(--yellow)" ? "#fffaf0" : "var(--yellow)" }}>{title}</span>
      <span aria-hidden="true" className="absolute right-3 bottom-3 rounded-[3px] border-2 border-[#141210] bg-[#fffaf0] px-2 py-0.5 text-xs font-bold text-[#141210]">{project.tech.slice(0, 3).join(" · ")}</span>
    </div>
  );
}

export function ProjectCover({ project, locale, sizes, issue, index = 0, priority = false }: { project: Project; locale: Locale; sizes: string; issue: string; index?: number; priority?: boolean }) {
  const src = mediaUrl(project.cover_path);
  const title = pick(project.title, locale);
  if (src) return <Image src={src} alt={title} fill sizes={sizes} priority={priority} className="object-cover" />;
  return <GeneratedCover project={project} title={title} issue={issue} index={index} />;
}

/** Statut en étoile d'action : « Livré » en jaune, « En cours » en rouge. */
export function StatusBurst({ project, dict, size = 84 }: { project: Project; dict: Dictionary; size?: number }) {
  const inProgress = project.status === "in_progress";
  return (
    <span className="burst display rotate-6 px-3 text-base leading-tight" style={{ width: size, height: size, background: inProgress ? "var(--red)" : "var(--yellow)", color: inProgress ? "var(--on-red)" : "#141210" }}>
      {inProgress ? `${dict.projects.inProgress}…` : dict.projects.done}
    </span>
  );
}

/** Carte projet : une couverture d'album, qui se soulève au survol. */
export function ProjectCard({ project, locale, dict, index = 0 }: { project: Project; locale: Locale; dict: Dictionary; index?: number }) {
  const tilt = [-1, 1.2, -0.6][index % 3];
  return (
    <Link href={`/${locale}/projects/${project.slug}`} className="cover-card panel group flex h-full flex-col overflow-visible" style={{ transform: `rotate(${tilt}deg)` }}>
      {/* Même nom que sur la page du projet : la couverture et le titre « voyagent » d'une page à l'autre. */}
      <ViewTransition name={`project-cover-${project.slug}`} share="morph" default="none">
        <div className="relative aspect-[4/3] overflow-hidden border-b-[3px] border-ink">
          <ProjectCover project={project} locale={locale} issue={dict.comic.issueShort} index={index} sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" />
        </div>
      </ViewTransition>
      <div className="absolute -top-5 -right-4 z-10"><StatusBurst project={project} dict={dict} /></div>
      <div className="flex flex-1 flex-col p-5">
        <p className="eyebrow">{project.category}{project.year ? ` · ${project.year}` : ""}</p>
        <ViewTransition name={`project-title-${project.slug}`} share="morph" default="none">
          <h3 className="display mt-1 w-fit text-[2.1rem]">{pick(project.title, locale)}</h3>
        </ViewTransition>
        <p className="mt-1 flex-1 text-base text-muted">{pick(project.summary, locale)}</p>
        <span className="mt-4 flex items-center justify-between font-bold">
          <span className="link-underline">{dict.projects.read}</span>
          <span aria-hidden="true" className="display text-2xl text-red transition-transform group-hover:translate-x-1">→</span>
        </span>
      </div>
    </Link>
  );
}
