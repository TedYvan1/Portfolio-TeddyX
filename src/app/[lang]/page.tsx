import Link from "next/link";
import { pick } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { getContent, mediaUrl } from "@/lib/content";
import { PatchPanel, type Port } from "@/components/patch-panel";
import { ProjectCard } from "@/components/project-card";
import { SectionHeading } from "@/components/section-heading";
import { ContactForm } from "@/components/contact-form";
import { InView } from "@/components/in-view";

const CABLES = ["var(--cable-orange)", "var(--cable-blue)", "var(--cable-green)", "var(--cable-brown)"];

export default async function Home() {
  const [locale, dict, content] = await Promise.all([getLocale(), getDictionary(), getContent()]);
  const { profile, projects, skills, educations, certifications, languages, strengths, principles, labs } = content;
  const featured = projects.filter(project => project.featured);
  const cvUrl = mediaUrl(profile.cv_path);
  const p = dict.panel.ports;

  // Un port par partie du site, dans l'ordre des sections de la page.
  const ports: Port[] = [
    { id: "projects", label: p.projects, href: `/${locale}#projects`, plugged: projects.length > 0 },
    { id: "skills", label: p.skills, href: `/${locale}#skills`, plugged: skills.length > 0 },
    { id: "journey", label: p.journey, href: `/${locale}#journey`, plugged: educations.length > 0 },
    { id: "labs", label: p.labs, href: `/${locale}/labs`, plugged: labs.length > 0 },
    { id: "about", label: p.about, href: `/${locale}#about`, plugged: true },
    { id: "contact", label: p.contact, href: `/${locale}#contact`, plugged: true },
    { id: "cv", label: p.cv, href: cvUrl ?? `/${locale}#contact`, external: Boolean(cvUrl), plugged: Boolean(cvUrl) },
    { id: "github", label: p.github, href: profile.github_url ?? `/${locale}#contact`, external: Boolean(profile.github_url), plugged: Boolean(profile.github_url) },
  ];

  const plate = [
    { label: locale === "fr" ? "Rôle" : "Role", value: pick(profile.role, locale) },
    { label: locale === "fr" ? "Base" : "Based in", value: profile.location },
    { label: locale === "fr" ? "Langues" : "Languages", value: languages.map(item => pick(item.name, locale)).join(" · ") },
  ];

  return (
    <>
      {/* ── Accueil : la plaque, puis le panneau de brassage ─────────── */}
      <section className="relative overflow-hidden" aria-labelledby="hero-title">
        <div className="container-site pt-8 md:pt-14">
          <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-8">
              <p className="tape rise">{dict.hero.eyebrow}</p>
              <h1 id="hero-title" className="rise mt-5 text-[clamp(2.7rem,8.2vw,6.6rem)] leading-[0.92] font-extrabold tracking-[-0.045em]" style={{ animationDelay: "0.08s" }}>
                {profile.display_name}
              </h1>
              <p className="rise mt-6 max-w-2xl text-[clamp(1.05rem,1.6vw,1.3rem)] leading-relaxed text-muted" style={{ animationDelay: "0.16s" }}>
                {pick(profile.headline, locale)}
              </p>
              <div className="rise mt-7 flex flex-wrap gap-3" style={{ animationDelay: "0.24s" }}>
                <Link href={`/${locale}/projects`} className="btn btn-primary">{dict.hero.primary}</Link>
                {cvUrl && <a href={cvUrl} target="_blank" rel="noreferrer" className="btn btn-secondary">{dict.hero.cv} ↓</a>}
              </div>
            </div>
            {/* Plaque signalétique */}
            <dl className="rise panel hidden gap-0 p-0 text-[14px] lg:col-span-4 lg:grid" style={{ animationDelay: "0.32s" }}>
              {plate.map(row => (
                <div key={row.label} className="flex justify-between gap-4 border-b border-border px-4 py-3">
                  <dt className="eyebrow pt-0.5">{row.label}</dt>
                  <dd className="text-right font-semibold">{row.value}</dd>
                </div>
              ))}
              <div className="flex items-center justify-between gap-4 px-4 py-3">
                <dt className="eyebrow">Status</dt>
                <dd className="flex items-center gap-2 font-semibold"><span aria-hidden="true" className="led led-on" />{pick(profile.availability, locale)}</dd>
              </div>
            </dl>
          </div>

          <div className="rise mt-12 md:mt-16" style={{ animationDelay: "0.2s" }}>
            <p className="silk mb-3 hidden text-muted! md:block">↳ {dict.panel.hint}</p>
            <PatchPanel ports={ports} t={dict.panel} />
          </div>
        </div>
      </section>

      {/* ── Ce que je cherche : l'écran d'état de l'équipement ───────── */}
      {pick(profile.seeking, locale) && (
        <section className="container-site pt-16" aria-labelledby="seeking-title">
          <div className="panel grid gap-6 p-6 sm:p-10 md:grid-cols-[auto_1fr_auto] md:items-center">
            <div aria-hidden="true" className="flex items-center gap-2 font-mono text-xs tracking-[0.14em] text-(--cable-green)">
              <span className="led led-on" style={{ ["--blink" as string]: "1.1s" }} /><span className="led led-act" style={{ ["--blink" as string]: "0.9s" }} /> LINK UP
            </div>
            <div>
              <p className="eyebrow">{dict.seeking.eyebrow} · {pick(profile.availability, locale)}</p>
              <h2 id="seeking-title" className="mt-2 text-[clamp(1.5rem,3vw,2.2rem)] leading-tight font-extrabold tracking-[-0.02em] text-balance">{dict.seeking.title}</h2>
              <p className="mt-3 max-w-2xl text-[17px] leading-8 text-muted">{pick(profile.seeking, locale)}</p>
            </div>
            <Link href={`/${locale}#contact`} className="btn btn-primary w-fit">{dict.nav.cta}</Link>
          </div>
        </section>
      )}

      {/* ── 01 Projets ───────────────────────────── */}
      {projects.length > 0 && (
        <section id="projects" className="container-site scroll-mt-24 py-20 md:py-28" aria-labelledby="projects-title">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading id="projects-title" port="01" eyebrow={dict.projects.eyebrow} title={dict.projects.title} subtitle={dict.projects.subtitle} />
            <Link href={`/${locale}/projects`} className="link-underline font-bold">{dict.projects.all} →</Link>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {(featured.length ? featured : projects).slice(0, 3).map(project => (
              <ProjectCard key={project.slug} project={project} locale={locale} dict={dict} />
            ))}
          </div>
        </section>
      )}

      {/* ── 02 Compétences : des voyants de niveau ───────────── */}
      {skills.length > 0 && (
        <section id="skills" className="scroll-mt-24 border-y border-border bg-surface-2/50 py-20 md:py-28" aria-labelledby="skills-title">
          <div className="container-site">
            <SectionHeading id="skills-title" port="02" eyebrow={dict.skills.eyebrow} title={dict.skills.title} />
            <p className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-xs text-muted" aria-hidden="true">
              {dict.skills.levels.map((level, index) => (
                <span key={level} className="flex items-center gap-1.5">
                  {[0, 1, 2].map(step => <span key={step} className={`led ${step <= index ? "led-on" : ""}`} />)} {level}
                </span>
              ))}
            </p>
            <InView className="mt-10 grid grid-cols-[minmax(0,1fr)] gap-5 md:grid-cols-2 lg:grid-cols-3">
              {skills.map((category, categoryIndex) => (
                <div key={pick(category.name, "fr")} className="panel p-5">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="tape">{pick(category.name, locale)}</h3>
                    <span aria-hidden="true" className="h-2 w-10 rounded-full" style={{ background: CABLES[categoryIndex % CABLES.length] }} />
                  </div>
                  <ul className="mt-5 flex flex-col gap-3">
                    {category.skills.map((skill, skillIndex) => (
                      <li key={skill.name} className="flex items-center justify-between gap-4 text-[15px]">
                        <span className="min-w-0 font-medium">{skill.name}</span>
                        <span className="flex shrink-0 items-center gap-1.5">
                          <span className="sr-only">{dict.skills.levels[skill.level - 1]}</span>
                          {[1, 2, 3].map(step => (
                            <span
                              key={step}
                              aria-hidden="true"
                              className={`led level-led ${step <= skill.level ? "led-on" : ""}`}
                              // Les voyants s'allument l'un après l'autre à l'arrivée à l'écran.
                              style={{ transitionDelay: `${categoryIndex * 120 + skillIndex * 60 + step * 90}ms` }}
                            />
                          ))}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </InView>
          </div>
        </section>
      )}

      {/* ── 03 Parcours : une gaine qui se déroule, des étiquettes de câble ─ */}
      <section id="journey" className="container-site scroll-mt-24 py-20 md:py-28" aria-labelledby="journey-title">
        <SectionHeading id="journey-title" port="03" eyebrow={dict.journey.eyebrow} title={dict.journey.title} />
        <div className="mt-14 grid gap-14 lg:grid-cols-2 lg:gap-16">
          <div>
            <h3 className="eyebrow">{dict.journey.education}</h3>
            <InView as="ol" className="relative mt-6 grid gap-8 pl-12">
              <span aria-hidden="true" className="run-cable absolute top-1 bottom-1 left-[11px] w-[7px] rounded-full bg-(--cable-orange) shadow-[inset_-2px_0_0_rgb(0_0_0/0.18)]" />
              {educations.map((item, index) => (
                <li key={pick(item.title, "fr")} className="run-item relative" style={{ transitionDelay: `${300 + index * 160}ms` }}>
                  {/* Connecteur sur la gaine */}
                  <span aria-hidden="true" className="absolute top-0.5 -left-[44px] flex h-6 w-[26px] items-center justify-center rounded-[2px] border border-black/20 bg-[rgb(225_232_238/0.85)]">
                    <span className="h-2 w-3 border-x border-[#c8a24a]" />
                  </span>
                  <p className="tag">{pick(item.period, locale)}</p>
                  <p className="mt-1 text-lg font-bold leading-snug">{pick(item.title, locale)}</p>
                  <p className="text-[15px] text-muted">{item.institution}{item.location ? ` · ${item.location}` : ""}</p>
                </li>
              ))}
            </InView>
          </div>
          <div>
            <h3 className="eyebrow">{dict.journey.certifications}</h3>
            <ul className="mt-6 grid gap-x-5 gap-y-8 pt-3 sm:grid-cols-2">
              {certifications.map((item, index) => (
                <li key={pick(item.title, "fr")} className="cable-tag relative">
                  {/* Collier de serrage qui retient l'étiquette */}
                  <span aria-hidden="true" className="absolute -top-3 left-1/2 h-3 w-1 -translate-x-1/2 rounded-sm" style={{ background: CABLES[(index + 1) % CABLES.length] }} />
                  <div className="panel relative p-4 pt-5">
                    <span aria-hidden="true" className="absolute top-1.5 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full border border-border bg-background" />
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="font-mono text-sm font-medium text-muted">{item.year ?? "—"}</span>
                      <span className="tag">{pick(item.kind, locale)}</span>
                    </div>
                    {item.url ? (
                      <a href={item.url} target="_blank" rel="noreferrer" className="link-underline mt-2 block font-bold leading-snug">{pick(item.title, locale)}</a>
                    ) : (
                      <p className="mt-2 font-bold leading-snug">{pick(item.title, locale)}</p>
                    )}
                    <p className="mt-1 text-sm text-muted">{item.issuer}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── 04 Labs ───────────────────────────── */}
      {labs.length > 0 && (
        <section className="container-site pb-8" aria-labelledby="labs-title">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading id="labs-title" port="04" eyebrow={dict.labs.eyebrow} title={dict.labs.title} subtitle={dict.labs.subtitle} />
            <Link href={`/${locale}/labs`} className="link-underline font-bold">{dict.labs.title} →</Link>
          </div>
        </section>
      )}

      {/* ── 05 Profil ───────────────────────────── */}
      <section id="about" className="container-site scroll-mt-24 py-20 md:py-28" aria-labelledby="about-title">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <SectionHeading id="about-title" port="05" eyebrow={dict.about.eyebrow} title={dict.about.title} />
            <p className="mt-6 text-lg leading-8 text-muted">{pick(profile.bio, locale)}</p>
          </div>
          <div className="grid content-start gap-8 lg:col-span-4 lg:col-start-9">
            {strengths.length > 0 && (
              <div>
                <h3 className="eyebrow">{dict.about.strengths}</h3>
                <ul className="mt-4 flex flex-wrap gap-2.5">
                  {strengths.map((item, index) => (
                    <li key={pick(item.label, "fr")} className="tape" style={{ transform: `rotate(${[-1.2, 0.8, -0.4, 1.1][index % 4]}deg)` }}>{pick(item.label, locale)}</li>
                  ))}
                </ul>
              </div>
            )}
            {languages.length > 0 && (
              <div className="panel p-4">
                <h3 className="eyebrow">{dict.about.languages}</h3>
                <dl className="mt-3 grid gap-2">
                  {languages.map(item => (
                    <div key={pick(item.name, "fr")} className="flex justify-between gap-4 text-[15px]">
                      <dt className="font-bold">{pick(item.name, locale)}</dt>
                      <dd className="text-muted">{pick(item.level, locale)}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
          </div>
        </div>
        {principles.length > 0 && (
          <ol className="mt-16 grid gap-px overflow-hidden rounded-(--radius) border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
            {principles.map((principle, index) => (
              <li key={pick(principle.title, "fr")} className="bg-surface p-6">
                <span className="flex items-center gap-2">
                  <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full" style={{ background: CABLES[index % CABLES.length] }} />
                  <span className="tag">PIN {index + 1}</span>
                </span>
                <h3 className="mt-4 text-lg font-extrabold">{pick(principle.title, locale)}</h3>
                <p className="mt-2 text-[15px] leading-7 text-muted">{pick(principle.body, locale)}</p>
              </li>
            ))}
          </ol>
        )}
      </section>

      {/* ── 06 Contact ───────────────────────────── */}
      <section id="contact" className="scroll-mt-24 border-t border-border bg-surface-2/50 py-20 md:py-28" aria-labelledby="contact-title">
        <div className="container-site grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionHeading id="contact-title" port="06" eyebrow={dict.contact.eyebrow} title={dict.contact.title} subtitle={dict.contact.subtitle} />
            <div className="mt-8 grid gap-2 text-[15px]">
              <p className="eyebrow">{dict.contact.direct}</p>
              <a href={`mailto:${profile.email}`} className="link-underline w-fit text-lg font-bold break-all">{profile.email}</a>
              {profile.phone && <a href={`tel:${profile.phone.replace(/\s+/g, "")}`} className="link-underline w-fit text-muted">{profile.phone}</a>}
            </div>
          </div>
          <div className="lg:col-span-7">
            <ContactForm locale={locale} t={dict.contact} />
          </div>
        </div>
      </section>
    </>
  );
}
