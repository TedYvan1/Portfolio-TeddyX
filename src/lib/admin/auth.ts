import "server-only";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createSessionClient } from "@/lib/supabase/server";
import { supabaseEnv } from "@/lib/supabase/env";

export const LOGIN_PATH = "/admin/login";

/**
 * Point d'entrée unique de l'admin (couche d'accès aux données) : à appeler dans chaque page ET chaque action.
 * Renvoie le client de session d'un administrateur, ou redirige vers la connexion.
 * La vraie barrière reste la base (RLS + public.is_admin()) : ce contrôle évite seulement d'afficher l'admin à un inconnu.
 */
export async function requireAdmin() {
  // Toujours à la requête, jamais au build : la réponse dépend de la session, et des variables présentes au déploiement.
  await connection();
  if (!supabaseEnv()) redirect(LOGIN_PATH);
  const supabase = await createSessionClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(LOGIN_PATH);

  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) redirect(`${LOGIN_PATH}?refus=1`);

  return { supabase, user: { id: user.id, email: user.email ?? "" } };
}

export type AdminContext = Awaited<ReturnType<typeof requireAdmin>>;
