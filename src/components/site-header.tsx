"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { LogoMark } from "./logo";
import { ThemeToggle } from "./theme-toggle";

type Props = { locale: Locale; nav: Dictionary["nav"]; theme: Dictionary["theme"]; comic: Dictionary["comic"] };

/** Bandeau-titre de l'album : le logo en étoile, les chapitres, l'édition jour / nuit. */
export function SiteHeader({ locale, nav, theme, comic }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const other: Locale = locale === "fr" ? "en" : "fr";
  // Même page dans l'autre langue : on remplace seulement le premier segment.
  const switchHref = pathname.replace(/^\/(fr|en)(?=\/|$)/, `/${other}`);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { href: `/${locale}/projects`, label: nav.projects },
    { href: `/${locale}/labs`, label: nav.labs },
    { href: `/${locale}#journey`, label: nav.journey },
    { href: `/${locale}#contact`, label: nav.contact },
  ];

  return (
    <header style={{ viewTransitionName: "site-header" }} className={`sticky top-0 z-50 border-b-[3px] transition-[background-color,border-color] duration-200 ${scrolled || open ? "border-ink bg-page" : "border-transparent"}`}>
      {/* Barre de lecture : avance avec le défilement de la page */}
      <span aria-hidden="true" className="read-progress pointer-events-none absolute inset-x-0 -bottom-[5px] h-[5px] border-b-2 border-ink bg-yellow" />
      <div className="container-site flex h-[72px] items-center justify-between gap-3">
        <Link href={`/${locale}`} className="flex items-center gap-2" data-sfx>
          <LogoMark />
          <span className="display text-[26px] leading-none">Ted Yvan <span className="text-red">!</span></span>
        </Link>

        <nav aria-label={locale === "fr" ? "Navigation principale" : "Main navigation"} className="hidden items-center gap-6 text-[15px] font-bold md:flex">
          {links.map(link => (
            <Link key={link.href} href={link.href} className="link-underline inline-flex min-h-11 items-center" aria-current={pathname === link.href ? "page" : undefined}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link href={switchHref} hrefLang={other} lang={other} className="inline-flex h-11 items-center px-2 text-sm font-bold whitespace-nowrap text-muted hover:text-foreground" aria-label={`${nav.language} : ${nav.switchTo}`}>
            <span className="text-foreground">{locale.toUpperCase()}</span>/{other.toUpperCase()}
          </Link>
          <ThemeToggle t={theme} day={comic.day} night={comic.night} />
          <button
            type="button"
            className="grid h-11 w-11 place-items-center rounded-(--radius) border-[3px] border-ink bg-panel shadow-[3px_3px_0_var(--shadow)] md:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? nav.closeMenu : nav.openMenu}
            onClick={() => setOpen(value => !value)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true">
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <nav id="mobile-menu" aria-label={locale === "fr" ? "Navigation mobile" : "Mobile navigation"} className="menu-in container-site grid gap-2 pb-6 md:hidden">
          {links.map((link, index) => (
            <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className="panel flex items-baseline gap-3 px-4 py-3" style={{ transform: `rotate(${index % 2 ? 0.6 : -0.6}deg)` }}>
              <span className="display text-red">{comic.chapter} {index + 1}</span>
              <span className="text-lg font-bold">{link.label}</span>
            </Link>
          ))}
          <Link href={`/${locale}#contact`} onClick={() => setOpen(false)} className="btn btn-primary mt-2">
            {nav.cta} !
          </Link>
        </nav>
      )}
    </header>
  );
}
