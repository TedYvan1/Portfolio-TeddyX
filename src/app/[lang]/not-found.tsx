import Link from "next/link";
import { getDictionary, getLocale } from "@/i18n/dictionaries";

/** 404 : une case vide, et une grosse onomatopée. */
export default async function NotFound() {
  const [locale, dict] = await Promise.all([getLocale(), getDictionary()]);
  return (
    <div className="container-site py-16 md:py-24">
      <div className="panel dots relative grid min-h-[50vh] place-items-center gap-6 overflow-hidden p-8 text-center">
        <p className="caption absolute top-4 left-4 -rotate-1">404</p>
        <span className="pop-title -rotate-6 text-[clamp(4rem,14vw,9rem)]">{dict.comic.oops}</span>
        <div className="bubble max-w-md text-lg font-bold">
          <h1 className="display text-3xl">{dict.notFound.title}</h1>
          <p className="mt-1 font-normal">{dict.notFound.text}</p>
        </div>
        <Link href={`/${locale}`} className="btn btn-primary mt-4">← {dict.notFound.back}</Link>
      </div>
    </div>
  );
}
