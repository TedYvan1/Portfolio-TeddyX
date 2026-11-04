import Link from "next/link";
import { getDictionary, getLocale } from "@/i18n/dictionaries";

export default async function NotFound() {
  const [locale, dict] = await Promise.all([getLocale(), getDictionary()]);
  return (
    <div className="relative overflow-hidden">
      <div className="container-site relative flex min-h-[60vh] flex-col items-start justify-center py-20">
        <p className="eyebrow">404</p>
        <h1 className="mt-4 text-[clamp(2.5rem,7vw,5rem)] leading-none font-bold tracking-[-0.025em]">
          {dict.notFound.title}<span className="text-contact">.</span>
        </h1>
        <p className="mt-5 max-w-lg text-lg text-muted">{dict.notFound.text}</p>
        <Link href={`/${locale}`} className="btn btn-primary mt-8">{dict.notFound.back}</Link>
      </div>
    </div>
  );
}
