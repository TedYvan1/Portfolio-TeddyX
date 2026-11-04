import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabaseEnv } from "./env";

/**
 * Client lié à la session de l'utilisateur (cookies) : pour l'admin et les Server Actions.
 * Ne jamais l'utiliser dans une fonction « use cache ».
 */
export async function createSessionClient() {
  const env = supabaseEnv();
  if (!env) throw new Error("Supabase n'est pas configuré (NEXT_PUBLIC_SUPABASE_URL et clé publique).");
  const cookieStore = await cookies();
  return createServerClient(env.url, env.key, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: cookiesToSet => {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Appelé depuis un Server Component : la session sera rafraîchie par le proxy ou une Server Action.
        }
      },
    },
  });
}
