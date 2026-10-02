import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowDownRight, ArrowUpRight, CheckCircle2, Code2, Database, GitBranch, Mail, MonitorCog, MonitorSmartphone, Network, Palette, Send, Server, ShieldCheck, Terminal, UserRound } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { trpc } from "@/lib/trpc";
import { SiteLayout, ScrollReveal, SectionHeading } from "@/components/SiteLayout";
import Certifications from "@/components/Certifications";
import { Aurora } from "@/components/effects/Aurora";
import { BlurText } from "@/components/effects/BlurText";
import { ShinyText } from "@/components/effects/ShinyText";
import { Magnet } from "@/components/effects/Magnet";
import { SpotlightCard } from "@/components/effects/SpotlightCard";
import { TiltCard } from "@/components/effects/TiltCard";
import { staggerContainer, staggerItem } from "@/lib/motion";

const contactSchema = z.object({ name: z.string().min(2, "Votre nom est requis"), email: z.string().email("Email invalide"), subject: z.string().min(3, "Sujet trop court"), message: z.string().min(20, "Décrivez votre besoin en au moins 20 caractères"), honeypot: z.string().max(0).optional() });
type ContactValues = z.infer<typeof contactSchema>;

const iconMap: Record<string, typeof Code2> = { Code2, Database, GitBranch, MonitorCog, MonitorSmartphone, Network, Palette, Server, ShieldCheck, Terminal };

const fallbackProfile = {
  heroEyebrow: "À la recherche d'un stage",
  heroLocation: "Abidjan · Bouaké",
  heroTitle: "Je développe des solutions",
  heroTitleAccent: "clairs.",
  heroSubtitle: "Je sécurise mes applications.",
  heroDescription: "Étudiant en Réseaux & Sécurité Informatique et en Génie Logiciel. Je conçois des applications web performantes et sécurisées, avec une forte capacité d'analyse et d'adaptation.",
  heroTags: "HTML · CSS · JavaScript,Node · MySQL,Réseaux · JWT",
  codeFocus: "full-stack",
  codeMindset: "secure-by-design",
  codeStack: "React,Node.js,PostgreSQL,Linux",
  codeStatus: "building",
  aboutEyebrow: "01 / À propos",
  aboutTitle: "Une approche hybride, entre produit et infrastructure.",
  aboutDescription: "Je suis Konin Ted Yvan Axel Kamanan, étudiant en Licence 3 Réseaux et Sécurité Informatique à l'UVCI et en Licence 2 Génie Logiciel à l'Université Nord-Sud de Bouaké. J'allie analyse, adaptabilité et curiosité pour concevoir des applications web performantes et sécurisées.",
  skillsEyebrow: "02 / Compétences",
  skillsTitle: "Les outils que j'utilise pour passer de l'idée au produit.",
  skillsDescription: "Une base technique en progression constante, organisée autour de la qualité, de la simplicité et de la sécurité.",
  projectsEyebrow: "04 / Projets sélectionnés",
  projectsTitle: "Quelques problèmes transformés en interfaces.",
  projectsDescription: "Des projets d'apprentissage et de production qui illustrent ma manière de penser le produit de bout en bout.",
  contactEyebrow: "05 / Contact",
  contactTitle: "Construisons quelque chose d'utile.",
  contactDescription: "Vous avez un projet web, une idée à prototyper ou simplement envie d'échanger ? Écrivez-moi, je réponds sous 48 heures.",
  email: "y.vannky10@gmail.com",
  phone: "07 58 11 79 44",
  availability: "Stage recherché",
};

const fallbackCards = [
  { id: 1, label: "01", title: "Construire", description: "Des interfaces accessibles et des APIs qui restent compréhensibles quand le produit grandit." },
  { id: 2, label: "02", title: "Comprendre", description: "Un double parcours qui relie les fondamentaux des réseaux, la sécurité informatique et la construction de logiciels utiles." },
  { id: 3, label: "03", title: "Sécuriser", description: "Validation côté serveur, moindre privilège et défense en profondeur dès la conception." },
  { id: 4, label: "04", title: "Progresser", description: "Apprendre vite, documenter les décisions et livrer des améliorations mesurables." },
];

export default function Home() {
  const projectsQuery = trpc.public.projects.useQuery(undefined, { staleTime: 60_000 });
  const skillsQuery = trpc.public.skills.useQuery(undefined, { staleTime: 60_000 });
  const profileQuery = trpc.public.siteProfile.useQuery(undefined, { staleTime: 60_000 });
  const aboutCardsQuery = trpc.public.aboutCards.useQuery(undefined, { staleTime: 60_000 });
  const profile = (profileQuery.data as typeof fallbackProfile | null) ?? fallbackProfile;
  const aboutCards = (aboutCardsQuery.data as typeof fallbackCards | undefined) ?? fallbackCards;
  const messageMutation = trpc.public.createMessage.useMutation({ onSuccess: () => { toast.success("Message envoyé. Je vous répondrai rapidement."); reset(); }, onError: error => toast.error(error.message || "Impossible d'envoyer le message") });
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ContactValues>({ resolver: zodResolver(contactSchema), defaultValues: { name: "", email: "", subject: "", message: "", honeypot: "" } });
  const featuredProjects = useMemo(() => (projectsQuery.data ?? []).filter(project => project.featured === 1).slice(0, 3), [projectsQuery.data]);
  const skillGroups = useMemo(() => { const groups: Record<string, NonNullable<typeof skillsQuery.data>> = {}; for (const skill of skillsQuery.data ?? []) groups[skill.category] = [...(groups[skill.category] ?? []), skill]; return Object.keys(groups).map(category => [category, groups[category]] as const); }, [skillsQuery.data]);
  const heroTags = profile.heroTags.split(",").map(s => s.trim()).filter(Boolean);
  const stackItems = profile.codeStack.split(",").map(s => s.trim()).filter(Boolean);
  const submitMessage = (values: ContactValues) => messageMutation.mutate(values);

  return (
    <SiteLayout>
      <main>
        <section className="hero-section">
          <Aurora />
          <div className="hero-grid" />
          <div className="container relative grid gap-14 py-20 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:py-28">
            <ScrollReveal>
              <div className="available-pill">
                <span className="pulse-dot" /> {profile.heroEyebrow} <span className="text-muted-foreground">·</span> {profile.heroLocation}
              </div>
              <h1 className="mt-7 max-w-3xl font-display text-5xl font-semibold leading-[1.02] tracking-[-0.045em] sm:text-6xl lg:text-[5.25rem]">
                <BlurText text={profile.heroTitle} as="span" stagger={0.025} className="inline" /> <ShinyText className="text-gradient">{profile.heroTitleAccent}</ShinyText>
                <br />
                <span className="text-muted-foreground">{profile.heroSubtitle}</span>
              </h1>
              <p className="mt-7 max-w-xl text-base leading-8 text-muted-foreground md:text-lg">{profile.heroDescription}</p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Magnet strength={0.2}>
                  <a href="#projects" className="button-primary">
                    Voir mes projets <ArrowUpRight className="h-4 w-4" />
                  </a>
                </Magnet>
                <a href="#contact" className="button-outline">
                  Me contacter <Mail className="h-4 w-4" />
                </a>
              </div>
              <div className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-3 text-sm text-muted-foreground">
                {heroTags.map(tag => (
                  <span key={tag} className="inline-flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" /> {tag}
                  </span>
                ))}
              </div>
            </ScrollReveal>
            <ScrollReveal className="delay-2">
              <TiltCard maxTilt={5}>
                <div className="terminal-card">
                  <div className="terminal-bar">
                    <span className="terminal-dot bg-red-400" />
                    <span className="terminal-dot bg-amber-300" />
                    <span className="terminal-dot bg-emerald-400" />
                    <span className="ml-auto font-mono text-[11px] text-muted-foreground">portfolio.ts</span>
                  </div>
                  <div className="p-6 font-mono text-sm leading-8 sm:p-8">
                    <p>
                      <span className="code-purple">const</span> <span className="code-blue">developer</span> <span className="text-muted-foreground">=</span> <span className="text-foreground">&#123;</span>
                    </p>
                    <p className="pl-5">
                      <span className="code-blue">focus</span>
                      <span className="text-muted-foreground">:</span> <span className="code-green">"{profile.codeFocus}"</span>
                      <span className="text-muted-foreground">,</span>
                    </p>
                    <p className="pl-5">
                      <span className="code-blue">mindset</span>
                      <span className="text-muted-foreground">:</span> <span className="code-green">"{profile.codeMindset}"</span>
                      <span className="text-muted-foreground">,</span>
                    </p>
                    <p className="pl-5">
                      <span className="code-blue">stack</span>
                      <span className="text-muted-foreground">:</span> <span className="text-foreground">[</span>
                    </p>
                    <p className="pl-10">
                      {stackItems.slice(0, 2).map((s, i) => (
                        <span key={s}>
                          <span className="code-green">"{s}"</span>
                          {i < 1 && <span className="text-muted-foreground">, </span>}
                        </span>
                      ))}
                      <span className="text-muted-foreground">,</span>
                    </p>
                    <p className="pl-10">
                      {stackItems.slice(2).map((s, i) => (
                        <span key={s}>
                          <span className="code-green">"{s}"</span>
                          {i < stackItems.slice(2).length - 1 && <span className="text-muted-foreground">, </span>}
                        </span>
                      ))}
                    </p>
                    <p className="pl-5">
                      <span className="text-foreground">]</span>
                      <span className="text-muted-foreground">,</span>
                    </p>
                    <p className="pl-5">
                      <span className="code-blue">status</span>
                      <span className="text-muted-foreground">:</span> <span className="code-green">"{profile.codeStatus}"</span>
                    </p>
                    <p>
                      <span className="text-foreground">&#125;</span>
                      <span className="text-muted-foreground">;</span>
                      <span className="cursor-blink">_</span>
                    </p>
                  </div>
                  <div className="terminal-footer">
                    <span>
                      <span className="text-primary">●</span> system ready
                    </span>
                    <span>uptime 99.9%</span>
                  </div>
                </div>
              </TiltCard>
            </ScrollReveal>
          </div>
          <div className="container flex items-center gap-3 pb-10 text-xs uppercase tracking-[0.22em] text-muted-foreground">
            <ArrowDownRight className="h-4 w-4 text-primary" /> Scroll pour découvrir
          </div>
        </section>

        <section id="about" className="section-shell">
          <div className="container grid gap-14 lg:grid-cols-[.8fr_1.2fr] lg:items-start">
            <ScrollReveal>
              <SectionHeading eyebrow={profile.aboutEyebrow} title={profile.aboutTitle} description={profile.aboutDescription} />
              <a href="#contact" className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
                Parler d'un projet <ArrowUpRight className="h-4 w-4" />
              </a>
            </ScrollReveal>
            <motion.div className="grid gap-4 sm:grid-cols-2" variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}>
              {aboutCards.map(card => (
                <motion.div key={card.id} variants={staggerItem}>
                  <SpotlightCard className="h-full">
                    <div className="info-card h-full">
                      <div className="number-label">{card.label}</div>
                      <h3 className="mt-5 font-display text-xl font-semibold">{card.title}</h3>
                      <p className="mt-3 text-sm leading-6 text-muted-foreground">{card.description}</p>
                    </div>
                  </SpotlightCard>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        <section id="skills" className="section-shell section-tint">
          <div className="container">
            <ScrollReveal>
              <SectionHeading eyebrow={profile.skillsEyebrow} title={profile.skillsTitle} description={profile.skillsDescription} />
            </ScrollReveal>
            <motion.div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4" variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.15 }}>
              {skillGroups.length ? (
                skillGroups.map(([category, skills], index) => (
                  <motion.div key={category} variants={staggerItem}>
                    <SpotlightCard className="h-full">
                      <div className="skill-group h-full">
                        <div className="flex items-center justify-between">
                          <span className="eyebrow text-[10px]">{category}</span>
                          <span className="text-xs text-muted-foreground">0{index + 1}</span>
                        </div>
                        <div className="mt-6 space-y-4">
                          {skills?.map(skill => {
                            const Icon = iconMap[skill.icon ?? ""] ?? Code2;
                            return (
                              <div key={skill.id} className="flex items-start gap-3">
                                <span className="skill-icon">
                                  <Icon className="h-4 w-4" />
                                </span>
                                <div>
                                  <p className="text-sm font-medium">{skill.name}</p>
                                  <p className="mt-0.5 text-xs text-muted-foreground">{skill.level}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </SpotlightCard>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full empty-state">Les compétences seront bientôt disponibles.</div>
              )}
            </motion.div>
          </div>
        </section>

        <Certifications />
        <section id="projects" className="section-shell">
          <div className="container">
            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
              <ScrollReveal>
                <SectionHeading eyebrow={profile.projectsEyebrow} title={profile.projectsTitle} description={profile.projectsDescription} />
              </ScrollReveal>
              <Link href="/projects" className="mb-10 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
                Voir tous les projets <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
            <motion.div className="grid gap-6 lg:grid-cols-3" variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }}>
              {featuredProjects.map(project => (
                <motion.div key={project.id} variants={staggerItem}>
                  <Link href={`/projects/${project.slug}`} className="project-card group">
                    <div className="project-image">
                      {project.imageUrl ? <img src={project.imageUrl} alt="" /> : <div className="project-image-fallback"><Terminal /></div>}
                      <span className="project-category">{project.category}</span>
                      <span className="project-arrow">
                        <ArrowUpRight className="h-4 w-4" />
                      </span>
                    </div>
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <h3 className="font-display text-xl font-semibold">{project.title}</h3>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-muted-foreground">{project.shortDescription}</p>
                      <div className="mt-5 flex flex-wrap gap-2">
                        {project.technologies.split(",").slice(0, 3).map(tag => (
                          <span key={tag} className="tag">
                            {tag.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
              {!projectsQuery.isLoading && !featuredProjects.length && <div className="empty-state lg:col-span-3">Ajoutez un projet vedette depuis l'administration.</div>}
            </motion.div>
          </div>
        </section>

        <section id="contact" className="section-shell section-contact">
          <div className="container grid gap-12 lg:grid-cols-[.8fr_1.2fr] lg:items-start">
            <ScrollReveal>
              <SectionHeading eyebrow={profile.contactEyebrow} title={profile.contactTitle} description={profile.contactDescription} />
              <div className="mt-8 space-y-4">
                <a href={`mailto:${profile.email}`} className="contact-line">
                  <span className="contact-icon">
                    <Mail className="h-4 w-4" />
                  </span>
                  <span>
                    <span className="block text-xs text-muted-foreground">Email</span>
                    <span className="text-sm font-medium">{profile.email}</span>
                  </span>
                </a>
                <div className="contact-line">
                  <span className="contact-icon">
                    <UserRound className="h-4 w-4" />
                  </span>
                  <span>
                    <span className="block text-xs text-muted-foreground">Disponibilité</span>
                    <span className="text-sm font-medium">
                      {profile.availability} · {profile.phone}
                    </span>
                  </span>
                </div>
              </div>
            </ScrollReveal>
            <ScrollReveal className="delay-1">
              <form className="contact-form" onSubmit={handleSubmit(submitMessage)} noValidate>
                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="field">
                    <span>Nom</span>
                    <input {...register("name")} placeholder="Votre nom" />
                    {errors.name && <small>{errors.name.message}</small>}
                  </label>
                  <label className="field">
                    <span>Email</span>
                    <input {...register("email")} type="email" placeholder="vous@exemple.com" />
                    {errors.email && <small>{errors.email.message}</small>}
                  </label>
                </div>
                <label className="field">
                  <span>Sujet</span>
                  <input {...register("subject")} placeholder="Parlons de votre projet" />
                  {errors.subject && <small>{errors.subject.message}</small>}
                </label>
                <label className="field">
                  <span>Message</span>
                  <textarea {...register("message")} rows={5} placeholder="Quelques lignes sur votre besoin..." />
                  {errors.message && <small>{errors.message.message}</small>}
                </label>
                <input {...register("honeypot")} className="hidden" tabIndex={-1} autoComplete="off" />
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-muted-foreground">Réponse sous 48h · Aucun spam</p>
                  <button type="submit" className="button-primary" disabled={messageMutation.isPending}>
                    {messageMutation.isPending ? "Envoi..." : "Envoyer"} <Send className="h-4 w-4" />
                  </button>
                </div>
              </form>
            </ScrollReveal>
          </div>
        </section>
      </main>
    </SiteLayout>
  );
}
