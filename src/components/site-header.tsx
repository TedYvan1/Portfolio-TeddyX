"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { LogoMark } from "./logo";
import { ThemeToggle } from "./theme-toggle";

type Props = { locale: Locale; nav: Dictionary["nav"]; theme: Dictionary["theme"] };

export function SiteHeader({ locale, nav, theme }: Props) {
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
    // Nom de transition : l'en-tête reste immobile pendant les changements de page.
    <header style={{ viewTransitionName: "site-header" }} className={`sticky top-0 z-50 transition-[background-color,box-shadow] duration-300 ${scrolled || open ? "bg-background shadow-[0_1px_0_var(--border)]" : ""}`}>
      <div className="container-site flex h-16 items-center justify-between gap-3 md:h-[72px]">
        <Link href={`/${locale}`} className="flex items-center gap-2.5 text-[17px] font-extrabold tracking-tight">
          <LogoMark />
          tedyvan
          <span className="silk hidden text-muted! lg:inline">/ net · sec · dev</span>
        </Link>

        <nav aria-label={locale === "fr" ? "Navigation principale" : "Main navigation"} className="hidden items-center gap-7 text-[15px] font-semibold md:flex">
          {links.map(link => (
            <Link key={link.href} href={link.href} className="link-underline" aria-current={pathname === link.href ? "page" : undefined}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          <ThemeToggle t={theme} />
          <Link href={switchHref} hrefLang={other} lang={other} className="rounded-(--radius) px-2 py-2 font-mono text-[13px] font-medium whitespace-nowrap text-muted hover:text-foreground" aria-label={`${nav.language} : ${nav.switchTo}`}>
            <span className="text-foreground">{locale.toUpperCase()}</span>/{other.toUpperCase()}
          </Link>
          <Link href={`/${locale}#contact`} className="btn btn-primary hidden lg:inline-flex">
            {nav.cta}
          </Link>
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-(--radius) border border-border md:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? nav.closeMenu : nav.openMenu}
            onClick={() => setOpen(value => !value)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h10M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <nav id="mobile-menu" aria-label={locale === "fr" ? "Navigation mobile" : "Mobile navigation"} className="menu-in container-site grid gap-1 pb-6 md:hidden">
          {links.map((link, index) => (
            <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-(--radius) px-3 py-3.5 text-lg font-bold hover:bg-surface">
              <span className="font-mono text-xs font-medium text-muted">{String(index + 1).padStart(2, "0")}</span>
              {link.label}
            </Link>
          ))}
          <Link href={`/${locale}#contact`} onClick={() => setOpen(false)} className="btn btn-primary mt-2">
            {nav.cta}
          </Link>
        </nav>
      )}
    </header>
  );
}
