import Link from "next/link";
import { getDictionary, getLocale } from "@/i18n/dictionaries";

/** 404 : une liaison coupée, raturée dans le carnet. */
export default async function NotFound() {
  const [locale, dict] = await Promise.all([getLocale(), getDictionary()]);
  return (
    <div className="container-site grid min-h-[65vh] items-center gap-10 py-20 md:grid-cols-[1fr_auto]">
      <div>
        <p className="label">404 — {locale === "fr" ? "hôte injoignable" : "host unreachable"}</p>
        <h1 className="mt-4 text-[clamp(2.6rem,7vw,5rem)] leading-none font-bold">{dict.notFound.title}</h1>
        <p className="mt-5 max-w-lg text-lg text-muted">{dict.notFound.text}</p>
        <Link href={`/${locale}`} className="btn btn-primary mt-8">← {dict.notFound.back}</Link>
      </div>
      <svg width="260" height="140" viewBox="0 0 260 140" aria-hidden="true" className="mx-auto text-ink">
        <rect x="8" y="48" width="70" height="44" fill="var(--sheet)" stroke="currentColor" strokeWidth="2" transform="rotate(-3 43 70)" />
        <rect x="182" y="46" width="70" height="44" fill="var(--sheet)" stroke="currentColor" strokeWidth="2" transform="rotate(2 217 68)" />
        <path d="M80 70 C 100 60, 110 80, 122 68" pathLength={1} className="ink" strokeWidth="2.4" />
        <path d="M140 72 C 152 60, 165 80, 180 68" pathLength={1} className="ink" strokeWidth="2.4" style={{ ["--d" as string]: "300ms" }} />
        <path d="M118 52 L146 88 M146 52 L118 88" pathLength={1} className="ink" strokeWidth="3" stroke="var(--hl)" style={{ ["--d" as string]: "800ms", ["--dur" as string]: "300ms" }} />
        <text x="130" y="130" textAnchor="middle" fontSize="24" fontWeight="700" fontFamily="var(--font-note), cursive" fill="var(--hl)">?!</text>
      </svg>
    </div>
  );
}
