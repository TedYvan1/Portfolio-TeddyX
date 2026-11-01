import type { Project } from "@shared/types";
import { splitList } from "@/lib/profile";

// Trois compositions sobres, choisies de façon stable à partir du slug.
const styles = [
  { surface: "bg-primary text-primary-foreground", pattern: "cover-pattern-grid" },
  { surface: "bg-secondary text-foreground", pattern: "cover-pattern-lines" },
  { surface: "bg-amber text-background", pattern: "cover-pattern-dots" },
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
      <div className={`absolute inset-0 -z-10 opacity-[.14] ${style.pattern}`} />
      <div className="flex items-start justify-between text-[10px] uppercase tracking-[.14em] opacity-80">
        <span>{project.category}</span>
        <span>v1.0</span>
      </div>
      <div>
        <p className={`font-extrabold leading-[.95] tracking-[-.04em] ${size === "lg" ? "text-[clamp(2.6rem,8vw,7rem)]" : "text-4xl"}`}>
          {project.title}
          <span className="opacity-60">_</span>
        </p>
        <p className="mt-3 text-[10px] uppercase tracking-[.14em] opacity-80">{splitList(project.technologies).slice(0, 4).join(" / ")}</p>
      </div>
    </div>
  );
}
