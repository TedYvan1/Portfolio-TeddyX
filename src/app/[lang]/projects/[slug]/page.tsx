import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ViewTransition } from "react";
import { notFound } from "next/navigation";
import { pick } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { getContent, mediaUrl } from "@/lib/content";
import { fallbackContent } from "@/lib/fallback-content";
import { ProjectCover, StatusLed, modelRef } from "@/components/project-card";

// Avec Cache Components, il faut au moins un paramètre connu au build : les slugs publiés, sinon ceux du contenu de secours.
export async function generateStaticParams() {
  const { projects } = await getContent();
  const slugs = (projects.length ? projects : fallbackContent.projects).map(project => ({ slug: project.slug }));
  return slugs;
}

async function findProject(slug: string) {
  const { projects } = await getContent();
  const index = projects.findIndex(project => project.slug === slug);
  return index === -1 ? null : { project: projects[index], next: projects.length > 1 ? projects[(index + 1) % projects.length] : null };
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
  const { project, next } = found;
  const t = dict.project;

  const story = [
    { title: t.context, body: pick(project.context, locale) },
    { title: t.role, body: pick(project.my_role, locale) },
    { title: t.challenges, body: pick(project.challenges, locale) },
    { title: t.solution, body: pick(project.solution, locale) },
    { title: t.results, body: pick(project.results, locale) },
  ].filter(part => part.body);

  return (
    <article className="container-site py-12 md:py-20">
      <Link href={`/${locale}/projects`} className="link-underline font-mono text-sm text-muted">← {t.back}</Link>

      <div className="mt-8 max-w-4xl">
        <p className="tape"><span className="tape-num">{modelRef(project)}</span>{project.category}{project.year ? ` · ${project.year}` : ""}</p>
        <ViewTransition name={`project-title-${project.slug}`} share="morph" default="none">
          <h1 className="mt-5 w-fit text-[clamp(2.6rem,7vw,5rem)] leading-[0.98] font-extrabold tracking-[-0.04em]">{pick(project.title, locale)}</h1>
        </ViewTransition>
        <p className="mt-6 text-xl leading-relaxed text-muted">{pick(project.summary, locale)}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          {project.live_url && <a href={project.live_url} target="_blank" rel="noreferrer" className="btn btn-primary">{t.live} ↗</a>}
          {project.github_url && <a href={project.github_url} target="_blank" rel="noreferrer" className="btn btn-secondary">{t.code} ↗</a>}
        </div>
      </div>

      {/* La couverture, montée dans un châssis vissé */}
      <div className="mt-12 rounded-[4px] bg-rack p-2 sm:p-3">
        <div aria-hidden="true" className="flex justify-between px-1 pb-2"><span className="screw" /><span className="screw" /></div>
        <ViewTransition name={`project-cover-${project.slug}`} share="morph" default="none">
          <div className="relative aspect-[16/9] overflow-hidden rounded-[2px]">
            <ProjectCover project={project} locale={locale} sizes="(min-width: 1240px) 1200px, 95vw" priority />
          </div>
        </ViewTransition>
        <div aria-hidden="true" className="flex justify-between px-1 pt-2"><span className="screw" /><span className="screw" /></div>
      </div>

      <div className="mt-14 grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <dl className="panel grid gap-0 lg:sticky lg:top-24">
            <div className="flex items-center justify-between gap-4 border-b border-border p-5">
              <dt className="eyebrow">{t.status}</dt>
              <dd><StatusLed project={project} dict={dict} /></dd>
            </div>
            {project.year && (
              <div className="flex items-center justify-between gap-4 border-b border-border p-5">
                <dt className="eyebrow">{t.year}</dt>
                <dd className="font-mono font-medium">{project.year}</dd>
              </div>
            )}
            <div className="p-5">
              <dt className="eyebrow">{t.stack}</dt>
              <dd className="mt-3 flex flex-wrap gap-2">
                {project.tech.map(tech => <span key={tech} className="tape text-[0.75rem]">{tech}</span>)}
              </dd>
            </div>
          </dl>
        </div>
        <div className="grid gap-10 lg:col-span-8">
          {story.map((part, index) => (
            <div key={part.title} className="grid gap-3 sm:grid-cols-[3rem_1fr]">
              <span className="font-mono text-sm text-muted sm:pt-2">{String(index + 1).padStart(2, "0")}</span>
              <div>
                <h2 className="text-2xl font-extrabold tracking-tight">{part.title}</h2>
                <p className="mt-3 text-lg leading-8 whitespace-pre-line text-muted">{part.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {project.gallery.length > 0 && (
        <section className="mt-16" aria-label={t.gallery}>
          <h2 className="text-2xl font-extrabold tracking-tight">{t.gallery}</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {project.gallery.map((path, index) => {
              const src = mediaUrl(path);
              return src ? (
                <div key={path} className="panel relative aspect-[16/10] overflow-hidden">
                  <Image src={src} alt={`${pick(project.title, locale)} — ${index + 1}`} fill sizes="(min-width: 640px) 50vw, 95vw" className="object-cover" />
                </div>
              ) : null;
            })}
          </div>
        </section>
      )}

      {next && (
        <Link href={`/${locale}/projects/${next.slug}`} className="module group panel mt-20 flex items-center justify-between gap-6 p-8">
          <span>
            <span className="eyebrow">{t.next}</span>
            <span className="mt-2 block text-3xl font-extrabold tracking-tight">{pick(next.title, locale)}</span>
          </span>
          <span aria-hidden="true" className="text-3xl text-(--cable-orange) transition-transform group-hover:translate-x-2">→</span>
        </Link>
      )}
    </article>
  );
}
