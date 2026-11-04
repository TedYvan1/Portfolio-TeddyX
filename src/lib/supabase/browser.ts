import { createBrowserClient } from "@supabase/ssr";
import { supabaseEnv } from "./env";

/** Client navigateur, lié à la session de l'admin : sert uniquement à envoyer les fichiers vers le stockage (RLS : admin seulement). */
export function createAdminBrowserClient() {
  const env = supabaseEnv();
  if (!env) throw new Error("Supabase n'est pas configuré.");
  return createBrowserClient(env.url, env.key);
}
