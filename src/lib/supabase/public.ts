import { createClient } from "@supabase/supabase-js";
import { supabaseEnv } from "./env";

/**
 * Client anonyme, sans cookies : réservé à la lecture du contenu publié.
 * Les règles RLS de la base limitent ce qu'il peut voir ; il peut donc être utilisé dans des fonctions mises en cache.
 */
export function createPublicClient() {
  const env = supabaseEnv();
  if (!env) return null;
  return createClient(env.url, env.key, { auth: { persistSession: false, autoRefreshToken: false } });
}
