import Link from "next/link";
import { getDictionary, getLocale } from "@/i18n/dictionaries";

/** 404 : un câble débranché, qui pend dans le vide. */
export default async function NotFound() {
  const [locale, dict] = await Promise.all([getLocale(), getDictionary()]);
  return (
    <div className="container-site grid min-h-[65vh] items-center gap-10 py-20 md:grid-cols-[1fr_auto]">
      <div>
        <p className="tape"><span className="tape-num">404</span>NO CARRIER</p>
        <h1 className="mt-5 text-[clamp(2.5rem,7vw,5rem)] leading-none font-extrabold tracking-[-0.035em]">
          {dict.notFound.title}
        </h1>
        <p className="mt-5 max-w-lg text-lg text-muted">{dict.notFound.text}</p>
        <Link href={`/${locale}`} className="btn btn-primary mt-8">{dict.notFound.back}</Link>
      </div>
      <svg width="160" height="260" viewBox="0 0 160 260" aria-hidden="true" className="mx-auto">
        <path d="M80 0 C 80 90, 30 120, 70 190" fill="none" stroke="var(--cable-orange)" strokeWidth="9" strokeLinecap="round" />
        <g transform="translate(70 190) rotate(-18)">
          <path d="M-12 0h24l-4 14h-16z" fill="var(--cable-orange)" />
          <rect x="-16" y="14" width="32" height="30" rx="2" fill="rgb(200 210 220 / 0.6)" stroke="var(--muted)" strokeWidth="1" />
          <path d="M-11 38v4M-6 38v4M-1 38v4M4 38v4M9 38v4" stroke="#c8a24a" strokeWidth="1.5" />
        </g>
      </svg>
    </div>
  );
}
