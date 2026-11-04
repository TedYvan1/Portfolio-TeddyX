import type { Localized } from "@/i18n/config";

export type Profile = {
  full_name: string;
  display_name: string;
  role: Localized;
  headline: Localized;
  bio: Localized;
  location: string;
  email: string;
  phone: string | null;
  availability: Localized;
  seeking: Localized;
  github_url: string | null;
  linkedin_url: string | null;
  cv_path: string | null;
  photo_path: string | null;
};

export type Project = {
  slug: string;
  title: Localized;
  summary: Localized;
  context: Localized;
  my_role: Localized;
  challenges: Localized;
  solution: Localized;
  results: Localized;
  category: string;
  tech: string[];
  cover_path: string | null;
  gallery: string[];
  github_url: string | null;
  live_url: string | null;
  status: "in_progress" | "done";
  year: number | null;
  featured: boolean;
};

export type Lab = {
  slug: string;
  title: Localized;
  summary: Localized;
  body: Localized;
  platform: string;
  tools: string[];
  cover_path: string | null;
  done_on: string | null;
};

export type SkillCategory = { name: Localized; skills: { name: string; level: 1 | 2 | 3 }[] };
export type Education = { title: Localized; institution: string; location: string | null; period: Localized; description: Localized };
export type Certification = { title: Localized; issuer: string; year: number | null; kind: Localized; url: string | null };
export type LanguageItem = { name: Localized; level: Localized };
export type Strength = { label: Localized };
export type Principle = { title: Localized; body: Localized };

export type SiteContent = {
  profile: Profile;
  projects: Project[];
  labs: Lab[];
  skills: SkillCategory[];
  educations: Education[];
  certifications: Certification[];
  languages: LanguageItem[];
  strengths: Strength[];
  principles: Principle[];
};
