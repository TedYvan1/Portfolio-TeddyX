import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import type { Education, Project } from "@shared/types";
import { splitList, useProfile } from "@/lib/profile";
import { easeOutExpo } from "@/lib/motion";

type Hop = { host: string; label: string; meta: string; pending?: boolean };

const slugify = (value: string) => value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function institutionCode(institution: string) {
  const acronym = institution.match(/\(([^)]+)\)/)?.[1];
  if (acronym) return acronym.toLowerCase();
  return institution.split(/[\s-]+/).filter(word => /^[A-ZÀ-Ý]/.test(word)).map(word => word[0]).join("").toLowerCase() || slugify(institution);
}

/** Le parcours présenté comme un traceroute : formations, projets, puis le prochain saut (le stage). */
function buildHops(educations: Education[], projects: Project[], availability: string): Hop[] {
  const schoolHops = educations
    .filter(item => /licence|master|bachelor|bts|dut/i.test(item.title))
    .slice(0, 2)
    .map(item => ({
      host: [item.location ? slugify(item.location.split(",")[0]) : "", institutionCode(item.institution), "ci"].filter(Boolean).join("."),
      label: item.title.replace(/\s*-\s*/, " · "),
      meta: item.period.replace(/^Depuis\s+/i, "") + " →",
    }));
  const projectHops = projects
    .filter(project => project.featured === 1)
    .slice(0, 2)
    .map(project => ({
      host: `${slugify(project.title)}.${project.category === "Mobile" ? "app" : "web"}`,
      label: splitList(project.technologies).slice(0, 2).join(" · "),
      meta: /en cours/i.test(project.description) ? "en cours" : project.category.toLowerCase(),
    }));
  return [...schoolHops, ...projectHops, { host: "votre-equipe.???", label: availability, meta: "", pending: true }];
}

export function Hero({ educations, projects }: { educations: Education[]; projects: Project[] }) {
  const profile = useProfile();
  const reduceMotion = useReducedMotion();
  const hops = useMemo(() => buildHops(educations, projects, profile.availability), [educations, projects, profile.availability]);
  const [firstName, ...rest] = profile.displayName.split(" ");
  const lastName = rest.pop() ?? "";
  const givenNames = [firstName, ...rest].join(" ");

  const line = (delay: number) => ({
    initial: reduceMotion ? false : { y: "105%" },
    animate: { y: "0%" },
    transition: { duration: 1.05, delay, ease: easeOutExpo },
  });

  return (
    <section className="relative flex min-h-[100svh] flex-col pt-24 md:pt-28" aria-label="Présentation">
      <div className="container flex flex-wrap items-center justify-between gap-3 border-b border-foreground/15 pb-4">
        <span className="mono-label">
          <span className="text-primary">Saut 00</span> — Origine · {profile.heroLocation}
        </span>
        <span className="mono-label inline-flex items-center gap-2">
          <span className="relative inline-flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-signal opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-signal" />
          </span>
          {profile.heroEyebrow}
        </span>
      </div>

      <div className="container flex flex-1 flex-col justify-center py-10 md:py-14">
        <h1 aria-label={profile.displayName}>
          <span className="mask-line" aria-hidden="true">
            <motion.span className="hero-name-serif block" {...line(0.1)}>
              {givenNames}
            </motion.span>
          </span>
          <span className="mask-line" aria-hidden="true">
            <motion.span className="hero-name block" {...line(0.22)}>
              {lastName}
            </motion.span>
          </span>
        </h1>

        <div className="mt-10 grid gap-10 md:mt-14 lg:grid-cols-12 lg:gap-8">
          <motion.div
            className="lg:col-span-5"
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.55, ease: easeOutExpo }}
          >
            <p className="font-serif text-3xl leading-[1.05] md:text-4xl">
              {profile.heroTitle} <em className="text-primary">{profile.heroTitleAccent}</em> {profile.heroSubtitle}
            </p>
            <p className="mt-5 max-w-xl text-[15px] leading-7 text-muted-foreground">{profile.heroDescription}</p>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
              <a href="#projects" className="button-primary">
                Voir les projets <ArrowDownRight className="h-4 w-4" />
              </a>
              <a href="#contact" className="group inline-flex items-center gap-1.5 text-sm font-medium">
                <span className="link-underline">Proposer un stage</span>
                <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>
            </div>
          </motion.div>

          <div className="lg:col-span-6 lg:col-start-7">
            <Traceroute hops={hops} />
          </div>
        </div>
      </div>

      <div className="border-y border-foreground/15 py-3" aria-hidden="true">
        <div className="flex overflow-hidden">
          <div className="flex shrink-0 animate-[marquee_38s_linear_infinite] gap-10 pr-10 font-mono text-[11px] uppercase tracking-[.14em] text-muted-foreground">
            {[0, 1].map(copy => (
              <span key={copy} className="flex shrink-0 gap-10">
                {[...splitList(profile.heroTags).flatMap(tag => splitList(tag, "·")), `focus : ${profile.codeFocus}`, `mindset : ${profile.codeMindset}`, profile.heroLocation].map((item, index) => (
                  <span key={`${copy}-${index}`} className="flex items-center gap-10">
                    {item}
                    <span className="text-primary">/</span>
                  </span>
                ))}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Traceroute({ hops }: { hops: Hop[] }) {
  const reduceMotion = useReducedMotion();
  const [visible, setVisible] = useState(reduceMotion ? hops.length : 0);

  useEffect(() => {
    if (reduceMotion) {
      setVisible(hops.length);
      return;
    }
    setVisible(0);
    let count = 0;
    let interval: number | undefined;
    const start = window.setTimeout(() => {
      interval = window.setInterval(() => {
        count += 1;
        setVisible(count);
        if (count >= hops.length) window.clearInterval(interval);
      }, 260);
    }, 900);
    return () => {
      window.clearTimeout(start);
      window.clearInterval(interval);
    };
  }, [hops.length, reduceMotion]);

  return (
    <motion.figure
      className="trace"
      initial={reduceMotion ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.7, ease: easeOutExpo }}
      aria-label="Parcours présenté sous forme de traceroute"
    >
      <div className="trace-head">
        <span>
          <span className="text-primary">$</span> <span className="normal-case">traceroute --vers=stage ted.kamanan</span>
        </span>
        <span className="hidden text-muted-foreground sm:inline">{hops.length} sauts max</span>
      </div>
      <ol>
        {hops.map((hop, index) => (
          <motion.li
            key={hop.host}
            className="trace-row"
            initial={false}
            animate={{ opacity: index < visible ? 1 : 0, x: index < visible ? 0 : -6 }}
            transition={{ duration: 0.35, ease: easeOutExpo }}
          >
            <span className="text-muted-foreground">{String(index + 1).padStart(2, " ")}</span>
            <span className={`trace-host ${hop.pending ? "text-primary" : ""}`}>{hop.host}</span>
            <span className="trace-label">{hop.label}</span>
            <span className="trace-meta">
              {hop.pending ? (
                <a href="#contact" className="inline-flex items-center gap-1.5 text-primary hover:underline">
                  * * * <span className="trace-cursor" aria-hidden="true" />
                </a>
              ) : (
                hop.meta
              )}
            </span>
          </motion.li>
        ))}
      </ol>
      <figcaption className="border-t border-foreground/80 px-4 py-2.5 text-[11px] uppercase tracking-[.14em] text-muted-foreground">
        Dernier saut en attente de réponse — <a href="#contact" className="text-foreground underline decoration-primary underline-offset-4">c'est peut-être vous</a>
      </figcaption>
    </motion.figure>
  );
}
