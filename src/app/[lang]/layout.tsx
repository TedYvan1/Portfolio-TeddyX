import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { lang } from "next/root-params";
import { locales } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { getContent } from "@/lib/content";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ComicSfx } from "@/components/comic-sfx";
import { themeScript } from "@/lib/theme-script";
import { fontVariables } from "../fonts";
import "../globals.css";

export async function generateStaticParams() {
  return locales.map(locale => ({ lang: locale }));
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6eedb" },
    { media: "(prefers-color-scheme: dark)", color: "#10131d" },
  ],
};

export async function generateMetadata(): Promise<Metadata> {
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);
  return {
    title: { default: dict.meta.title, template: `%s · Ted Yvan Kamanan` },
    description: dict.meta.description,
    alternates: { canonical: `/${locale}`, languages: Object.fromEntries(locales.map(item => [item, `/${item}`])) },
    icons: { icon: "/favicon.svg" },
  };
}

export default async function RootLayout({ children }: LayoutProps<"/[lang]">) {
  const [locale, dict, content] = await Promise.all([getLocale(), getDictionary(), getContent()]);
  return (
    <html lang={await lang()} className={`${fontVariables} h-full antialiased`} suppressHydrationWarning>
      <head>
        {/* Thème choisi appliqué avant le premier affichage : pas de flash clair → sombre. */}
        <Script id="theme" strategy="beforeInteractive">{themeScript}</Script>
      </head>
      <body id="top" className="flex min-h-full flex-col font-sans">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-(--radius) focus:bg-foreground focus:px-4 focus:py-2 focus:text-background">
          {dict.nav.skip}
        </a>
        <SiteHeader locale={locale} nav={dict.nav} theme={dict.theme} comic={dict.comic} />
        <ComicSfx words={dict.comic.sfx} />
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter locale={locale} dict={dict} profile={content.profile} />
      </body>
    </html>
  );
}
