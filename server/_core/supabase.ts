import { createClient } from "@supabase/supabase-js";
import { ENV } from "./env";

export function getSupabaseClient() {
  if (!ENV.supabaseUrl || !ENV.supabaseAnonKey) {
    throw new Error("SUPABASE_URL / SUPABASE_ANON_KEY not configured. See .env.example");
  }
  return createClient(ENV.supabaseUrl, ENV.supabaseAnonKey);
}

export function getSupabaseAdminClient() {
  if (!ENV.supabaseUrl || !ENV.supabaseServiceKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY not configured for admin operations");
  }
  return createClient(ENV.supabaseUrl, ENV.supabaseServiceKey, { auth: { persistSession: false } });
}
