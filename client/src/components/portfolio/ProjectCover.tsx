import type { Project } from "@shared/types";
import { splitList } from "@/lib/profile";

// Trois compositions sobres, choisies de façon stable à partir du slug.
const styles = [
  { surface: "bg-primary text-primary-foreground", pattern: "cover-pattern-lines" },
  { surface: "bg-foreground text-background", pattern: "cover-pattern-grid" },
  { surface: "bg-signal text-white", pattern: "cover-pattern-dots" },
];

const pick = (slug: string) => styles[Array.from(slug).reduce((sum, char) => sum + char.charCodeAt(0), 0) % styles.length];

/** Visuel de projet : l'image si elle existe, sinon une couverture typographique générée. */
export function ProjectCover({ project, size = "md" }: { project: Pick<Project, "slug" | "title" | "category" | "technologies" | "imageUrl">; size?: "md" | "lg" }) {
  if (project.imageUrl) {
    return <img src={project.imageUrl} alt={`Aperçu de ${project.title}`} className="h-full w-full object-cover" loading="lazy" />;
  }
  const style = pick(project.slug);
  return (
    <div className={`cover ${style.surface}`} role="img" aria-label={`Couverture du projet ${project.title}`}>
      <div className={`absolute inset-0 -z-10 opacity-[.18] ${style.pattern}`} />
      <div className="flex items-start justify-between font-mono text-[10px] uppercase tracking-[.16em] opacity-80">
        <span>{project.category}</span>
        <span>{project.slug}</span>
      </div>
      <div>
        <p className={`font-serif italic leading-[.9] ${size === "lg" ? "text-[clamp(3.5rem,11vw,9rem)]" : "text-5xl"}`}>{project.title}</p>
        <p className="mt-3 font-mono text-[10px] uppercase tracking-[.16em] opacity-80">{splitList(project.technologies).slice(0, 4).join(" / ")}</p>
      </div>
    </div>
  );
}
