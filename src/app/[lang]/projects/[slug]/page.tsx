import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ViewTransition } from "react";
import { notFound } from "next/navigation";
import { pick } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { getContent, mediaUrl } from "@/lib/content";
import { fallbackContent } from "@/lib/fallback-content";
import { ProjectCover, StatusBurst } from "@/components/project-card";

// Avec Cache Components, il faut au moins un paramètre connu au build : les slugs publiés, sinon ceux du contenu de secours.
export async function generateStaticParams() {
  const { projects } = await getContent();
  const slugs = (projects.length ? projects : fallbackContent.projects).map(project => ({ slug: project.slug }));
  return slugs;
}

async function findProject(slug: string) {
  const { projects } = await getContent();
  const index = projects.findIndex(project => project.slug === slug);
  return index === -1 ? null : { project: projects[index], index, next: projects.length > 1 ? projects[(index + 1) % projects.length] : null };
}

export async function generateMetadata({ params }: PageProps<"/[lang]/projects/[slug]">): Promise<Metadata> {
  const [{ slug }, locale] = await Promise.all([params, getLocale()]);
  const found = await findProject(slug);
  if (!found) return {};
  return { title: pick(found.project.title, locale), description: pick(found.project.summary, locale), alternates: { canonical: `/${locale}/projects/${slug}` } };
}

/** Page projet : l'album ouvert. La couverture, puis l'histoire racontée case par case. */
export default async function ProjectPage({ params }: PageProps<"/[lang]/projects/[slug]">) {
  const [{ slug }, locale, dict] = await Promise.all([params, getLocale(), getDictionary()]);
  const found = await findProject(slug);
  if (!found) notFound();
  const { project, index, next } = found;
  const t = dict.project;

  const story = [
    { title: t.context, body: pick(project.context, locale) },
    { title: t.role, body: pick(project.my_role, locale) },
    { title: t.challenges, body: pick(project.challenges, locale) },
    { title: t.solution, body: pick(project.solution, locale) },
    { title: t.results, body: pick(project.results, locale) },
  ].filter(part => part.body);

  return (
    <article className="container-site py-12 md:py-16">
      <Link href={`/${locale}/projects`} className="link-underline font-bold">← {t.back}</Link>

      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-center">
        <div>
          <p className="caption -rotate-1">{dict.comic.issueShort} {index + 1} · {project.category}{project.year ? ` · ${project.year}` : ""}</p>
          <ViewTransition name={`project-title-${project.slug}`} share="morph" default="none">
            <h1 className="pop-title mt-5 w-fit text-[clamp(3rem,7vw,5.6rem)]">{pick(project.title, locale)}</h1>
          </ViewTransition>
          <p className="mt-5 max-w-[46ch] text-lg text-muted">{pick(project.summary, locale)}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            {project.live_url && <a href={project.live_url} target="_blank" rel="noreferrer" className="btn btn-primary">{t.live} ↗</a>}
            {project.github_url && <a href={project.github_url} target="_blank" rel="noreferrer" className="btn btn-secondary">{t.code} ↗</a>}
          </div>
        </div>
        <div className="relative">
          <ViewTransition name={`project-cover-${project.slug}`} share="morph" default="none">
            <div className="panel relative aspect-[4/3] overflow-hidden rotate-1">
              <ProjectCover project={project} locale={locale} issue={dict.comic.issueShort} index={index} sizes="(min-width: 1024px) 640px, 95vw" priority />
            </div>
          </ViewTransition>
          <div className="absolute -top-6 -right-3 z-10"><StatusBurst project={project} dict={dict} size={104} /></div>
        </div>
      </div>

      <div className="mt-16 flex flex-wrap items-center gap-2">
        <span className="display mr-1 text-2xl">{dict.comic.with} :</span>
        {project.tech.map(tech => <span key={tech} className="chip shadow-[2px_2px_0_var(--shadow)]">{tech}</span>)}
      </div>

      {/* L'histoire, case par case */}
      <div className="mt-10 grid gap-5 md:grid-cols-2">
        {story.map((part, partIndex) => (
          <div key={part.title} className={`panel p-6 ${partIndex === 0 && story.length % 2 ? "md:col-span-2" : ""}`} style={{ rotate: `${partIndex % 2 ? 0.5 : -0.5}deg` }}>
            <p className="caption">{partIndex + 1} · {part.title}</p>
            <p className="mt-4 text-lg whitespace-pre-line">{part.body}</p>
          </div>
        ))}
      </div>

      {project.gallery.length > 0 && (
        <section className="mt-16" aria-label={t.gallery}>
          <h2 className="display text-3xl">{t.gallery}</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            {project.gallery.map((path, imageIndex) => {
              const src = mediaUrl(path);
              return src ? (
                <div key={path} className="panel relative aspect-[16/10] overflow-hidden" style={{ rotate: `${imageIndex % 2 ? 1 : -1}deg` }}>
                  <Image src={src} alt={`${pick(project.title, locale)} — ${imageIndex + 1}`} fill sizes="(min-width: 640px) 50vw, 95vw" className="object-cover" />
                </div>
              ) : null;
            })}
          </div>
        </section>
      )}

      {next && (
        <Link href={`/${locale}/projects/${next.slug}`} data-sfx className="cover-card panel group mt-20 flex items-center justify-between gap-6 bg-yellow p-6 text-[#141210]">
          <span>
            <span className="text-[13px] font-bold tracking-wider uppercase">{dict.comic.next}… · {t.next}</span>
            <span className="display mt-1 block text-4xl">{pick(next.title, locale)}</span>
          </span>
          <span aria-hidden="true" className="display text-5xl transition-transform group-hover:translate-x-2">→</span>
        </Link>
      )}
    </article>
  );
}
