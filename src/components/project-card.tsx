import Image from "next/image";
import { ViewTransition } from "react";
import Link from "next/link";
import { pick, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { mediaUrl } from "@/lib/content";
import type { Project } from "@/lib/types";

const CABLES = ["var(--cable-orange)", "var(--cable-blue)", "var(--cable-green)", "var(--cable-brown)"];

/** Référence de modèle stable, tirée du slug, comme sur une plaque d'équipement. */
export function modelRef(project: Project) {
  const hash = Array.from(project.slug).reduce((value, char) => (value * 31 + char.charCodeAt(0)) >>> 0, 7);
  return `${project.slug.slice(0, 2).toUpperCase()}-${project.year ?? "XX"}-${(hash % 900) + 100}`;
}

/**
 * Couverture générée quand le projet n'a pas encore de capture :
 * la face avant d'un module, une prise par technologie, câbles branchés.
 */
function GeneratedCover({ project, title }: { project: Project; title: string }) {
  const tech = project.tech.slice(0, 5);
  const width = 400;
  const slot = Math.min(72, (width - 60) / Math.max(1, tech.length));
  const start = (width - slot * tech.length) / 2;
  return (
    <div className="absolute inset-0 bg-rack" role="img" aria-label={title}>
      <svg viewBox="0 0 400 250" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <circle cx="376" cy="22" r="3" fill={project.status === "done" ? "var(--led-on)" : "var(--led-act)"} />
        <g transform="translate(200 -10) scale(1.38) translate(-200 0)">
        {tech.map((name, index) => {
          const x = start + index * slot + slot / 2;
          const color = CABLES[index % CABLES.length];
          return (
            <g key={name}>
              <path d={`M${x - 16} 62h32v20h-9v8h-14v-8h-9z`} fill="var(--socket)" />
              <g className="cover-cable" style={{ ["--swing" as string]: `${index % 2 ? 4 : -4}deg` }}>
                <rect x={x - 11} y="70" width="22" height="16" rx="1.5" fill="rgb(225 232 238 / 0.5)" />
                <path d={`M${x - 9} 86h18l-4 9h-10z`} fill={color} />
                <path d={`M${x} 95 C ${x} 150, ${x + (200 - x) * 0.5} 190, ${x + (200 - x) * 0.4} 260`} fill="none" stroke={color} strokeWidth="6" strokeLinecap="round" />
              </g>
              <rect x={x - slot / 2 + 4} y="40" width={slot - 8} height="15" fill="var(--tape)" />
              <text x={x} y="51" textAnchor="middle" fontSize={name.length > 9 ? 7.5 : 9} fontWeight="700" fill="var(--tape-ink)" fontFamily="var(--font-tape), sans-serif" letterSpacing="0.6">{name.toUpperCase()}</text>
            </g>
          );
        })}
        </g>
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

export function StatusLed({ project, dict }: { project: Project; dict: Dictionary }) {
  const inProgress = project.status === "in_progress";
  return (
    <span className="chip">
      <span aria-hidden="true" className={`led ${inProgress ? "led-act" : "led-on"}`} />
      {inProgress ? dict.projects.inProgress : dict.projects.done}
    </span>
  );
}

/** Carte projet : un module de rack, qui coulisse vers l'avant au survol. */
export function ProjectCard({ project, locale, dict }: { project: Project; locale: Locale; dict: Dictionary }) {
  return (
    <Link href={`/${locale}/projects/${project.slug}`} className="module group panel flex h-full flex-col overflow-hidden">
      <div aria-hidden="true" className="flex items-center justify-between border-b border-border px-3 py-1.5">
        <span className="screw" /><span className="tag text-[0.65rem]">{modelRef(project)}</span><span className="screw" style={{ ["--screw-angle" as string]: "-40deg" }} />
      </div>
      {/* Même nom que sur la page du projet : la couverture et le titre « voyagent » d'une page à l'autre. */}
      <ViewTransition name={`project-cover-${project.slug}`} share="morph" default="none">
        <div className="relative aspect-[16/10] overflow-hidden border-b border-border">
          <ProjectCover project={project} locale={locale} sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" />
        </div>
      </ViewTransition>
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-center justify-between gap-3">
          <span className="tag">{project.category}{project.year ? ` · ${project.year}` : ""}</span>
          <StatusLed project={project} dict={dict} />
        </div>
        <ViewTransition name={`project-title-${project.slug}`} share="morph" default="none">
          <h3 className="mt-3 w-fit text-xl font-extrabold tracking-tight">{pick(project.title, locale)}</h3>
        </ViewTransition>
        <p className="mt-2 flex-1 text-[15px] leading-7 text-muted">{pick(project.summary, locale)}</p>
        <span className="mt-5 flex items-center gap-2 text-sm font-bold">
          <span className="link-underline">{dict.projects.read}</span>
          <span aria-hidden="true" className="inline-block text-(--cable-orange) transition-transform group-hover:translate-x-1">→</span>
        </span>
      </div>
    </Link>
  );
}
