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

/** Pied de page : le bas de la baie, avec sa plaque signalétique. */
export async function SiteFooter({ locale, dict, profile }: { locale: Locale; dict: Dictionary; profile: Profile }) {
  const year = await currentYear();
  const links = [
    { label: "GitHub", href: profile.github_url },
    { label: "LinkedIn", href: profile.linkedin_url },
    { label: "Email", href: `mailto:${profile.email}` },
    { label: "CV", href: mediaUrl(profile.cv_path) },
  ].filter((link): link is { label: string; href: string } => Boolean(link.href));

  return (
    <footer className="bg-rack text-[#e9e7e1]">
      <div aria-hidden="true" className="flex h-1.5">
        <span className="flex-1 bg-(--cable-orange)" /><span className="flex-1 bg-(--cable-green)" /><span className="flex-1 bg-(--cable-blue)" /><span className="flex-1 bg-(--cable-brown)" />
      </div>
      <div className="container-site grid gap-10 py-12 md:grid-cols-[1.4fr_1fr_auto] md:items-start">
        <div>
          <Link href={`/${locale}`} className="flex items-center gap-2.5 text-[17px] font-extrabold tracking-tight">
            <LogoMark size={26} />
            {profile.display_name}
          </Link>
          <p className="mt-3 max-w-sm text-[15px] leading-7 text-[#b9b8b2]">{pick(profile.role, locale)} · {profile.location}</p>
        </div>
        <ul className="grid grid-cols-2 gap-3 text-[15px] font-semibold">
          {links.map(link => (
            <li key={link.label} className="flex items-center gap-2.5">
              <span aria-hidden="true" className="led led-on" />
              <a href={link.href} className="link-underline" {...(link.href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}>
                {link.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="flex flex-col gap-2 text-sm text-[#b9b8b2] md:items-end">
          <a href="#top" className="link-underline font-semibold text-[#e9e7e1]">↑ {dict.footer.top}</a>
          <p>© {year} {profile.display_name}. {dict.footer.rights}</p>
          <p className="silk mt-2">S/N TY-{year}-ABJ · Côte d&apos;Ivoire</p>
        </div>
      </div>
    </footer>
  );
}
