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
    <div className="relative overflow-hidden">
      <div className="container-site relative py-16 md:py-24">
        <SectionHeading eyebrow={dict.projects.eyebrow} title={dict.projects.title} subtitle={dict.projects.subtitle} glyph="project" />
        {projects.length ? (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map(project => (
              <div key={project.slug}>
                <ProjectCard project={project} locale={locale} dict={dict} />
              </div>
            ))}
          </div>
        ) : (
          <p className="panel mt-12 p-10 text-center text-muted">{dict.projects.empty}</p>
        )}
      </div>
    </div>
  );
}
