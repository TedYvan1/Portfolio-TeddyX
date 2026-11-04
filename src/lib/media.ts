import { supabaseEnv } from "@/lib/supabase/env";

/** URL publique d'un fichier : chemin du bucket « media », URL complète, ou fichier de /public. */
export function mediaUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (/^https?:\/\//.test(path) || path.startsWith("/")) return path;
  const env = supabaseEnv();
  return env ? `${env.url}/storage/v1/object/public/media/${path}` : null;
}
