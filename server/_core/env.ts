export const ENV = {
  databaseUrl: process.env.DATABASE_URL ?? "",
  supabaseUrl: process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY ?? process.env.VITE_SUPABASE_ANON_KEY ?? "",
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  jwtSecret: process.env.JWT_SECRET ?? "",
  isProduction: process.env.NODE_ENV === "production",
};
