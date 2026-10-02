import { ArrowLeft, ArrowUpRight, CalendarDays, Github, Layers3, ShieldCheck } from "lucide-react";
import { Link, useRoute } from "wouter";
import { motion } from "framer-motion";
import { trpc } from "@/lib/trpc";
import { SiteLayout, ScrollReveal } from "@/components/SiteLayout";
import { Aurora } from "@/components/effects/Aurora";

export default function ProjectDetail() {
  const [, params] = useRoute("/projects/:slug");
  const { data: project, isLoading, error } = trpc.public.projectBySlug.useQuery({ slug: params?.slug ?? "" }, { enabled: Boolean(params?.slug) });
  if (isLoading)
    return (
      <SiteLayout>
        <main className="section-shell">
          <div className="container">
            <div className="skeleton-detail" />
          </div>
        </main>
      </SiteLayout>
    );
  if (error || !project)
    return (
      <SiteLayout>
        <main className="section-shell">
          <div className="container empty-state">
            <p>Ce projet n'existe pas ou n'est plus publié.</p>
            <Link href="/projects" className="button-primary mt-5">
              Retour aux projets
            </Link>
          </div>
        </main>
      </SiteLayout>
    );
  return (
    <SiteLayout>
      <main className="section-shell relative overflow-hidden pt-14 md:pt-20">
        <Aurora className="opacity-20" />
        <div className="container relative max-w-5xl">
          <Link href="/projects" className="back-link">
            <ArrowLeft className="h-4 w-4" /> Tous les projets
          </Link>
          <ScrollReveal>
            <div className="mt-10 grid gap-12 lg:grid-cols-[1.1fr_.9fr] lg:items-end">
              <div>
                <span className="eyebrow">{project.category} / Étude de cas</span>
                <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight md:text-6xl">{project.title}</h1>
                <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">{project.shortDescription}</p>
                <div className="mt-7 flex flex-wrap gap-3">
                  {project.githubUrl && (
                    <a href={project.githubUrl} target="_blank" rel="noreferrer" className="button-outline">
                      <Github className="h-4 w-4" /> GitHub <ArrowUpRight className="h-3.5 w-3.5" />
                    </a>
                  )}
                  {project.liveUrl && (
                    <a href={project.liveUrl} target="_blank" rel="noreferrer" className="button-primary">
                      Voir la démo <ArrowUpRight className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </div>
              <div className="detail-meta">
                <div>
                  <CalendarDays className="h-4 w-4 text-primary" />
                  <span>
                    <small>Date</small>
                    <strong>{new Date(project.createdAt).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}</strong>
                  </span>
                </div>
                <div>
                  <Layers3 className="h-4 w-4 text-primary" />
                  <span>
                    <small>Stack</small>
                    <strong>{project.technologies.split(",").slice(0, 2).join(" · ")}</strong>
                  </span>
                </div>
              </div>
            </div>
          </ScrollReveal>
          <motion.div className="detail-hero mt-14" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}>
            {project.imageUrl ? <img src={project.imageUrl} alt={`Aperçu de ${project.title}`} /> : <div className="project-image-fallback"><ShieldCheck /></div>}
          </motion.div>
          <div className="prose-grid mt-14">
            <article>
              <p className="eyebrow">Le projet</p>
              <h2 className="mt-3 font-display text-2xl font-semibold">Contexte & intention</h2>
              <p className="mt-5 whitespace-pre-line text-base leading-8 text-muted-foreground">{project.description}</p>
            </article>
            <aside>
              <p className="eyebrow">Technologies</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {project.technologies.split(",").map(tag => (
                  <span className="tag tag-large" key={tag}>
                    {tag.trim()}
                  </span>
                ))}
              </div>
            </aside>
          </div>
        </div>
      </main>
    </SiteLayout>
  );
}
