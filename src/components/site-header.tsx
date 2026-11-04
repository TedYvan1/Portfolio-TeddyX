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
    // L'en-tête reprend le papier quadrillé ; un trait d'encre apparaît dès qu'on défile.
    <header style={{ viewTransitionName: "site-header" }} className={`sticky top-0 z-50 bg-(--paper) [background-image:inherit] [background-size:inherit] border-b-[1.5px] transition-[border-color] duration-300 ${scrolled || open ? "border-ink" : "border-transparent"}`}>
      <div className="container-site flex h-[72px] items-center justify-between gap-3">
        <Link href={`/${locale}`} className="flex items-center gap-2.5 text-lg font-bold">
          <LogoMark />
          <span>tedyvan<span className="ml-1 font-mono text-sm font-normal text-hl">.net</span></span>
        </Link>

        <nav aria-label={locale === "fr" ? "Navigation principale" : "Main navigation"} className="hidden items-center gap-7 font-mono text-[13px] md:flex">
          {links.map((link, index) => (
            <Link key={link.href} href={link.href} className="link-underline flex gap-1.5" aria-current={pathname === link.href ? "page" : undefined}>
              <i className="not-italic text-hl">{String(index + 1).padStart(2, "0")}</i>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2.5">
          <Link href={switchHref} hrefLang={other} lang={other} className="px-1.5 py-2 font-mono text-[13px] whitespace-nowrap text-muted hover:text-foreground" aria-label={`${nav.language} : ${nav.switchTo}`}>
            <span className="text-foreground">{locale.toUpperCase()}</span> / {other.toUpperCase()}
          </Link>
          <ThemeToggle t={theme} />
          <button
            type="button"
            className="sq md:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? nav.closeMenu : nav.openMenu}
            onClick={() => setOpen(value => !value)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7.5c5-1 11 .5 16-.5M4 12.5c4 .6 8-.6 12 0M4 17c5 .8 11-.6 16 .2" />}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <nav id="mobile-menu" aria-label={locale === "fr" ? "Navigation mobile" : "Mobile navigation"} className="menu-in container-site grid gap-1 pb-6 md:hidden">
          {links.map((link, index) => (
            <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className="flex items-baseline gap-3 border-b border-dashed border-border px-1 py-3.5 text-xl font-bold">
              <span className="font-mono text-xs font-normal text-hl">{String(index + 1).padStart(2, "0")}</span>
              {link.label}
            </Link>
          ))}
          <Link href={`/${locale}#contact`} onClick={() => setOpen(false)} className="btn btn-primary mt-4">
            {nav.cta}
          </Link>
        </nav>
      )}
    </header>
  );
}
