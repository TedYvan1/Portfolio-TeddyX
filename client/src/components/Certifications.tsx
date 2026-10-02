import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { Award, CalendarDays, ChevronDown, ExternalLink, ShieldCheck, Sparkles } from "lucide-react";
import { useRef, useState } from "react";
import { ScrollReveal, SectionHeading } from "@/components/SiteLayout";
import { trpc } from "@/lib/trpc";
import { TiltCard } from "@/components/effects/TiltCard";

const fallbackCerts = [
  { id: 1, title: "Notions de base sur les réseaux", issuer: "Cybastion IT Academy", dateLabel: "2026", type: "Réseaux", description: "Certification qui renforce les fondamentaux des réseaux et la compréhension des échanges entre systèmes.", linkUrl: null as string | null },
  { id: 2, title: "Introduction à la cybersécurité", issuer: "Cisco Networking Academy", dateLabel: "2025", type: "Sécurité", description: "Premiers repères sur les menaces, la protection des systèmes et les bonnes pratiques de cybersécurité.", linkUrl: null as string | null },
  { id: 3, title: "Licence 3 — Réseaux & Sécurité Informatique", issuer: "Université Virtuelle de Côte d'Ivoire", dateLabel: "Depuis 2024", type: "Formation", description: "Formation universitaire centrée sur les réseaux, la sécurité informatique et l'analyse des infrastructures.", linkUrl: null as string | null },
  { id: 4, title: "Licence 2 — Génie Logiciel", issuer: "Université Nord-Sud · Bouaké", dateLabel: "Depuis 2024", type: "Formation", description: "Parcours complémentaire consacré à la conception, au développement et à la maintenance de logiciels.", linkUrl: null as string | null },
];

export default function Certifications() {
  const sectionRef = useRef<HTMLElement>(null);
  const [expanded, setExpanded] = useState<number | null>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const x = useTransform(scrollYProgress, [0, 1], ["2%", reduceMotion ? "2%" : "-30%"]);
  const certsQuery = trpc.public.certifications.useQuery(undefined, { staleTime: 60_000 });
  const certifications = (certsQuery.data as typeof fallbackCerts | undefined) ?? fallbackCerts;
  const profileQuery = trpc.public.siteProfile.useQuery(undefined, { staleTime: 60_000 });
  const profile = profileQuery.data as any;

  return (
    <section ref={sectionRef} id="certifications" className="section-shell section-tint certification-section">
      <div className="container">
        <ScrollReveal>
          <SectionHeading
            eyebrow={profile?.certificationsEyebrow ?? "03 / Certifications"}
            title={profile?.certificationsTitle ?? "Des bases solides, toujours en mouvement."}
            description={profile?.certificationsDescription ?? "Des certifications et formations qui reflètent mon parcours entre réseaux, cybersécurité et génie logiciel."}
          />
        </ScrollReveal>
      </div>
      <div className="certification-window">
        <motion.div className="certification-track" style={{ x }}>
          {certifications.map((certification, index) => (
            <TiltCard key={certification.id ?? certification.title} maxTilt={6} className="shrink-0">
              <motion.button
                layout
                onClick={() => setExpanded(expanded === index ? null : index)}
                className={`certification-card ${expanded === index ? "expanded" : ""}`}
                whileHover={reduceMotion ? undefined : { y: -8 }}
                transition={{ layout: { duration: 0.35, ease: [0.23, 1, 0.32, 1] } }}
                aria-expanded={expanded === index}
              >
                <div className="certification-topline">
                  <span className="certification-number">0{index + 1}</span>
                  <span className="certification-icon">
                    <Award className="h-4 w-4" />
                  </span>
                </div>
                <div className="mt-12 text-left">
                  <span className="eyebrow text-[10px]">{certification.type}</span>
                  <h3 className="mt-3 font-display text-xl font-semibold leading-tight">{certification.title}</h3>
                  <p className="mt-3 text-sm font-medium text-primary">{certification.issuer}</p>
                </div>
                <div className="certification-footer">
                  <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                    <CalendarDays className="h-3.5 w-3.5" /> {certification.dateLabel}
                  </span>
                  <span className="certification-expand">
                    <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${expanded === index ? "rotate-180" : ""}`} />
                  </span>
                </div>
                <AnimatePresence initial={false}>
                  {expanded === index && (
                    <motion.div
                      className="certification-detail"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <p>{certification.description}</p>
                      {certification.linkUrl ? (
                        <a href={certification.linkUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 text-xs font-medium text-primary">
                          Voir le parcours <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      ) : (
                        <span className="mt-4 inline-flex items-center gap-2 text-xs font-medium text-primary">
                          Voir le parcours <ExternalLink className="h-3.5 w-3.5" />
                        </span>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </TiltCard>
          ))}
          <div className="certification-endnote">
            <Sparkles className="h-5 w-5 text-primary" />
            <p>Apprendre, documenter, appliquer.</p>
            <span>Chaque certification devient un projet concret.</span>
          </div>
        </motion.div>
      </div>
      <div className="container certification-caption">
        <ShieldCheck className="h-4 w-4 text-primary" /> Faites défiler pour explorer les certifications
      </div>
    </section>
  );
}
