import { useEffect, useRef } from "react";
import { ArrowUpRight } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useProfile } from "@/lib/profile";
import { Hop, Reveal, SiteLayout } from "@/components/SiteLayout";
import { Hero } from "@/components/portfolio/Hero";
import { ProjectIndex } from "@/components/portfolio/ProjectIndex";
import { AboutSection, ContactSection, JourneySection, SkillsSection } from "@/components/portfolio/Sections";

const fallbackCards = [
  { id: 1, label: "01", title: "Construire", description: "Des interfaces accessibles et des APIs qui restent compréhensibles quand le produit grandit.", displayOrder: 1, createdAt: new Date(), updatedAt: new Date() },
  { id: 2, label: "02", title: "Comprendre", description: "Un double parcours qui relie les fondamentaux des réseaux, la sécurité informatique et la construction de logiciels utiles.", displayOrder: 2, createdAt: new Date(), updatedAt: new Date() },
  { id: 3, label: "03", title: "Sécuriser", description: "Validation côté serveur, moindre privilège et défense en profondeur dès la conception.", displayOrder: 3, createdAt: new Date(), updatedAt: new Date() },
  { id: 4, label: "04", title: "Progresser", description: "Apprendre vite, documenter les décisions et livrer des améliorations mesurables.", displayOrder: 4, createdAt: new Date(), updatedAt: new Date() },
];

const HOME_PROJECT_LIMIT = 5;

export default function Home() {
  const profile = useProfile();
  const options = { staleTime: 60_000 };
  const queries = {
    projects: trpc.public.projects.useQuery(undefined, options),
    skills: trpc.public.skills.useQuery(undefined, options),
    aboutCards: trpc.public.aboutCards.useQuery(undefined, options),
    strengths: trpc.public.strengths.useQuery(undefined, options),
    languages: trpc.public.languages.useQuery(undefined, options),
    educations: trpc.public.educations.useQuery(undefined, options),
    certifications: trpc.public.certifications.useQuery(undefined, options),
  };
  const projects = queries.projects.data ?? [];
  const skills = queries.skills.data ?? [];
  const aboutCards = queries.aboutCards.data ?? fallbackCards;
  const strengths = queries.strengths.data ?? [];
  const languages = queries.languages.data ?? [];
  const educations = queries.educations.data ?? [];
  const certifications = queries.certifications.data ?? [];
  const loading = Object.values(queries).some(query => query.isLoading);

  // Les sections n'existent qu'une fois les données chargées : on rejoue l'ancre (/#skills…) à ce moment-là.
  const anchorHandled = useRef(false);
  useEffect(() => {
    if (loading || anchorHandled.current) return;
    anchorHandled.current = true;
    const target = window.location.hash && document.getElementById(window.location.hash.slice(1));
    if (target) requestAnimationFrame(() => target.scrollIntoView());
  }, [loading]);
  const titleWords = profile.projectsTitle.trim().split(" ");

  return (
    <SiteLayout>
      <main>
        <Hero educations={educations} projects={projects} />

        {projects.length > 0 && (
          <Hop id="projects" number="01" label="Projets">
            <Reveal className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <div>
                <h2 className="section-title">
                  {titleWords.slice(0, -1).join(" ")} <em>{titleWords.at(-1)}</em>
                </h2>
                <p className="mt-6 max-w-2xl text-[15px] leading-7 text-muted-foreground">{profile.projectsDescription}</p>
              </div>
              <span className="mono-label shrink-0">{String(projects.length).padStart(2, "0")} projets publiés</span>
            </Reveal>
            <div className="mt-14">
              <ProjectIndex projects={projects.slice(0, HOME_PROJECT_LIMIT)} />
            </div>
            <Link href="/projects" className="group mt-10 inline-flex items-center gap-2 text-sm font-medium">
              <span className="link-underline">Voir l'index complet</span>
              <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </Hop>
        )}

        <AboutSection cards={aboutCards} strengths={strengths} languages={languages} />
        {skills.length > 0 && <SkillsSection skills={skills} />}
        {(educations.length > 0 || certifications.length > 0) && <JourneySection educations={educations} certifications={certifications} />}
        <ContactSection />
      </main>
    </SiteLayout>
  );
}
