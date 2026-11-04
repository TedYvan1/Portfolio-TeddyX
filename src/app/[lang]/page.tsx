import Link from "next/link";
import { pick } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { getContent, mediaUrl } from "@/lib/content";
import { buildGraph } from "@/lib/graph";
import { NetworkGraph } from "@/components/network-graph";
import { ProjectCard } from "@/components/project-card";
import { SectionHeading } from "@/components/section-heading";
import { ContactForm } from "@/components/contact-form";
import { InView } from "@/components/in-view";

export default async function Home() {
  const [locale, dict, content] = await Promise.all([getLocale(), getDictionary(), getContent()]);
  const { profile, projects, skills, educations, certifications, languages, strengths, principles, labs } = content;
  const graph = buildGraph(content, locale, dict);
  const featured = projects.filter(project => project.featured);
  const cvUrl = mediaUrl(profile.cv_path);

  return (
    <>
      {/* ── Le graphe : l'accueil ─────────────────────────── */}
      {/* Mobile : le texte, puis le graphe dans sa propre zone. Grand écran : le texte en surimpression, en haut à gauche. */}
      <section className="relative overflow-hidden md:h-[calc(100svh-5rem)] md:min-h-[600px]" aria-labelledby="hero-title">
        <div aria-hidden="true" className="dot-grid absolute inset-0 [mask-image:radial-gradient(ellipse_at_60%_50%,black,transparent_75%)]" />

        <div className="relative md:pointer-events-none md:absolute md:inset-x-0 md:top-0 md:z-10">
          <div className="container-site pt-8 md:pt-14">
            <div data-graph-avoid className="max-w-md md:max-w-lg">
              <p className="eyebrow rise">{dict.hero.eyebrow}</p>
              <h1 id="hero-title" className="rise mt-3 text-[clamp(2.4rem,6vw,4.75rem)] leading-[0.98] font-bold tracking-[-0.025em]" style={{ animationDelay: "0.08s" }}>
                {profile.display_name}
              </h1>
              <p className="rise mt-4 text-[clamp(1rem,1.4vw,1.15rem)] leading-relaxed text-muted" style={{ animationDelay: "0.16s" }}>
                {pick(profile.headline, locale)}
              </p>
              <div className="rise pointer-events-auto mt-6 flex flex-wrap gap-3" style={{ animationDelay: "0.24s" }}>
                <Link href={`/${locale}/projects`} className="btn btn-primary">{dict.hero.primary}</Link>
                {cvUrl && <a href={cvUrl} target="_blank" rel="noreferrer" className="btn btn-secondary">{dict.hero.cv} ↓</a>}
              </div>
              <p className="rise mt-6 hidden text-sm text-muted md:block" style={{ animationDelay: "0.4s" }}>
                {dict.graph.hint} · <span className="sr-only">{dict.graph.keyboard}</span>
                <a href="#index" className="pointer-events-auto link-underline text-foreground">{dict.graph.listView} ↓</a>
              </p>
            </div>
          </div>
        </div>

        <div className="relative h-[460px] md:absolute md:inset-0 md:h-auto">
          <NetworkGraph data={graph} t={dict.graph} />
        </div>
      </section>

      {/* ── L'index : tout le contenu, en clair ───────────── */}
      <div id="index" className="scroll-mt-20 border-t border-border">
        {/* Ce que je cherche */}
        {pick(profile.seeking, locale) && (
          <section className="container-site pt-20" aria-labelledby="seeking-title">
            <div className="border-l-2 border-skill py-2 pl-6 sm:pl-10">
              <p className="eyebrow relative flex items-center gap-2">
                <span aria-hidden="true" className="h-2 w-2 rounded-full bg-skill" />
                {dict.seeking.eyebrow} · {pick(profile.availability, locale)}
              </p>
              <h2 id="seeking-title" className="relative mt-4 max-w-3xl text-[clamp(1.75rem,3.6vw,2.75rem)] leading-tight font-bold tracking-[-0.02em]">{dict.seeking.title}</h2>
              <p className="relative mt-4 max-w-2xl text-lg leading-8 text-muted">{pick(profile.seeking, locale)}</p>
              <Link href={`/${locale}#contact`} className="btn btn-primary relative mt-8">{dict.nav.cta}</Link>
            </div>
          </section>
        )}

        {/* Projets */}
        {projects.length > 0 && (
          <section className="container-site py-20" aria-labelledby="projects-title">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <SectionHeading id="projects-title" eyebrow={dict.projects.eyebrow} title={dict.projects.title} subtitle={dict.projects.subtitle} glyph="project" />
              <Link href={`/${locale}/projects`} className="link-underline font-semibold">{dict.projects.all} →</Link>
            </div>
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {(featured.length ? featured : projects).slice(0, 3).map(project => (
                <div key={project.slug}>
                  <ProjectCard project={project} locale={locale} dict={dict} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Profil */}
        <section className="container-site py-20" aria-labelledby="about-title">
          <div className="grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <SectionHeading id="about-title" eyebrow={dict.about.eyebrow} title={dict.about.title} />
              <div>
                <p className="mt-6 text-lg leading-8 text-muted">{pick(profile.bio, locale)}</p>
              </div>
            </div>
            <div className="grid content-start gap-8 lg:col-span-4 lg:col-start-9">
              {strengths.length > 0 && (
                <div className="border-t border-border pt-5">
                  <h3 className="eyebrow">{dict.about.strengths}</h3>
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {strengths.map(item => <li key={pick(item.label, "fr")} className="chip">{pick(item.label, locale)}</li>)}
                  </ul>
                </div>
              )}
              {languages.length > 0 && (
                <div className="border-t border-border pt-5">
                  <h3 className="eyebrow">{dict.about.languages}</h3>
                  <dl className="mt-4 grid gap-2">
                    {languages.map(item => (
                      <div key={pick(item.name, "fr")} className="flex justify-between gap-4 text-[15px]">
                        <dt className="font-semibold">{pick(item.name, locale)}</dt>
                        <dd className="text-muted">{pick(item.level, locale)}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}
            </div>
          </div>
          {principles.length > 0 && (
            <ol className="mt-16 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
              {principles.map((principle, index) => (
                <li key={pick(principle.title, "fr")} className="border-t border-border pt-5">
                  <span className="tag">0{index + 1}</span>
                  <h3 className="mt-3 text-lg font-bold">{pick(principle.title, locale)}</h3>
                  <p className="mt-2 text-[15px] leading-7 text-muted">{pick(principle.body, locale)}</p>
                </li>
              ))}
            </ol>
          )}
        </section>

        {/* Compétences */}
        {skills.length > 0 && (
          <section className="container-site py-20" aria-labelledby="skills-title">
            <SectionHeading id="skills-title" eyebrow={dict.skills.eyebrow} title={dict.skills.title} glyph="skill" />
            <InView className="mt-12 grid grid-cols-[minmax(0,1fr)] gap-x-10 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
              {skills.map((category, categoryIndex) => (
                <div key={pick(category.name, "fr")} className="border-t border-border pt-5">
                  <h3 className="text-lg font-bold">{pick(category.name, locale)}</h3>
                  <ul className="mt-4 flex flex-col gap-3">
                    {category.skills.map((skill, skillIndex) => (
                      <li key={skill.name} className="flex items-center justify-between gap-4 text-[15px]">
                        <span className="min-w-0">{skill.name}</span>
                        <span className="flex shrink-0 items-center gap-2">
                          <span aria-hidden="true" className="flex gap-1">
                            {[1, 2, 3].map(step => (
                              <span key={step} className="h-1.5 w-5 bg-border">
                                {/* Le niveau se remplit à l'arrivée à l'écran, segment par segment. */}
                                {step <= skill.level && <span className="level-fill block h-full bg-skill" style={{ transitionDelay: `${categoryIndex * 90 + skillIndex * 45 + step * 70}ms` }} />}
                              </span>
                            ))}
                          </span>
                          <span className="w-20 text-right text-xs text-muted">{dict.skills.levels[skill.level - 1]}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </InView>
          </section>
        )}

        {/* Parcours */}
        <section id="journey" className="container-site scroll-mt-24 py-20" aria-labelledby="journey-title">
          <SectionHeading id="journey-title" eyebrow={dict.journey.eyebrow} title={dict.journey.title} glyph="journey" />
          <div className="mt-12 grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="border-t border-border pt-5">
              <h3 className="eyebrow">{dict.journey.education}</h3>
              <InView as="ol" className="timeline relative mt-6 grid gap-6 pl-6">
                {educations.map((item, index) => (
                  <li key={pick(item.title, "fr")} className="timeline-item relative" style={{ transitionDelay: `${200 + index * 120}ms` }}>
                    <span aria-hidden="true" className="glyph glyph-journey absolute -left-[30px] top-1.5" />
                    <p className="tag">{pick(item.period, locale)}</p>
                    <p className="mt-1 font-bold">{pick(item.title, locale)}</p>
                    <p className="text-[15px] text-muted">{item.institution}{item.location ? ` · ${item.location}` : ""}</p>
                  </li>
                ))}
              </InView>
            </div>
            <div className="border-t border-border pt-5">
              <h3 className="eyebrow">{dict.journey.certifications}</h3>
              <ul className="mt-6 grid gap-5">
                {certifications.map(item => (
                  <li key={pick(item.title, "fr")} className="flex gap-4">
                    <span className="text-xl leading-none font-bold text-journey">{item.year ?? "—"}</span>
                    <span>
                      {item.url ? (
                        <a href={item.url} target="_blank" rel="noreferrer" className="link-underline font-bold">{pick(item.title, locale)}</a>
                      ) : (
                        <span className="font-bold">{pick(item.title, locale)}</span>
                      )}
                      <span className="block text-[15px] text-muted">{item.issuer} · {pick(item.kind, locale)}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {labs.length > 0 && (
          <section className="container-site py-12" aria-labelledby="labs-title">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <SectionHeading id="labs-title" eyebrow={dict.labs.eyebrow} title={dict.labs.title} subtitle={dict.labs.subtitle} />
              <Link href={`/${locale}/labs`} className="link-underline font-semibold">{dict.labs.title} →</Link>
            </div>
          </section>
        )}

        {/* Contact */}
        <section id="contact" className="container-site scroll-mt-24 py-20" aria-labelledby="contact-title">
          <div className="grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <SectionHeading id="contact-title" eyebrow={dict.contact.eyebrow} title={dict.contact.title} subtitle={dict.contact.subtitle} glyph="contact" />
              <div className="mt-8 grid gap-2 text-[15px]">
                <p className="eyebrow">{dict.contact.direct}</p>
                <a href={`mailto:${profile.email}`} className="link-underline w-fit text-lg font-bold">{profile.email}</a>
                {profile.phone && <a href={`tel:${profile.phone.replace(/\s+/g, "")}`} className="link-underline w-fit text-muted">{profile.phone}</a>}
              </div>
            </div>
            <div className="lg:col-span-7">
              <ContactForm locale={locale} t={dict.contact} />
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
