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

/** Bas de page du carnet : un trait d'encre, la signature, les liens. */
export async function SiteFooter({ locale, dict, profile }: { locale: Locale; dict: Dictionary; profile: Profile }) {
  const year = await currentYear();
  const links = [
    { label: "GitHub", href: profile.github_url },
    { label: "LinkedIn", href: profile.linkedin_url },
    { label: "Email", href: `mailto:${profile.email}` },
    { label: "CV", href: mediaUrl(profile.cv_path) },
  ].filter((link): link is { label: string; href: string } => Boolean(link.href));

  return (
    <footer className="mt-24 border-t-[1.5px] border-ink">
      <div className="container-site grid gap-8 py-10 md:grid-cols-[1.4fr_1fr_auto] md:items-start">
        <div>
          <Link href={`/${locale}`} className="flex w-fit items-center gap-2.5 text-lg font-bold">
            <LogoMark size={34} />
            {profile.display_name}
          </Link>
          <p className="mt-3 max-w-sm text-[15px] text-muted">{pick(profile.role, locale)} · {profile.location}</p>
        </div>
        <ul className="grid grid-cols-2 gap-2 font-mono text-[13px]">
          {links.map(link => (
            <li key={link.label}>
              <a href={link.href} className="link-underline" {...(link.href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}>
                ↗ {link.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="flex flex-col gap-2 font-mono text-[13px] text-muted md:items-end">
          <a href="#top" className="link-underline text-foreground">↑ {dict.footer.top}</a>
          <p>© {year} {profile.display_name}. {dict.footer.rights}</p>
        </div>
      </div>
    </footer>
  );
}
