import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { defaultLocale, hasLocale, locales, type Locale } from "@/i18n/config";
import { supabaseEnv } from "@/lib/supabase/env";

/** Langue préférée du navigateur parmi celles du site (en-GB → en), sinon le français. */
function preferredLocale(request: NextRequest): Locale {
  const header = request.headers.get("accept-language") ?? "";
  const ranked = header
    .split(",")
    .map(part => {
      const [tag, q] = part.trim().split(";q=");
      return { base: tag.toLowerCase().split("-")[0], q: q ? Number(q) : 1 };
    })
    .sort((a, b) => b.q - a.q);
  return ranked.find(entry => hasLocale(entry.base))?.base as Locale | undefined ?? defaultLocale;
}

const LOGIN_PATH = "/admin/login";

/**
 * Admin : rafraîchit la session Supabase à chaque requête (les Server Components ne peuvent pas écrire de cookies ;
 * sans ce relais, un jeton renouvelé ne serait pas enregistré) et renvoie tout de suite vers la connexion sans session.
 * Ce n'est qu'un premier filtre : chaque page et chaque action vérifie l'administrateur, et la base applique RLS.
 */
async function refreshAdminSession(request: NextRequest) {
  const env = supabaseEnv();
  const isLogin = request.nextUrl.pathname === LOGIN_PATH;
  const toLogin = () => NextResponse.redirect(new URL(LOGIN_PATH, request.url));
  let response = NextResponse.next({ request });
  if (!env) return isLogin ? response : toLogin();

  const supabase = createServerClient(env.url, env.key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet, headers) => {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        // En-têtes anti-cache fournis par Supabase : une réponse qui pose un cookie de session ne doit jamais être partagée.
        Object.entries(headers ?? {}).forEach(([key, value]) => response.headers.set(key, value));
      },
    },
  });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user && !isLogin) {
    // On garde les cookies éventuellement mis à jour (session expirée effacée) sur la redirection.
    const redirect = toLogin();
    response.cookies.getAll().forEach(cookie => redirect.cookies.set(cookie));
    return redirect;
  }
  return response;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/admin" || pathname.startsWith("/admin/")) return refreshAdminSession(request);

  const hasPrefix = locales.some(locale => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`));
  if (hasPrefix) return NextResponse.next();

  request.nextUrl.pathname = `/${preferredLocale(request)}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  // Ni l'API, ni les fichiers statiques (tout chemin contenant un point).
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
