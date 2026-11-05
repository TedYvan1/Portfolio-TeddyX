import Link from "next/link";
import { cacheLife } from "next/cache";
import type { Locale } from "@/i18n/config";
import { pick } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { mediaUrl } from "@/lib/content";
import type { Profile } from "@/lib/types";
import { LogoMark } from "./logo";

// L'heure courante est interdite au rendu statique : l'année passe par une fonction mise en cache.
async function currentYear() {
  "use cache";
  cacheLife("days");
  return new Date().getFullYear();
}

/** Quatrième de couverture : « Fin », l'éditeur, les liens. */
export async function SiteFooter({ locale, dict, profile }: { locale: Locale; dict: Dictionary; profile: Profile }) {
  const year = await currentYear();
  const links = [
    { label: "GitHub", href: profile.github_url },
    { label: "LinkedIn", href: profile.linkedin_url },
    { label: "Email", href: `mailto:${profile.email}` },
    { label: "CV", href: mediaUrl(profile.cv_path) },
  ].filter((link): link is { label: string; href: string } => Boolean(link.href));

  return (
    <footer className="mt-28 border-t-[3px] border-ink bg-panel">
      <div className="container-site grid gap-8 py-10 md:grid-cols-[1.3fr_1fr_auto] md:items-center">
        <div className="flex items-center gap-4">
          <LogoMark size={56} />
          <div>
            <p className="display text-3xl">{dict.comic.end}</p>
            <p className="text-base text-muted">{pick(profile.role, locale)} · {profile.location}</p>
          </div>
        </div>
        <ul className="flex flex-wrap gap-2">
          {links.map(link => (
            <li key={link.label}>
              <a href={link.href} className="chip min-h-11 px-3.5 text-sm shadow-[2px_2px_0_var(--shadow)]" {...(link.href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}>
                {link.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="flex flex-col gap-1 text-sm text-muted md:items-end">
          <a href="#top" className="link-underline inline-flex min-h-11 items-center font-bold text-foreground">↑ {dict.footer.top}</a>
          <p>© {year} {dict.comic.publisher}. {dict.footer.rights}</p>
          <Link href={`/${locale}`} className="sr-only">{profile.display_name}</Link>
        </div>
      </div>
    </footer>
  );
}
