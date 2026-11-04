import type { Metadata } from "next";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { getContent } from "@/lib/content";
import { ProjectCard } from "@/components/project-card";
import { SectionHeading } from "@/components/section-heading";

export async function generateMetadata(): Promise<Metadata> {
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);
  return { title: dict.meta.projectsTitle, description: dict.projects.subtitle, alternates: { canonical: `/${locale}/projects` } };
}

export default async function ProjectsPage() {
  const [locale, dict, { projects }] = await Promise.all([getLocale(), getDictionary(), getContent()]);
  return (
    <div className="container-site py-16 md:py-24">
      <SectionHeading as="h1" port="01" eyebrow={dict.projects.eyebrow} title={dict.projects.title} subtitle={dict.projects.subtitle} />
      {projects.length ? (
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map(project => <ProjectCard key={project.slug} project={project} locale={locale} dict={dict} />)}
        </div>
      ) : (
        <p className="panel mt-12 p-10 text-center text-muted">{dict.projects.empty}</p>
      )}
    </div>
  );
}
