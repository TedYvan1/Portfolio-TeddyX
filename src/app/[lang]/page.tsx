import Link from "next/link";
import { pick } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { getContent, mediaUrl } from "@/lib/content";
import { ProjectCard } from "@/components/project-card";
import { SectionHeading } from "@/components/section-heading";
import { ContactForm } from "@/components/contact-form";
import { InView } from "@/components/in-view";

const TINTS = ["var(--blue)", "var(--red)", "var(--yellow)"];
// Couleur du texte posé sur chaque aplat (contraste suffisant de jour comme de nuit)
const ON_TINTS = ["var(--on-blue)", "var(--on-red)", "#141210"];

/** Les mots d'une bulle apparaissent l'un après l'autre, comme s'ils étaient prononcés. */
function Spoken({ text, start = 0 }: { text: string; start?: number }) {
  return text.split(" ").map((word, index) => (
    <span key={index} className="word" style={{ animationDelay: `${start + index * 45}ms` }}>{word}&nbsp;</span>
  ));
}

/** Illustration du héros : un ordinateur, un bouclier, des étincelles et des lignes de vitesse. */
function HeroDrawing({ bzzt }: { bzzt: string }) {
  return (
    <svg viewBox="0 0 320 240" className="h-auto w-full" aria-hidden="true">
      <g className="speed">
        {[40, 70, 100, 130, 160, 190].map((y, index) => <line key={y} x1="0" y1={y} x2="320" y2={y} style={{ animationDelay: `${index * 0.23}s` }} />)}
      </g>
      {/* Écran */}
      <rect x="62" y="48" width="170" height="112" rx="6" fill="var(--panel)" stroke="var(--ink)" strokeWidth="4" />
      <rect x="74" y="60" width="146" height="88" fill="var(--blue)" stroke="var(--ink)" strokeWidth="3" />
      <path d="M86 78h50M86 92h80M98 106h56M86 120h36" stroke="#fffaf0" strokeWidth="5" strokeLinecap="round" />
      <path d="M42 170h210l-14 20H56z" fill="var(--panel)" stroke="var(--ink)" strokeWidth="4" strokeLinejoin="round" />
      {/* Bouclier de sécurité */}
      <path d="M246 76l40 12c0 40-14 64-40 78-26-14-40-38-40-78z" fill="var(--yellow)" stroke="var(--ink)" strokeWidth="4" strokeLinejoin="round" />
      <path d="M230 120l12 12 22-26" fill="none" stroke="var(--ink)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Étincelles */}
      <g className="spark"><path d="M44 52l8 10-12 2 10 8" fill="none" stroke="var(--red)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" /></g>
      <g className="spark" style={{ animationDelay: "0.7s" }}><path d="M296 186l-8-10 12-2-10-8" fill="none" stroke="var(--red)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" /></g>
      <text x="196" y="40" fontSize="34" fontFamily="var(--font-display), sans-serif" fill="var(--red)" stroke="var(--ink)" strokeWidth="1.5" paintOrder="stroke" transform="rotate(-10 196 40)" className="spark">{bzzt}</text>
    </svg>
  );
}

export default async function Home() {
  const [locale, dict, content] = await Promise.all([getLocale(), getDictionary(), getContent()]);
  const { profile, projects, skills, educations, certifications, languages, strengths, principles, labs } = content;
  const featured = projects.filter(project => project.featured);
  const cvUrl = mediaUrl(profile.cv_path);
  const c = dict.comic;
  const firstName = profile.display_name.split(" ")[0];

  const stats = [
    { value: dict.stats.degrees, label: dict.stats.degreesLabel.split(" · ")[0] },
    { value: String(projects.length), label: dict.stats.projectsLabel },
    { value: String(certifications.length), label: dict.stats.certificationsLabel },
  ];

  // Le sommaire de l'album : un chapitre par partie du site.
  const contents = [
    { label: dict.projects.eyebrow, href: `/${locale}#projects`, show: projects.length > 0 },
    { label: dict.skills.eyebrow, href: `/${locale}#skills`, show: skills.length > 0 },
    { label: dict.journey.eyebrow, href: `/${locale}#journey`, show: true },
    { label: dict.labs.eyebrow, href: `/${locale}/labs`, show: true },
    { label: dict.about.eyebrow, href: `/${locale}#about`, show: true },
    { label: dict.contact.eyebrow, href: `/${locale}#contact`, show: true },
  ].filter(item => item.show);

  return (
    <>
      {/* ── La planche d'accueil ─────────── */}
      <section className="container-site pt-6 md:pt-10" aria-labelledby="hero-title">
        <div className="grid gap-4 md:gap-5 lg:grid-cols-[1.55fr_1fr]">
          {/* Case 1 : le héros */}
          <div className="panel panel-drop dots overflow-hidden p-5 sm:p-8 lg:row-span-2" style={{ ["--from-rot" as string]: "-2deg" }}>
            <p className="caption -rotate-1">{c.issue} — {c.place}</p>
            <div className="mt-5 grid items-center gap-4 sm:grid-cols-[1.2fr_1fr]">
              <div>
                <h1 id="hero-title" className="pop-title text-[clamp(3.4rem,8.4vw,7rem)]">{profile.display_name}</h1>
                <p className="mt-3 eyebrow">{pick(profile.role, locale)}</p>
              </div>
              <div className="mx-auto w-full max-w-[320px]"><HeroDrawing bzzt={c.bzzt} /></div>
            </div>
            <div className="bubble bubble-pop mt-5 max-w-xl text-[clamp(1.05rem,1.5vw,1.25rem)] font-bold" style={{ animationDelay: "0.55s" }}>
              <Spoken text={`${c.hello} ${firstName}. ${pick(profile.headline, locale)}`} start={700} />
            </div>
          </div>

          {/* Case 2 : les chiffres, en étoiles d'action */}
          <div className="panel panel-drop overflow-hidden bg-blue p-5 text-(--on-blue) sm:p-6" style={{ animationDelay: "0.18s", ["--from-rot" as string]: "3deg" }}>
            <p className="caption rotate-1">{c.meanwhile}</p>
            <ul className="mt-5 grid grid-cols-3 gap-2">
              {stats.map((stat, index) => (
                <li key={stat.label} className="grid justify-items-center gap-2 text-center">
                  <span className="burst display text-[1.9rem] text-[#141210]" style={{ width: 92, height: 92, transform: `rotate(${[-8, 6, -4][index]}deg)` }}>{stat.value}</span>
                  <span className="text-[13px] leading-tight font-bold">{stat.label}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Case 3 : ce qu'il cherche, et les actions */}
          <div className="panel panel-drop p-5 sm:p-6" style={{ animationDelay: "0.32s", ["--from-rot" as string]: "-3deg" }}>
            <p className="eyebrow">{dict.seeking.eyebrow} · {pick(profile.availability, locale)}</p>
            <p className="display mt-2 text-[clamp(1.7rem,2.6vw,2.2rem)]">{dict.seeking.title}</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link href={`/${locale}/projects`} className="btn btn-primary">{dict.hero.primary} !</Link>
              {cvUrl && <a href={cvUrl} target="_blank" rel="noreferrer" className="btn btn-secondary">{dict.hero.cv}</a>}
            </div>
          </div>
        </div>

        {/* Bande du sommaire */}
        <nav aria-label={c.contents} className="panel-drop mt-6 flex flex-wrap items-center gap-3" style={{ animationDelay: "0.5s" }}>
          <span className="display mr-1 text-2xl">{c.contents} :</span>
          {contents.map((item, index) => (
            <Link key={item.href} href={item.href} data-sfx className="panel flex items-baseline gap-2 px-3 py-1.5 !shadow-[3px_3px_0_var(--shadow)] transition-transform hover:-translate-y-1 hover:rotate-0" style={{ transform: `rotate(${index % 2 ? 1.2 : -1.2}deg)` }}>
              <span className="display text-red">{index + 1}</span>
              <span className="font-bold">{item.label}</span>
            </Link>
          ))}
        </nav>
      </section>

      {/* ── Chapitre 1 : les projets, en couvertures d'album ───────── */}
      {projects.length > 0 && (
        <section id="projects" className="container-site scroll-mt-24 pt-24 md:pt-32" aria-labelledby="projects-title">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading id="projects-title" chapter={`${c.chapter} 1`} eyebrow={dict.projects.eyebrow} title={dict.projects.title} subtitle={dict.projects.subtitle} />
            <Link href={`/${locale}/projects`} className="link-underline font-bold">{dict.projects.all} →</Link>
          </div>
          <div className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {(featured.length ? featured : projects).slice(0, 3).map((project, index) => (
              <ProjectCard key={project.slug} project={project} locale={locale} dict={dict} index={index} />
            ))}
          </div>
        </section>
      )}

      {/* ── Chapitre 2 : la fiche personnage, avec ses jauges de pouvoir ───────── */}
      {skills.length > 0 && (
        <section id="skills" className="container-site scroll-mt-24 pt-24 md:pt-32" aria-labelledby="skills-title">
          <SectionHeading id="skills-title" chapter={`${c.chapter} 2`} eyebrow={dict.skills.eyebrow} title={dict.skills.title} />
          <InView className="mt-12 grid grid-cols-[minmax(0,1fr)] gap-6 md:grid-cols-2 lg:grid-cols-3">
            {skills.map((category, categoryIndex) => (
              <div key={pick(category.name, "fr")} className="scene panel p-5" style={{ transitionDelay: `${categoryIndex * 90}ms`, rotate: `${[-0.8, 0.6, -0.4][categoryIndex % 3]}deg` }}>
                <h3 className="display text-[1.9rem]" style={{ color: categoryIndex % 3 === 2 ? "var(--ink)" : TINTS[categoryIndex % 3] }}>{pick(category.name, locale)}</h3>
                <ul className="mt-3 grid gap-2.5">
                  {category.skills.map((skill, skillIndex) => (
                    <li key={skill.name} className="grid gap-1">
                      <span className="flex justify-between gap-3 text-[15px] font-bold">
                        <span className="min-w-0">{skill.name}</span>
                        <span className="shrink-0 text-[12px] text-muted uppercase">{dict.skills.levels[skill.level - 1]}</span>
                      </span>
                      {/* Jauge de pouvoir : trois crans, remplis de trame à l'arrivée à l'écran */}
                      <span aria-hidden="true" className="relative h-3.5 overflow-hidden rounded-full border-[2.5px] border-ink bg-page">
                        <span className="power absolute inset-y-0 left-0 border-r-[2.5px] border-ink dots-strong" style={{ width: `${(skill.level / 3) * 100}%`, backgroundColor: TINTS[categoryIndex % 3], transitionDelay: `${categoryIndex * 90 + skillIndex * 70 + 200}ms` }} />
                        <span className="absolute inset-y-0 left-1/3 w-[2.5px] bg-ink/40" /><span className="absolute inset-y-0 left-2/3 w-[2.5px] bg-ink/40" />
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </InView>
        </section>
      )}

      {/* ── Chapitre 3 : le parcours en strip, les certifications en badges ───────── */}
      <section id="journey" className="container-site scroll-mt-24 pt-24 md:pt-32" aria-labelledby="journey-title">
        <SectionHeading id="journey-title" chapter={`${c.chapter} 3`} eyebrow={dict.journey.eyebrow} title={dict.journey.title} />
        <h3 className="sr-only">{dict.journey.education}</h3>
        <InView as="ol" className="mt-12 grid gap-4 md:grid-cols-3">
          {educations.map((item, index) => (
            <li key={pick(item.title, "fr")} className="scene panel flex flex-col p-5" style={{ transitionDelay: `${index * 140}ms`, rotate: `${[-1, 0.8, -0.5][index % 3]}deg` }}>
              <p className="caption self-start">{pick(item.period, locale)}</p>
              <p className="display mt-4 text-[1.7rem]">{pick(item.title, locale)}</p>
              <p className="mt-1 text-[15px] text-muted">{item.institution}{item.location ? ` · ${item.location}` : ""}</p>
            </li>
          ))}
        </InView>
        <h3 className="display mt-14 text-3xl">{dict.journey.certifications} !</h3>
        <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {certifications.map((item, index) => (
            <li key={pick(item.title, "fr")} className="panel flex items-center gap-4 p-4">
              <span className="burst display flex-none text-xl" style={{ width: 76, height: 76, background: TINTS[(index + 2) % 3], color: ON_TINTS[(index + 2) % 3], transform: `rotate(${index % 2 ? 8 : -8}deg)` }}>{item.year ?? "—"}</span>
              <span>
                {item.url ? (
                  <a href={item.url} target="_blank" rel="noreferrer" className="link-underline leading-snug font-bold">{pick(item.title, locale)}</a>
                ) : (
                  <span className="block leading-snug font-bold">{pick(item.title, locale)}</span>
                )}
                <span className="mt-0.5 block text-[13px] text-muted">{item.issuer} · {pick(item.kind, locale)}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* ── Chapitre 4 : le labo ───────── */}
      <section className="container-site pt-24 md:pt-32" aria-labelledby="labs-title">
        <div className="panel dots flex flex-wrap items-center justify-between gap-6 p-6 sm:p-8">
          <div>
            <p className="caption -rotate-1">{c.chapter} 4 · {c.lab}</p>
            <h2 id="labs-title" className="display mt-3 text-[clamp(2rem,4vw,3.2rem)]">{dict.labs.title}</h2>
            <p className="mt-1 max-w-[52ch] text-muted">{labs.length ? dict.labs.subtitle : c.soon}</p>
          </div>
          <Link href={`/${locale}/labs`} className="btn btn-secondary">{dict.labs.title} →</Link>
        </div>
      </section>

      {/* ── Chapitre 5 : le profil, en grande bulle ───────── */}
      <section id="about" className="container-site scroll-mt-24 pt-24 md:pt-32" aria-labelledby="about-title">
        <SectionHeading id="about-title" chapter={`${c.chapter} 5`} eyebrow={dict.about.eyebrow} title={dict.about.title} />
        <div className="mt-10 grid gap-10 lg:grid-cols-[1.4fr_1fr]">
          <div className="bubble text-lg" style={{ ["--tail" as string]: "60px" }}>
            <p>{pick(profile.bio, locale)}</p>
          </div>
          <div className="grid content-start gap-6">
            {strengths.length > 0 && (
              <div>
                <h3 className="eyebrow">{dict.about.strengths}</h3>
                <ul className="mt-3 flex flex-wrap gap-2.5">
                  {strengths.map((item, index) => (
                    <li key={pick(item.label, "fr")} className="border-[2.5px] border-ink px-3 py-1 font-bold shadow-[3px_3px_0_var(--shadow)]" style={{ background: TINTS[index % 3], color: ON_TINTS[index % 3], transform: `rotate(${[-2, 1.5, -1, 2][index % 4]}deg)` }}>
                      {pick(item.label, locale)}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {languages.length > 0 && (
              <dl className="panel grid gap-1.5 p-4">
                <h3 className="eyebrow">{dict.about.languages}</h3>
                {languages.map(item => (
                  <div key={pick(item.name, "fr")} className="flex justify-between gap-4">
                    <dt className="font-bold">{pick(item.name, locale)}</dt>
                    <dd className="text-muted">{pick(item.level, locale)}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        </div>
        {principles.length > 0 && (
          <InView as="ol" className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {principles.map((principle, index) => (
              <li key={pick(principle.title, "fr")} className="scene panel p-5" style={{ transitionDelay: `${index * 100}ms` }}>
                <span className="display text-5xl" style={{ color: TINTS[index % 3], WebkitTextStroke: "1.5px var(--ink)" }}>{index + 1}</span>
                <h3 className="display mt-1 text-2xl">{pick(principle.title, locale)}</h3>
                <p className="mt-1 text-[15px] text-muted">{pick(principle.body, locale)}</p>
              </li>
            ))}
          </InView>
        )}
      </section>

      {/* ── Chapitre 6 : le contact ───────── */}
      <section id="contact" className="container-site scroll-mt-24 pt-24 md:pt-32" aria-labelledby="contact-title">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionHeading id="contact-title" chapter={`${c.chapter} 6`} eyebrow={dict.contact.eyebrow} title={dict.contact.title} subtitle={dict.contact.subtitle} />
            <dl className="mt-8 grid gap-1">
              <dt className="eyebrow">{dict.contact.direct}</dt>
              <dd><a href={`mailto:${profile.email}`} data-sfx className="link-underline text-xl font-bold break-all">{profile.email}</a></dd>
              {profile.phone && <dd><a href={`tel:${profile.phone.replace(/\s+/g, "")}`} className="link-underline text-muted">{profile.phone}</a></dd>}
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
