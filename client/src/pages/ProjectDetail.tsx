import { ArrowLeft, ArrowUpRight, Github } from "lucide-react";
import { Link, useRoute } from "wouter";
import { motion, useReducedMotion } from "framer-motion";
import { trpc } from "@/lib/trpc";
import { splitList } from "@/lib/profile";
import { easeOutExpo } from "@/lib/motion";
import { Reveal, SiteLayout } from "@/components/SiteLayout";
import { ProjectCover } from "@/components/portfolio/ProjectCover";

export default function ProjectDetail() {
  const [, params] = useRoute("/projects/:slug");
  const reduceMotion = useReducedMotion();
  const { data: project, isLoading, error } = trpc.public.projectBySlug.useQuery({ slug: params?.slug ?? "" }, { enabled: Boolean(params?.slug) });
  const { data: all = [] } = trpc.public.projects.useQuery(undefined, { staleTime: 60_000 });

  if (isLoading)
    return (
      <SiteLayout>
        <main className="container pb-24 pt-32 md:pt-40">
          <div className="skeleton-block h-24 w-2/3" />
          <div className="skeleton-block mt-10 aspect-[16/9] w-full" />
        </main>
      </SiteLayout>
    );

  if (error || !project)
    return (
      <SiteLayout>
        <main className="container pb-24 pt-32 md:pt-40">
          <p className="mono-label text-primary">Erreur 404 — hôte injoignable</p>
          <h1 className="mt-6 font-serif text-5xl md:text-7xl">Ce projet n'existe pas ou n'est plus publié.</h1>
          <Link href="/projects" className="button-primary mt-10">
            <ArrowLeft className="h-4 w-4" /> Retour à l'index
          </Link>
        </main>
      </SiteLayout>
    );

  const index = all.findIndex(item => item.slug === project.slug);
  const next = all.length > 1 ? all[(index + 1) % all.length] : null;
  const technologies = splitList(project.technologies);

  return (
    <SiteLayout>
      <main className="pb-10 pt-28 md:pt-36">
        <div className="container">
          <Link href="/projects" className="mono-label inline-flex items-center gap-2 hover:text-foreground">
            <ArrowLeft className="h-3.5 w-3.5" /> Index des projets
          </Link>
          <Reveal className="mt-10 grid gap-10 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-8">
              <p className="mono-label">
                <span className="text-primary">{index >= 0 ? String(index + 1).padStart(2, "0") : "—"}</span> — {project.category}
              </p>
              <h1 className="mt-5 font-sans font-semibold leading-[.9] tracking-[-.045em]" style={{ fontSize: "clamp(3rem, 10vw, 9rem)" }}>
                {project.title}
              </h1>
            </div>
            <div className="flex flex-wrap gap-3 lg:col-span-4 lg:justify-end">
              {project.liveUrl && (
                <a href={project.liveUrl} target="_blank" rel="noreferrer" className="button-primary">
                  Voir en ligne <ArrowUpRight className="h-4 w-4" />
                </a>
              )}
              {project.githubUrl && (
                <a href={project.githubUrl} target="_blank" rel="noreferrer" className="button-outline">
                  <Github className="h-4 w-4" /> Code source
                </a>
              )}
            </div>
          </Reveal>
        </div>

        <motion.div
          className="container mt-12"
          initial={reduceMotion ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease: easeOutExpo }}
        >
          <div className="aspect-[4/3] w-full overflow-hidden border border-foreground/15 sm:aspect-[16/8]">
            <ProjectCover project={project} size="lg" />
          </div>
        </motion.div>

        <div className="container mt-16 grid gap-12 lg:grid-cols-12">
          <Reveal className="lg:col-span-4">
            <dl className="divide-y divide-foreground/15 border-y border-foreground/15">
              {[
                { label: "Catégorie", value: project.category },
                { label: "Technologies", value: technologies.join(" · ") },
                { label: "Statut", value: /en cours/i.test(project.description) ? "En cours" : "Livré" },
              ].map(item => (
                <div key={item.label} className="grid grid-cols-[7rem_1fr] gap-4 py-4">
                  <dt className="mono-label pt-0.5">{item.label}</dt>
                  <dd className="text-[15px]">{item.value}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
          <Reveal className="lg:col-span-7 lg:col-start-6" delay={0.08}>
            <p className="font-serif text-3xl leading-tight md:text-4xl">{project.shortDescription}</p>
            <p className="mt-8 whitespace-pre-line text-[17px] leading-8 text-muted-foreground">{project.description}</p>
          </Reveal>
        </div>

        {next && next.slug !== project.slug && (
          <Link href={`/projects/${next.slug}`} className="group mt-24 block border-t border-foreground/15">
            <div className="container flex items-end justify-between gap-6 py-12">
              <span>
                <span className="mono-label">Projet suivant</span>
                <span className="mt-3 block font-sans font-semibold leading-none tracking-[-.04em] transition-colors duration-300 group-hover:text-primary" style={{ fontSize: "clamp(2.2rem, 7vw, 6rem)" }}>
                  {next.title}
                </span>
              </span>
              <span className="project-row-arrow mb-2 shrink-0 group-hover:rotate-45 group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground">
                <ArrowUpRight className="h-4 w-4" />
              </span>
            </div>
          </Link>
        )}
      </main>
    </SiteLayout>
  );
}
