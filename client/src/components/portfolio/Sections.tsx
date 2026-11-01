import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Send } from "lucide-react";
import { toast } from "sonner";
import type { AboutCard, Certification, Education, Language, Skill, Strength } from "@shared/types";
import { trpc } from "@/lib/trpc";
import { skillLevel, skillLevelLabel, useProfile } from "@/lib/profile";
import { Reveal, Section } from "@/components/SiteLayout";

export function AboutSection({ cards, strengths, languages }: { cards: AboutCard[]; strengths: Strength[]; languages: Language[] }) {
  const profile = useProfile();
  return (
    <Section id="about" command={<>cat <span className="tok-path">profil.md</span></>} title={profile.aboutTitle}>
      <div className="grid gap-10 lg:grid-cols-12">
        <Reveal className="lg:col-span-7">
          <p className="text-lg leading-8 md:text-xl md:leading-9">{profile.aboutDescription}</p>
        </Reveal>
        <Reveal className="space-y-6 lg:col-span-4 lg:col-start-9" delay={0.06}>
          {strengths.length > 0 && (
            <div className="pane">
              <div className="pane-bar">atouts.todo</div>
              <ul className="pane-body space-y-1.5">
                {strengths.map(item => (
                  <li key={item.id}>
                    <span className="text-primary" aria-hidden="true">[x]</span> {item.label}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {languages.length > 0 && (
            <div className="pane">
              <div className="pane-bar">langues.json</div>
              <dl className="pane-body">
                {languages.map((item, index) => (
                  <div key={item.id}>
                    <dt className="inline text-cyan">"{item.name}"</dt>: <dd className="inline tok-str">"{item.level}"</dd>
                    {index < languages.length - 1 && ","}
                  </div>
                ))}
              </dl>
            </div>
          )}
        </Reveal>
      </div>

      {cards.length > 0 && (
        <ol className="mt-14 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map((card, index) => (
            <Reveal as="li" key={card.id} delay={index * 0.05} className="pane">
              <div className="pane-bar">
                <span className="text-primary">## {card.label}</span>
              </div>
              <div className="pane-body font-sans text-[15px] leading-7">
                <h3 className="font-mono text-lg font-bold">{card.title}</h3>
                <p className="mt-2 text-muted-foreground">{card.description}</p>
              </div>
            </Reveal>
          ))}
        </ol>
      )}
    </Section>
  );
}

export function SkillsSection({ skills }: { skills: Skill[] }) {
  const profile = useProfile();
  const groups = skills.reduce<Record<string, Skill[]>>((acc, skill) => {
    (acc[skill.category] ??= []).push(skill);
    return acc;
  }, {});
  return (
    <Section id="skills" command={<>skills <span className="tok-str">--par-categorie</span></>} title={profile.skillsTitle} description={profile.skillsDescription}>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Object.entries(groups).map(([category, items], index) => (
          <Reveal key={category} delay={index * 0.04} className="pane">
            <div className="pane-bar">
              <span className="text-cyan">{category.toLowerCase()}/</span>
              <span className="ml-auto">{items.length}</span>
            </div>
            <ul className="pane-body space-y-2.5">
              {items.map(skill => (
                <li key={skill.id} className="grid grid-cols-[1fr_auto] items-center gap-3" title={skill.description ?? undefined}>
                  <span className="truncate">{skill.name}</span>
                  <SkillMeter level={skill.level} />
                </li>
              ))}
            </ul>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

/** Jauge ASCII + libellé textuel : le niveau ne repose jamais sur la couleur seule. */
function SkillMeter({ level }: { level: Skill["level"] }) {
  const filled = skillLevel[level] * 3;
  return (
    <span className="flex items-center gap-2">
      <span className="meter" aria-hidden="true">
        {"█".repeat(filled)}
        <span className="off">{"█".repeat(9 - filled)}</span>
      </span>
      <span className="w-[5.5rem] text-right text-[11px] text-muted-foreground">{skillLevelLabel[level].toLowerCase()}</span>
    </span>
  );
}

const fakeHash = (seed: string) => Array.from(seed).reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7).toString(16).padStart(7, "0").slice(0, 7);

export function JourneySection({ educations, certifications }: { educations: Education[]; certifications: Certification[] }) {
  const profile = useProfile();
  return (
    <Section id="journey" command={<>git log <span className="tok-str">--graph</span> <span className="tok-path">parcours</span></>} title={profile.certificationsTitle} description={profile.certificationsDescription}>
      <div className="grid gap-4 xl:grid-cols-2">
        {educations.length > 0 && (
          <Reveal className="pane">
            <div className="pane-bar">formations — git log</div>
            <ol className="pane-body">
              {educations.map((item, index) => (
                <li key={item.id} className="grid grid-cols-[1.25rem_1fr] gap-x-2">
                  <span className="flex flex-col items-center text-primary" aria-hidden="true">
                    <span>*</span>
                    {index < educations.length - 1 && <span className="w-px flex-1 bg-border" />}
                  </span>
                  <div className="pb-5">
                    <p>
                      <span className="tok-str">{fakeHash(item.title)}</span>{" "}
                      {index === 0 && <span className="text-cyan">(HEAD → en cours) </span>}
                      <span className="font-bold">{item.title}</span>
                    </p>
                    <p className="text-muted-foreground">
                      {item.institution}
                      {item.location ? ` · ${item.location}` : ""} · {item.period}
                    </p>
                    {item.description && <p className="mt-1 font-sans text-[14px] leading-6 text-muted-foreground">{item.description}</p>}
                  </div>
                </li>
              ))}
            </ol>
          </Reveal>
        )}
        {certifications.length > 0 && (
          <Reveal className="pane" delay={0.06}>
            <div className="pane-bar">certifications — git tag</div>
            <ul className="pane-body space-y-4">
              {certifications.map(item => (
                <li key={item.id}>
                  <p>
                    <span className="rounded-sm bg-primary px-1.5 font-bold text-primary-foreground">v{item.dateLabel}</span>{" "}
                    {item.linkUrl ? (
                      <a href={item.linkUrl} target="_blank" rel="noreferrer" className="link-mono font-bold">
                        {item.title}
                      </a>
                    ) : (
                      <span className="font-bold">{item.title}</span>
                    )}
                  </p>
                  <p className="text-muted-foreground">
                    {item.issuer} · <span className="tok-str">{item.type.toLowerCase()}</span>
                  </p>
                </li>
              ))}
            </ul>
          </Reveal>
        )}
      </div>
    </Section>
  );
}

const contactSchema = z.object({
  name: z.string().trim().min(2, "nom requis (2 caractères minimum)"),
  email: z.string().email("adresse email invalide"),
  subject: z.string().trim().min(3, "sujet trop court (3 caractères minimum)"),
  message: z.string().trim().min(20, "message trop court (20 caractères minimum)"),
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
    onError: error => toast.error(error.message || "Impossible d'envoyer le message."),
  });

  const field = (name: keyof Omit<ContactValues, "honeypot">) => ({
    ...register(name),
    "aria-invalid": Boolean(errors[name]),
    "aria-describedby": errors[name] ? `${name}-error` : undefined,
  });

  return (
    <Section id="contact" command={<>./<span className="text-primary">contact.sh</span></>} title={profile.contactTitle} description={profile.contactDescription}>
      <div className="grid gap-6 lg:grid-cols-12">
        <Reveal className="pane lg:col-span-4">
          <div className="pane-bar">coordonnees.env</div>
          <dl className="pane-body space-y-3">
            {[
              { key: "EMAIL", value: profile.email, href: `mailto:${profile.email}` },
              { key: "TEL", value: profile.phone, href: `tel:${profile.phone.replace(/\s+/g, "")}` },
              { key: "DISPO", value: profile.availability },
              { key: "LIEU", value: profile.heroLocation },
            ].map(item => (
              <div key={item.key}>
                <dt className="text-cyan">{item.key}=</dt>
                <dd className="break-words">
                  {item.href ? (
                    <a href={item.href} className="link-mono">
                      "{item.value}"
                    </a>
                  ) : (
                    <span className="tok-str">"{item.value}"</span>
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>
        <Reveal className="pane lg:col-span-8" delay={0.06}>
          <div className="pane-bar">contact.sh — nouveau message</div>
          <form className="pane-body grid gap-5" onSubmit={handleSubmit(values => messageMutation.mutate(values))} noValidate>
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="field-line">
                <span><b>?</b> nom *</span>
                <input {...field("name")} autoComplete="name" placeholder="Votre nom" />
                {errors.name && <small id="name-error" role="alert">✗ {errors.name.message}</small>}
              </label>
              <label className="field-line">
                <span><b>?</b> email *</span>
                <input {...field("email")} type="email" autoComplete="email" placeholder="vous@entreprise.com" />
                {errors.email && <small id="email-error" role="alert">✗ {errors.email.message}</small>}
              </label>
            </div>
            <label className="field-line">
              <span><b>?</b> sujet *</span>
              <input {...field("subject")} placeholder="Proposition de stage, projet, question…" />
              {errors.subject && <small id="subject-error" role="alert">✗ {errors.subject.message}</small>}
            </label>
            <label className="field-line">
              <span><b>?</b> message *</span>
              <textarea {...field("message")} rows={5} placeholder="Quelques lignes sur votre besoin" />
              {errors.message && <small id="message-error" role="alert">✗ {errors.message.message}</small>}
            </label>
            <input {...register("honeypot")} className="hidden" tabIndex={-1} autoComplete="off" aria-hidden="true" />
            <div className="flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="mono-label">* champs requis · réponse sous 48 h</p>
              <button type="submit" className="button-primary" disabled={messageMutation.isPending}>
                {messageMutation.isPending ? "envoi en cours…" : "envoyer ↵"} <Send className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </form>
        </Reveal>
      </div>
    </Section>
  );
}
