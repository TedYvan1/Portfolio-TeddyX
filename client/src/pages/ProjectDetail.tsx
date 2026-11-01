import { ArrowLeft, ArrowUpRight, Github } from "lucide-react";
import { Link, useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { splitList } from "@/lib/profile";
import { Reveal, SiteLayout } from "@/components/SiteLayout";
import { ProjectCover } from "@/components/portfolio/ProjectCover";

export default function ProjectDetail() {
  const [, params] = useRoute("/projects/:slug");
  const slug = params?.slug ?? "";
  const { data: project, isLoading, error } = trpc.public.projectBySlug.useQuery({ slug }, { enabled: Boolean(slug) });
  const { data: all = [] } = trpc.public.projects.useQuery(undefined, { staleTime: 60_000 });

  if (isLoading)
    return (
      <SiteLayout>
        <main className="container pb-24 pt-12 md:pt-16">
          <div className="skeleton-block h-12 w-2/3" />
          <div className="skeleton-block mt-8 aspect-[16/8] w-full" />
        </main>
      </SiteLayout>
    );

  if (error || !project)
    return (
      <SiteLayout>
        <main className="container pb-24 pt-12 md:pt-16">
          <p className="cmd-line text-muted-foreground">
            <span className="tok-prompt">ted@abidjan</span>:<span className="tok-path">~/projets</span>$ cd {slug}
          </p>
          <p className="mt-2 font-mono text-destructive">bash : cd : {slug} : aucun projet publié de ce nom</p>
          <Link href="/projects" className="button-primary mt-8">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> cd ~/projets
          </Link>
        </main>
      </SiteLayout>
    );

  const index = all.findIndex(item => item.slug === project.slug);
  const next = all.length > 1 ? all[(index + 1) % all.length] : null;
  const technologies = splitList(project.technologies);
  const inProgress = /en cours/i.test(project.description);

  return (
    <SiteLayout>
      <main className="container pb-10 pt-12 md:pt-16">
        <Link href="/projects" className="link-mono inline-flex items-center gap-2 text-sm">
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" /> cd ..
        </Link>
        <Reveal className="mt-8">
          <p className="cmd-line text-muted-foreground">
            <span className="tok-prompt">ted@abidjan</span>:<span className="tok-path">~/projets/{project.slug}</span>$ cat README.md
          </p>
          <h1 className="hero-name mt-4">
            <span className="text-primary"># </span>
            {project.title}
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-muted-foreground md:text-xl">{project.shortDescription}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            {project.liveUrl && (
              <a href={project.liveUrl} target="_blank" rel="noreferrer" className="button-primary">
                ./voir-en-ligne <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </a>
            )}
            {project.githubUrl && (
              <a href={project.githubUrl} target="_blank" rel="noreferrer" className="button-outline">
                <Github className="h-4 w-4" aria-hidden="true" /> code source
              </a>
            )}
          </div>
        </Reveal>

        <Reveal className="pane mt-10" delay={0.05}>
          <div className="pane-bar">
            <span className="pane-dots" aria-hidden="true"><i /><i /><i /></span>
            <span>apercu.png</span>
          </div>
          <div className="aspect-[4/3] sm:aspect-[16/7]">
            <ProjectCover project={project} size="lg" />
          </div>
        </Reveal>

        <div className="mt-10 grid gap-6 lg:grid-cols-12">
          <Reveal className="pane lg:col-span-4">
            <div className="pane-bar">package.json</div>
            <dl className="pane-body space-y-2">
              {[
                ["catégorie", project.category],
                ["statut", inProgress ? "en cours" : "livré"],
                ["stack", technologies.join(", ")],
              ].map(([key, value]) => (
                <div key={key}>
                  <dt className="inline text-cyan">"{key}"</dt>: <dd className="inline tok-str">"{value}"</dd>
                </div>
              ))}
            </dl>
          </Reveal>
          <Reveal className="lg:col-span-8" delay={0.05}>
            <h2 className="font-mono text-lg font-bold">
              <span className="text-primary">## </span>Le projet
            </h2>
            <p className="mt-4 whitespace-pre-line text-[17px] leading-8 text-muted-foreground">{project.description}</p>
          </Reveal>
        </div>

        {next && next.slug !== project.slug && (
          <Link href={`/projects/${next.slug}`} className="ls-row mt-16 grid-cols-[1fr_auto] md:grid-cols-[1fr_auto]">
            <span className="min-w-0">
              <span className="mono-label block">cd ../{next.slug} — projet suivant</span>
              <span className="ls-name mt-1 block">{next.title}/</span>
            </span>
            <span className="ls-arrow" aria-hidden="true">
              <ArrowUpRight className="h-4 w-4" />
            </span>
          </Link>
        )}
      </main>
    </SiteLayout>
  );
}
