import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";

// Valeurs affichées tant que l'API n'a pas répondu (ou si la base est indisponible).
// Elles reprennent les valeurs par défaut de drizzle/schema.ts.
export const fallbackProfile = {
  displayName: "Ted Yvan KAMANAN",
  fullName: "Konin Ted Yvan Axel Kamanan",
  role: "Recherche de stage en Génie Logiciel et Réseaux",
  heroEyebrow: "À la recherche d'un stage",
  heroLocation: "Abidjan · Bouaké",
  heroTitle: "Je développe des solutions",
  heroTitleAccent: "claires.",
  heroSubtitle: "Je sécurise mes applications.",
  heroDescription: "Étudiant en Réseaux & Sécurité Informatique et en Génie Logiciel, je conçois des applications web et mobiles avec une forte capacité d'analyse et d'adaptation. Je recherche un stage pour évoluer vers le développement Full Stack.",
  heroTags: "Flutter · Dart · React,Node.js · Express · PostgreSQL,JWT · Sécurité des API",
  codeFocus: "full-stack",
  codeMindset: "secure-by-design",
  codeStack: "Flutter,React,Node.js,PostgreSQL",
  codeStatus: "building",
  aboutTitle: "Une approche hybride, entre produit et infrastructure.",
  aboutDescription: "Je suis Konin Ted Yvan Axel Kamanan, étudiant en Licence 3 Réseaux et Sécurité Informatique à l'UVCI et en Licence 3 Génie Logiciel à l'Université Nord-Sud de Bouaké. Je combine une formation en développement web et mobile avec rigueur, curiosité technique et volonté d'apprendre les bonnes pratiques (Git, bases de données, sécurité), pour évoluer comme stagiaire puis développeur Full Stack.",
  skillsTitle: "Les outils que j'utilise pour passer de l'idée au produit.",
  skillsDescription: "Une base technique en progression constante, organisée autour de la qualité, de la simplicité et de la sécurité.",
  certificationsTitle: "Des bases solides, toujours en mouvement.",
  certificationsDescription: "Des certifications et formations qui reflètent mon parcours entre réseaux, cybersécurité et génie logiciel.",
  projectsTitle: "Quelques problèmes transformés en interfaces.",
  projectsDescription: "Des projets d'apprentissage et de production qui illustrent ma manière de penser le produit de bout en bout.",
  contactTitle: "Construisons quelque chose d'utile.",
  contactDescription: "Vous avez un projet web, une idée à prototyper ou simplement envie d'échanger ? Écrivez-moi, je réponds sous 48 heures.",
  email: "y.vannky10@gmail.com",
  phone: "+225 07 58 11 79 44",
  availability: "Stage · Télétravail ou présentiel",
  githubUrl: "https://github.com/TedYvan1",
  linkedinUrl: "https://www.linkedin.com/in/ted-yvan-kamanan-7b752038b",
  cvUrl: "/cv.pdf",
  footerBio: "Étudiant en réseaux, sécurité informatique et génie logiciel, à la recherche d'un stage.",
};

export type Profile = typeof fallbackProfile;

export function useProfile(): Profile {
  const { data } = trpc.public.siteProfile.useQuery(undefined, { staleTime: 60_000 });
  return { ...fallbackProfile, ...(data ?? {}) } as Profile;
}

export const splitList = (value: string, separator = ",") => value.split(separator).map(item => item.trim()).filter(Boolean);

// Heure locale d'Abidjan (GMT), rafraîchie chaque minute.
export function useAbidjanTime() {
  const format = () => new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit", timeZone: "Africa/Abidjan" }).format(new Date());
  const [time, setTime] = useState(format);
  useEffect(() => {
    const id = window.setInterval(() => setTime(format()), 30_000);
    return () => window.clearInterval(id);
  }, []);
  return time;
}

export const skillLevel = { Beginner: 1, Intermediate: 2, Advanced: 3 } as const;
export const skillLevelLabel = { Beginner: "Débutant", Intermediate: "Intermédiaire", Advanced: "Avancé" } as const;
