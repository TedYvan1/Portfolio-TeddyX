/** Configuration publique de Supabase (utilisable côté navigateur). */
export function supabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  // Les nouveaux projets Supabase parlent de « publishable key » ; l'ancienne « anon key » marche aussi.
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return url && key ? { url, key } : null;
}
