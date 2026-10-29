import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowUpRight, Send } from "lucide-react";
import { toast } from "sonner";
import type { AboutCard, Certification, Education, Language, Skill, Strength } from "@shared/types";
import { trpc } from "@/lib/trpc";
import { skillLevel, skillLevelLabel, useProfile } from "@/lib/profile";
import { Hop, Reveal } from "@/components/SiteLayout";

/** Met en italique et en couleur le dernier mot d'un titre éditorial. */
function EditorialTitle({ text, as: Tag = "h2" }: { text: string; as?: "h2" | "h3" }) {
  const words = text.trim().split(" ");
  const last = words.pop();
  return (
    <Tag className="section-title">
      {words.join(" ")} <em>{last}</em>
    </Tag>
  );
}

export function AboutSection({ cards, strengths, languages }: { cards: AboutCard[]; strengths: Strength[]; languages: Language[] }) {
  const profile = useProfile();
  return (
    <Hop id="about" number="02" label="Profil">
      <Reveal>
        <EditorialTitle text={profile.aboutTitle} />
      </Reveal>
      <div className="mt-12 grid gap-12 md:grid-cols-12">
        <Reveal className="md:col-span-7">
          <p className="text-lg leading-8 md:text-xl md:leading-9">{profile.aboutDescription}</p>
        </Reveal>
        <Reveal className="space-y-8 md:col-span-4 md:col-start-9" delay={0.1}>
          {strengths.length > 0 && (
            <div>
              <p className="mono-label">Atouts</p>
              <ul className="mt-3 space-y-2 text-[15px]">
                {strengths.map(item => (
                  <li key={item.id} className="flex gap-3">
                    <span className="text-primary">+</span>
                    {item.label}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {languages.length > 0 && (
            <div>
              <p className="mono-label">Langues</p>
              <dl className="mt-3 divide-y divide-foreground/10 border-y border-foreground/10">
                {languages.map(item => (
                  <div key={item.id} className="flex items-baseline justify-between gap-4 py-2.5 text-[15px]">
                    <dt>{item.name}</dt>
                    <dd className="font-mono text-[11px] uppercase tracking-[.12em] text-muted-foreground">{item.level}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </Reveal>
      </div>

      {cards.length > 0 && (
        <ol className="mt-20 grid border-t border-foreground/15 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map((card, index) => (
            <Reveal as="li" key={card.id} delay={index * 0.06} className="border-b border-foreground/15 py-8 sm:pr-8 xl:border-b-0 xl:border-r xl:px-6 xl:first:pl-0 xl:last:border-r-0">
              <span className="font-mono text-[11px] text-primary">{card.label}</span>
              <h3 className="mt-4 font-serif text-3xl italic">{card.title}</h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{card.description}</p>
            </Reveal>
          ))}
        </ol>
      )}
    </Hop>
  );
}

export function SkillsSection({ skills }: { skills: Skill[] }) {
  const profile = useProfile();
  const groups = skills.reduce<Record<string, Skill[]>>((acc, skill) => {
    (acc[skill.category] ??= []).push(skill);
    return acc;
  }, {});
  return (
    <Hop id="skills" number="03" label="Compétences" className="bg-card/60">
      <Reveal>
        <EditorialTitle text={profile.skillsTitle} />
        <p className="mt-6 max-w-2xl text-[15px] leading-7 text-muted-foreground">{profile.skillsDescription}</p>
      </Reveal>
      <div className="mt-6 flex items-center gap-4 font-mono text-[11px] uppercase tracking-[.12em] text-muted-foreground" aria-hidden="true">
        {(["Beginner", "Intermediate", "Advanced"] as const).map(level => (
          <span key={level} className="inline-flex items-center gap-2">
            <SkillLevel level={level} /> {skillLevelLabel[level]}
          </span>
        ))}
      </div>
      <div className="mt-12 border-t border-foreground/80">
        {Object.entries(groups).map(([category, items], index) => (
          <Reveal key={category} delay={index * 0.04} className="grid gap-6 border-b border-foreground/15 py-8 md:grid-cols-12">
            <div className="md:col-span-4">
              <span className="font-mono text-[11px] text-muted-foreground">{String(index + 1).padStart(2, "0")}</span>
              <h3 className="mt-1 font-serif text-4xl italic leading-none">{category}</h3>
            </div>
            <ul className="grid gap-x-8 gap-y-3 sm:grid-cols-2 md:col-span-8">
              {items.map(skill => (
                <li key={skill.id} className="group flex items-center justify-between gap-4 border-b border-dashed border-foreground/10 pb-3" title={skill.description ?? undefined}>
                  <span className="text-[15px] transition-colors group-hover:text-primary">{skill.name}</span>
                  <SkillLevel level={skill.level} />
                </li>
              ))}
            </ul>
          </Reveal>
        ))}
      </div>
    </Hop>
  );
}

function SkillLevel({ level }: { level: Skill["level"] }) {
  const value = skillLevel[level];
  return (
    <span className="skill-level shrink-0" role="img" aria-label={`Niveau : ${skillLevelLabel[level]}`}>
      {[1, 2, 3].map(step => (
        <i key={step} className={step <= value ? "on" : ""} />
      ))}
    </span>
  );
}

export function JourneySection({ educations, certifications }: { educations: Education[]; certifications: Certification[] }) {
  const profile = useProfile();
  return (
    <Hop id="journey" number="04" label="Parcours">
      <Reveal>
        <EditorialTitle text={profile.certificationsTitle} />
        <p className="mt-6 max-w-2xl text-[15px] leading-7 text-muted-foreground">{profile.certificationsDescription}</p>
      </Reveal>
      <div className="mt-14 grid gap-16 xl:grid-cols-2 xl:gap-12">
        {educations.length > 0 && (
          <div>
            <p className="mono-label border-b border-foreground/80 pb-3 text-foreground">Formations</p>
            <ol>
              {educations.map((item, index) => (
                <Reveal as="li" key={item.id} delay={index * 0.05} className="grid grid-cols-[6.5rem_1fr] gap-4 border-b border-foreground/15 py-6 sm:grid-cols-[8.5rem_1fr]">
                    <span className="pt-1 font-mono text-[11px] uppercase leading-5 tracking-[.1em] text-muted-foreground">{item.period}</span>
                    <span>
                      <span className="block text-lg font-medium leading-snug">{item.title}</span>
                      <span className="mt-1 block text-sm text-muted-foreground">
                        {item.institution}
                        {item.location ? ` — ${item.location}` : ""}
                      </span>
                      {item.description && <span className="mt-3 block text-sm leading-6 text-muted-foreground">{item.description}</span>}
                    </span>
                </Reveal>
              ))}
            </ol>
          </div>
        )}
        {certifications.length > 0 && (
          <div>
            <p className="mono-label border-b border-foreground/80 pb-3 text-foreground">Certifications</p>
            <ol>
              {certifications.map((item, index) => (
                <Reveal as="li" key={item.id} delay={index * 0.05} className="grid grid-cols-[6.5rem_1fr] gap-4 border-b border-foreground/15 py-6 sm:grid-cols-[8.5rem_1fr]">
                    <span className="font-serif text-4xl leading-none text-primary">{item.dateLabel}</span>
                    <span>
                      <span className="block text-lg font-medium leading-snug">
                        {item.linkUrl ? (
                          <a href={item.linkUrl} target="_blank" rel="noreferrer" className="link-underline">
                            {item.title}
                          </a>
                        ) : (
                          item.title
                        )}
                      </span>
                      <span className="mt-1 block text-sm text-muted-foreground">{item.issuer}</span>
                      <span className="mono-label mt-3 inline-block border border-foreground/20 px-2 py-0.5">{item.type}</span>
                    </span>
                </Reveal>
              ))}
            </ol>
          </div>
        )}
      </div>
    </Hop>
  );
}

const contactSchema = z.object({
  name: z.string().trim().min(2, "Votre nom est requis"),
  email: z.string().email("Email invalide"),
  subject: z.string().trim().min(3, "Sujet trop court"),
  message: z.string().trim().min(20, "Décrivez votre besoin en au moins 20 caractères"),
  honeypot: z.string().max(0).optional(),
});
type ContactValues = z.infer<typeof contactSchema>;

export function ContactSection() {
  const profile = useProfile();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ContactValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", subject: "", message: "", honeypot: "" },
  });
  const messageMutation = trpc.public.createMessage.useMutation({
    onSuccess: () => {
      toast.success("Message envoyé. Je vous réponds rapidement.");
      reset();
    },
    onError: error => toast.error(error.message || "Impossible d'envoyer le message"),
  });

  return (
    <Hop id="contact" number="05" label="Contact" className="border-t border-foreground/15">
      <Reveal>
        <EditorialTitle text={profile.contactTitle} />
        <p className="mt-6 max-w-2xl text-[15px] leading-7 text-muted-foreground">{profile.contactDescription}</p>
      </Reveal>
      <Reveal delay={0.08}>
        <a href={`mailto:${profile.email}`} className="group mt-12 inline-flex max-w-full items-center gap-3 break-all font-sans font-semibold tracking-[-.03em] transition-colors hover:text-primary" style={{ fontSize: "clamp(1.4rem, 4.4vw, 3.6rem)" }}>
          <span className="link-underline">{profile.email}</span>
          <ArrowUpRight className="h-[.8em] w-[.8em] shrink-0 transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1" />
        </a>
      </Reveal>
      <div className="mt-14 grid gap-12 md:grid-cols-12">
        <Reveal className="space-y-5 md:col-span-4">
          {[
            { label: "Disponibilité", value: profile.availability },
            { label: "Téléphone", value: profile.phone, href: `tel:${profile.phone.replace(/\s+/g, "")}` },
            { label: "Basé à", value: profile.heroLocation },
          ].map(item => (
            <div key={item.label} className="border-b border-foreground/15 pb-4">
              <p className="mono-label">{item.label}</p>
              {item.href ? (
                <a href={item.href} className="mt-1.5 block text-[15px] hover:text-primary">{item.value}</a>
              ) : (
                <p className="mt-1.5 text-[15px]">{item.value}</p>
              )}
            </div>
          ))}
        </Reveal>
        <Reveal className="md:col-span-8" delay={0.08}>
          <form className="grid gap-8" onSubmit={handleSubmit(values => messageMutation.mutate(values))} noValidate>
            <div className="grid gap-8 sm:grid-cols-2">
              <label className="field-line">
                <span>Nom</span>
                <input {...register("name")} autoComplete="name" placeholder="Votre nom" aria-invalid={Boolean(errors.name)} />
                {errors.name && <small>{errors.name.message}</small>}
              </label>
              <label className="field-line">
                <span>Email</span>
                <input {...register("email")} type="email" autoComplete="email" placeholder="vous@entreprise.com" aria-invalid={Boolean(errors.email)} />
                {errors.email && <small>{errors.email.message}</small>}
              </label>
            </div>
            <label className="field-line">
              <span>Sujet</span>
              <input {...register("subject")} placeholder="Proposition de stage, projet, question…" aria-invalid={Boolean(errors.subject)} />
              {errors.subject && <small>{errors.subject.message}</small>}
            </label>
            <label className="field-line">
              <span>Message</span>
              <textarea {...register("message")} rows={4} placeholder="Quelques lignes sur votre besoin" aria-invalid={Boolean(errors.message)} />
              {errors.message && <small>{errors.message.message}</small>}
            </label>
            <input {...register("honeypot")} className="hidden" tabIndex={-1} autoComplete="off" aria-hidden="true" />
            <div className="flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="mono-label">Réponse sous 48 h</p>
              <button type="submit" className="button-primary" disabled={messageMutation.isPending}>
                {messageMutation.isPending ? "Envoi…" : "Envoyer le message"} <Send className="h-4 w-4" />
              </button>
            </div>
          </form>
        </Reveal>
      </div>
    </Hop>
  );
}
