import Link from "next/link";
import { pick } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { getContent, mediaUrl } from "@/lib/content";
import { SketchMap, type MapNode } from "@/components/sketch-map";
import { ProjectCard } from "@/components/project-card";
import { SectionHeading } from "@/components/section-heading";
import { ContactForm } from "@/components/contact-form";
import { InView } from "@/components/in-view";

export default async function Home() {
  const [locale, dict, content] = await Promise.all([getLocale(), getDictionary(), getContent()]);
  const { profile, projects, skills, educations, certifications, languages, strengths, principles, labs } = content;
  const featured = projects.filter(project => project.featured);
  const cvUrl = mediaUrl(profile.cv_path);
  const p = dict.panel.ports;

  // Un nœud par partie du site, dans l'ordre des sections de la page.
  const nodes: MapNode[] = [
    { id: "projects", label: p.projects, href: `/${locale}#projects`, active: projects.length > 0 },
    { id: "skills", label: p.skills, href: `/${locale}#skills`, active: skills.length > 0 },
    { id: "journey", label: p.journey, href: `/${locale}#journey`, active: educations.length > 0 },
    { id: "labs", label: p.labs, href: `/${locale}/labs`, active: labs.length > 0 },
    { id: "about", label: p.about, href: `/${locale}#about`, active: true },
    { id: "contact", label: p.contact, href: `/${locale}#contact`, active: true },
  ];

  // Le nom : le prénom en encre, le nom de famille sous le surligneur.
  const nameParts = profile.display_name.split(" ");
  const lastName = nameParts.pop();
  const ruler = [
    { label: dict.stats.degreesLabel.split(" · ")[0], value: dict.stats.degrees, small: "" },
    { label: dict.stats.projectsLabel, value: String(projects.length), small: "" },
    { label: dict.stats.certificationsLabel, value: String(certifications.length), small: "" },
  ];

  return (
    <>
      {/* ── Accueil : la page de garde du carnet, et le schéma réseau ───────── */}
      <section className="container-site grid min-h-[calc(100svh-72px)] items-center gap-12 py-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-16" aria-labelledby="hero-title">
        <div>
          <p className="rise inline-block border-b-[1.5px] border-ink pb-2.5 font-mono text-[12px] text-muted">{dict.hero.eyebrow} · {pick(profile.availability, locale)}</p>
          <h1 id="hero-title" className="rise mt-6 text-[clamp(2.9rem,6.4vw,5.6rem)] leading-[1.02] font-bold" style={{ animationDelay: "80ms" }}>
            {nameParts.join(" ")} <mark className="hl hl-load">{lastName}</mark>
          </h1>
          <p className="rise mt-6 max-w-[46ch] text-[clamp(1.05rem,1.4vw,1.2rem)] text-muted" style={{ animationDelay: "200ms" }}>{pick(profile.headline, locale)}</p>

          {/* Règle graduée : les chiffres du carnet */}
          <dl className="rise mt-8 flex max-w-[520px] border-t-2 border-ink" style={{ animationDelay: "300ms" }}>
            {ruler.map(item => (
              <div key={item.label} className="relative mr-4 flex-1 border-r border-border pt-3 pr-4 last:mr-0 last:border-r-0 before:absolute before:-top-0.5 before:left-0 before:h-2.5 before:w-px before:bg-ink">
                <dt className="font-mono text-[11px] tracking-[0.08em] text-muted uppercase">{item.label}</dt>
                <dd className="text-[clamp(1.9rem,3vw,2.8rem)] leading-tight font-bold">{item.value}</dd>
              </div>
            ))}
          </dl>

          <div className="rise mt-9 flex flex-wrap gap-3" style={{ animationDelay: "400ms" }}>
            <Link href={`/${locale}/projects`} className="btn btn-primary">{dict.hero.primary} →</Link>
            {cvUrl && <a href={cvUrl} target="_blank" rel="noreferrer" className="btn btn-secondary">{dict.hero.cv} ↓</a>}
          </div>

          {/* Note manuscrite dans la marge, avec sa flèche griffonnée vers le schéma */}
          <p className="note rise mt-7 flex origin-left -rotate-3 items-end gap-1 text-[clamp(1.5rem,2vw,1.9rem)]" style={{ animationDelay: "1.4s" }}>
            {dict.panel.hint}<span aria-hidden="true" className="lg:hidden"> ↓</span>
            <svg width="96" height="52" viewBox="0 0 110 60" aria-hidden="true" className="mb-2 hidden flex-none overflow-visible lg:block">
              <path d="M4 44 C 30 58, 70 52, 98 18" pathLength={1} className="ink" strokeWidth="2.6" style={{ ["--d" as string]: "1.9s" }} />
              <path d="M84 16 L99 16 L96 31" pathLength={1} className="ink" strokeWidth="2.6" style={{ ["--d" as string]: "2.5s", ["--dur" as string]: "260ms" }} />
            </svg>
          </p>
        </div>

        <div className="rise mx-auto w-full max-w-[600px]" style={{ animationDelay: "250ms" }}>
          <SketchMap name={nameParts[0] ?? profile.display_name} nodes={nodes} t={dict.panel} />
        </div>
      </section>

      {/* ── Ce que je cherche : une fiche épinglée ───────── */}
      {pick(profile.seeking, locale) && (
        <section className="container-site pt-10" aria-labelledby="seeking-title">
          <div className="panel relative grid gap-5 p-6 sm:p-10 md:grid-cols-[1fr_auto] md:items-end">
            <span aria-hidden="true" className="scotch" />
            <div>
              <p className="flex items-center gap-2 font-mono text-[12px] text-muted"><b aria-hidden="true" className="avail-dot" />{dict.seeking.eyebrow} · {pick(profile.availability, locale)}</p>
              <h2 id="seeking-title" className="mt-3 border-l-[6px] border-hl pl-5 text-[clamp(1.6rem,3vw,2.4rem)] leading-tight font-bold text-balance">{dict.seeking.title}</h2>
              <p className="mt-4 max-w-2xl text-muted">{pick(profile.seeking, locale)}</p>
            </div>
            <Link href={`/${locale}#contact`} className="btn btn-primary w-fit">{dict.nav.cta}</Link>
          </div>
        </section>
      )}

      {/* ── 01 Projets ───────────────────────────── */}
      {projects.length > 0 && (
        <section id="projects" className="container-site scroll-mt-24 pt-24 md:pt-36" aria-labelledby="projects-title">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading id="projects-title" num="01" highlight={dict.projects.highlight} eyebrow={dict.projects.eyebrow} title={dict.projects.title} subtitle={dict.projects.subtitle} />
            <Link href={`/${locale}/projects`} className="link-underline font-mono text-[13px]">{dict.projects.all} →</Link>
          </div>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {(featured.length ? featured : projects).slice(0, 3).map((project, index) => (
              <ProjectCard key={project.slug} project={project} locale={locale} dict={dict} index={index} />
            ))}
          </div>
        </section>
      )}

      {/* ── 02 Compétences : des cases cochées au stylo ───────────── */}
      {skills.length > 0 && (
        <section id="skills" className="container-site scroll-mt-24 pt-24 md:pt-36" aria-labelledby="skills-title">
          <SectionHeading id="skills-title" num="02" highlight={dict.skills.highlight} eyebrow={dict.skills.eyebrow} title={dict.skills.title} />
          <p className="mt-5 flex flex-wrap gap-x-6 gap-y-1 font-mono text-[12px] text-muted" aria-hidden="true">
            {dict.skills.levels.map((level, index) => <span key={level}>{"☑".repeat(index + 1)}{"☐".repeat(2 - index)} {level}</span>)}
          </p>
          <InView className="mt-10 grid grid-cols-[minmax(0,1fr)] gap-6 md:grid-cols-2 lg:grid-cols-3">
            {skills.map((category, categoryIndex) => (
              <div key={pick(category.name, "fr")} className="panel p-5">
                <h3 className="flex items-baseline justify-between gap-3 border-b-[1.5px] border-ink pb-2 text-xl font-bold">
                  {pick(category.name, locale)}
                  <span className="font-mono text-[11px] font-normal text-muted">{String(category.skills.length).padStart(2, "0")}</span>
                </h3>
                <ul className="mt-3">
                  {category.skills.map((skill, skillIndex) => (
                    <li key={skill.name} className="flex items-center justify-between gap-4 border-b border-dashed border-border py-2 last:border-b-0">
                      <span className="min-w-0 text-[15px]">{skill.name}</span>
                      <span className="flex shrink-0 gap-1">
                        <span className="sr-only">{dict.skills.levels[skill.level - 1]}</span>
                        {[1, 2, 3].map(step => (
                          <svg key={step} width="18" height="18" viewBox="0 0 20 20" aria-hidden="true">
                            <path d="M3 3.5 L16.5 3 L17 16.5 L3.5 17 Z" fill="none" stroke="var(--ink)" strokeWidth="1.5" strokeLinejoin="round" />
                            {step <= skill.level && (
                              // La coche se trace quand la fiche arrive à l'écran, case après case.
                              <path d="M5.5 10.5 L9 14 L18 2" pathLength={1} fill="none" stroke="var(--hl)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" className="check-mark" style={{ transitionDelay: `${categoryIndex * 120 + skillIndex * 70 + step * 110}ms` }} />
                            )}
                          </svg>
                        ))}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </InView>
        </section>
      )}

      {/* ── 03 Parcours : une marge qui se trace, des fiches scotchées ───────── */}
      <section id="journey" className="container-site scroll-mt-24 pt-24 md:pt-36" aria-labelledby="journey-title">
        <SectionHeading id="journey-title" num="03" highlight={dict.journey.highlight} eyebrow={dict.journey.eyebrow} title={dict.journey.title} />
        <div className="mt-12 grid gap-14 lg:grid-cols-2 lg:gap-16">
          <div>
            <h3 className="label">{dict.journey.education}</h3>
            <InView as="ol" className="relative mt-6 grid gap-8 pl-9">
              <span aria-hidden="true" className="margin-line absolute top-1 bottom-1 left-[7px] w-[2px] bg-hl" />
              {educations.map((item, index) => (
                <li key={pick(item.title, "fr")} className="step-in relative" style={{ transitionDelay: `${250 + index * 160}ms` }}>
                  <span aria-hidden="true" className="absolute top-1.5 -left-[35px] h-[15px] w-[15px] rotate-45 border-[1.5px] border-ink bg-sheet" />
                  <p className="tag">{pick(item.period, locale)}</p>
                  <p className="mt-0.5 text-xl leading-snug font-bold">{pick(item.title, locale)}</p>
                  <p className="text-[15px] text-muted">{item.institution}{item.location ? ` · ${item.location}` : ""}</p>
                </li>
              ))}
            </InView>
          </div>
          <div>
            <h3 className="label">{dict.journey.certifications}</h3>
            <ul className="mt-8 grid gap-x-6 gap-y-9 sm:grid-cols-2">
              {certifications.map((item, index) => (
                <li key={pick(item.title, "fr")} className="pinned panel relative p-4 pt-5" style={{ transform: `rotate(${[1.4, -1.6, 0.8, -1][index % 4]}deg)` }}>
                  <span aria-hidden="true" className="scotch" />
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-2xl leading-none font-bold">{item.year ?? "—"}</span>
                    <span className="stamp text-[10px]">{pick(item.kind, locale)}</span>
                  </div>
                  {item.url ? (
                    <a href={item.url} target="_blank" rel="noreferrer" className="link-underline mt-3 block leading-snug font-bold">{pick(item.title, locale)}</a>
                  ) : (
                    <p className="mt-3 leading-snug font-bold">{pick(item.title, locale)}</p>
                  )}
                  <p className="mt-1 font-mono text-[12px] text-muted">{item.issuer}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── 04 Labs ───────────────────────────── */}
      {labs.length > 0 && (
        <section className="container-site pt-24" aria-labelledby="labs-title">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading id="labs-title" num="04" highlight={dict.labs.highlight} eyebrow={dict.labs.eyebrow} title={dict.labs.title} subtitle={dict.labs.subtitle} />
            <Link href={`/${locale}/labs`} className="link-underline font-mono text-[13px]">{dict.labs.title} →</Link>
          </div>
        </section>
      )}

      {/* ── 05 Profil ───────────────────────────── */}
      <section id="about" className="container-site scroll-mt-24 pt-24 md:pt-36" aria-labelledby="about-title">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
          <div>
            <SectionHeading id="about-title" num="05" highlight={dict.about.highlight} eyebrow={dict.about.eyebrow} title={dict.about.title} />
            <p className="mt-6 text-muted">{pick(profile.bio, locale)}</p>
          </div>
          <div className="grid content-start gap-8">
            {strengths.length > 0 && (
              <div>
                <h3 className="label">{dict.about.strengths}</h3>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {strengths.map(item => <li key={pick(item.label, "fr")} className="rounded-[3px] border-[1.5px] border-ink bg-sheet px-3 py-1 text-[15px] shadow-[2px_2px_0_var(--shade)]">{pick(item.label, locale)}</li>)}
                </ul>
              </div>
            )}
            {languages.length > 0 && (
              <dl>
                <h3 className="label">{dict.about.languages}</h3>
                {languages.map(item => (
                  // Ligne de pointillés entre la langue et son niveau, comme dans une table des matières
                  <div key={pick(item.name, "fr")} className="flex items-baseline gap-2 py-2.5 text-[15px] after:order-1 after:flex-1 after:-translate-y-1 after:border-b-[1.5px] after:border-dotted after:border-muted after:content-['']">
                    <dt className="font-mono text-[12px] tracking-wider uppercase">{pick(item.name, locale)}</dt>
                    <dd className="order-2">{pick(item.level, locale)}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        </div>
        {principles.length > 0 && (
          <ol className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {principles.map((principle, index) => (
              <li key={pick(principle.title, "fr")} className="border-t-2 border-ink pt-4">
                <span className="note text-3xl">{index + 1}.</span>
                <h3 className="mt-1 text-xl font-bold">{pick(principle.title, locale)}</h3>
                <p className="mt-1.5 text-[15px] text-muted">{pick(principle.body, locale)}</p>
              </li>
            ))}
          </ol>
        )}
      </section>

      {/* ── 06 Contact ───────────────────────────── */}
      <section id="contact" className="container-site scroll-mt-24 pt-24 md:pt-36" aria-labelledby="contact-title">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionHeading id="contact-title" num="06" highlight={dict.contact.highlight} eyebrow={dict.contact.eyebrow} title={dict.contact.title} subtitle={dict.contact.subtitle} />
            <dl className="mt-8 grid gap-1">
              <dt className="label">{dict.contact.direct}</dt>
              <dd><a href={`mailto:${profile.email}`} className="link-underline text-xl font-bold break-all">{profile.email}</a></dd>
              {profile.phone && <dd><a href={`tel:${profile.phone.replace(/\s+/g, "")}`} className="link-underline font-mono text-sm text-muted">{profile.phone}</a></dd>}
            </dl>
          </div>
          <div className="lg:col-span-7">
            <ContactForm locale={locale} t={dict.contact} />
          </div>
        </div>
      </section>
    </>
  );
}
