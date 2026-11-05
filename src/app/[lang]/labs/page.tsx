import type { Metadata } from "next";
import Link from "next/link";
import { pick } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { getContent } from "@/lib/content";
import { SectionHeading } from "@/components/section-heading";

export async function generateMetadata(): Promise<Metadata> {
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);
  return { title: dict.meta.labsTitle, description: dict.labs.subtitle, alternates: { canonical: `/${locale}/labs` } };
}

export default async function LabsPage() {
  const [locale, dict, { labs }] = await Promise.all([getLocale(), getDictionary(), getContent()]);
  return (
    <div className="container-site py-14 md:py-20">
      <SectionHeading as="h1" chapter={`${dict.comic.chapter} 4`} eyebrow={dict.labs.eyebrow} title={dict.labs.title} subtitle={dict.labs.subtitle} />
      {labs.length ? (
        <ul className="mt-12 grid gap-8 md:grid-cols-2">
          {labs.map((lab, index) => (
            <li key={lab.slug}>
              <Link href={`/${locale}/labs/${lab.slug}`} data-sfx className="cover-card panel block h-full p-6" style={{ transform: `rotate(${index % 2 ? 0.8 : -0.8}deg)` }}>
                <p className="caption">{lab.platform}{lab.done_on ? ` · ${lab.done_on.slice(0, 4)}` : ""}</p>
                <h2 className="display mt-3 text-3xl">{pick(lab.title, locale)}</h2>
                <p className="mt-1 text-[15px] text-muted">{pick(lab.summary, locale)}</p>
                <p className="tag mt-3">{lab.tools.join(" · ")}</p>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        // Case vide : « bientôt dans vos kiosques »
        <div className="panel dots mt-14 grid max-w-2xl place-items-center gap-4 p-10 text-center -rotate-1">
          <span className="burst display text-2xl" style={{ width: 120, height: 120 }}>{dict.comic.next}…</span>
          <p className="display text-3xl">{dict.comic.soon}</p>
          <p className="text-muted">{dict.labs.empty}</p>
        </div>
      )}
    </div>
  );
}
