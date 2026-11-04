import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ViewTransition } from "react";
import { notFound } from "next/navigation";
import { pick } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { getContent, mediaUrl } from "@/lib/content";
import { fallbackContent } from "@/lib/fallback-content";
import { ProjectCover, Stamp } from "@/components/project-card";

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
      <Link href={`/${locale}/projects`} className="link-underline font-mono text-[13px] text-muted">← {t.back}</Link>

      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-center">
        <div>
          <p className="label">N° {String(index + 1).padStart(2, "0")} — {project.category}{project.year ? ` · ${project.year}` : ""}</p>
          <ViewTransition name={`project-title-${project.slug}`} share="morph" default="none">
            <h1 className="mt-4 w-fit text-[clamp(2.8rem,6.5vw,5rem)] leading-none font-bold">{pick(project.title, locale)}</h1>
          </ViewTransition>
          <p className="mt-6 max-w-[46ch] text-lg text-muted">{pick(project.summary, locale)}</p>
          <div className="mt-7 flex flex-wrap items-center gap-4">
            <Stamp project={project} dict={dict} />
            {project.live_url && <a href={project.live_url} target="_blank" rel="noreferrer" className="btn btn-primary">{t.live} ↗</a>}
            {project.github_url && <a href={project.github_url} target="_blank" rel="noreferrer" className="btn btn-secondary">{t.code} ↗</a>}
          </div>
        </div>
        <ViewTransition name={`project-cover-${project.slug}`} share="morph" default="none">
          <div className="panel relative aspect-[16/10] overflow-hidden rotate-1">
            <ProjectCover project={project} locale={locale} sizes="(min-width: 1024px) 640px, 95vw" priority />
          </div>
        </ViewTransition>
      </div>

      <div className="mt-20 grid gap-12 lg:grid-cols-12">
        <aside className="lg:col-span-4">
          <dl className="lg:sticky lg:top-28">
            <dt className="label">{t.stack}</dt>
            <dd className="mt-3 flex flex-wrap gap-2">
              {project.tech.map(tech => <span key={tech} className="rounded-[3px] border-[1.5px] border-ink bg-sheet px-2.5 py-0.5 font-mono text-[13px] shadow-[2px_2px_0_var(--shade)]">{tech}</span>)}
            </dd>
            {project.year && (
              <div className="mt-6 flex items-baseline gap-2 after:order-1 after:flex-1 after:-translate-y-1 after:border-b-[1.5px] after:border-dotted after:border-muted after:content-['']">
                <dt className="font-mono text-[12px] tracking-wider uppercase">{t.year}</dt>
                <dd className="order-2 font-bold">{project.year}</dd>
              </div>
            )}
          </dl>
        </aside>
        <div className="grid gap-12 lg:col-span-8">
          {story.map((part, partIndex) => (
            <div key={part.title}>
              <p className="note text-3xl">{partIndex + 1}.</p>
              <h2 className="mt-1 text-[clamp(1.7rem,2.6vw,2.3rem)] font-bold">{part.title}</h2>
              <p className="mt-3 text-lg whitespace-pre-line text-muted">{part.body}</p>
            </div>
          ))}
        </div>
      </div>

      {project.gallery.length > 0 && (
        <section className="mt-20" aria-label={t.gallery}>
          <h2 className="label">{t.gallery}</h2>
          <div className="mt-6 grid gap-8 sm:grid-cols-2">
            {project.gallery.map((path, imageIndex) => {
              const src = mediaUrl(path);
              return src ? (
                <div key={path} className="panel relative aspect-[16/10] overflow-hidden" style={{ transform: `rotate(${imageIndex % 2 ? 1 : -1}deg)` }}>
                  <Image src={src} alt={`${pick(project.title, locale)} — ${imageIndex + 1}`} fill sizes="(min-width: 640px) 50vw, 95vw" className="object-cover" />
                </div>
              ) : null;
            })}
          </div>
        </section>
      )}

      {next && (
        <Link href={`/${locale}/projects/${next.slug}`} className="card-lift group panel mt-24 flex items-center justify-between gap-6 p-7">
          <span>
            <span className="label">{t.next}</span>
            <span className="mt-1 block text-3xl font-bold">{pick(next.title, locale)}</span>
          </span>
          <span aria-hidden="true" className="grid h-12 w-12 place-items-center rounded-(--radius) border-[1.5px] border-ink text-xl transition-colors group-hover:bg-ink group-hover:text-sheet">→</span>
        </Link>
      )}
    </article>
  );
}
