import { cacheLife, cacheTag } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";
import { fallbackContent } from "./fallback-content";
import type { Lab, Project, SiteContent } from "./types";

/** Étiquette de cache de tout le contenu public : l'admin l'invalide après chaque modification. */
export const CONTENT_TAG = "content";

const PROJECT_FIELDS = "slug,title,summary,context,my_role,challenges,solution,results,category,tech,cover_path,gallery,github_url,live_url,status,year,featured";
const LAB_FIELDS = "slug,title,summary,body,platform,tools,cover_path,done_on";

/**
 * Tout le contenu public en une lecture mise en cache (quelques Ko : un seul aller-retour pour toutes les pages).
 * Sans Supabase configuré, le contenu de secours (repris du CV) est utilisé.
 */
export async function getContent(): Promise<SiteContent> {
  "use cache";
  cacheLife("hours");
  cacheTag(CONTENT_TAG);

  const supabase = createPublicClient();
  if (!supabase) return fallbackContent;

  const order = { ascending: true };
  const [profile, projects, labs, categories, educations, certifications, languages, strengths, principles] = await Promise.all([
    supabase.from("profile").select("*").eq("id", 1).maybeSingle(),
    supabase.from("projects").select(PROJECT_FIELDS).eq("published", true).order("sort_order", order),
    supabase.from("labs").select(LAB_FIELDS).eq("published", true).order("sort_order", order),
    supabase.from("skill_categories").select("name, sort_order, skills(name, level, sort_order)").order("sort_order", order),
    supabase.from("educations").select("title,institution,location,period,description").order("sort_order", order),
    supabase.from("certifications").select("title,issuer,year,kind,url").order("sort_order", order),
    supabase.from("languages").select("name,level").order("sort_order", order),
    supabase.from("strengths").select("label").order("sort_order", order),
    supabase.from("principles").select("title,body").order("sort_order", order),
  ]);

  const failed = [profile, projects, labs, categories, educations, certifications, languages, strengths, principles].find(result => result.error);
  if (failed?.error) {
    // On ne masque pas une base mal configurée derrière le contenu de secours : l'erreur remonte.
    throw new Error(`Lecture du contenu Supabase impossible : ${failed.error.message}`);
  }

  return {
    profile: (profile.data as SiteContent["profile"] | null) ?? fallbackContent.profile,
    projects: (projects.data ?? []) as Project[],
    labs: (labs.data ?? []) as Lab[],
    skills: (categories.data ?? []).map(category => ({
      name: category.name,
      skills: [...(category.skills ?? [])].sort((a, b) => a.sort_order - b.sort_order).map(({ name, level }) => ({ name, level })),
    })),
    educations: educations.data ?? [],
    certifications: certifications.data ?? [],
    languages: languages.data ?? [],
    strengths: strengths.data ?? [],
    principles: principles.data ?? [],
  } as SiteContent;
}

export { mediaUrl } from "./media";
