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
    <div className="container-site py-16 md:py-24">
      <SectionHeading eyebrow={dict.labs.eyebrow} title={dict.labs.title} subtitle={dict.labs.subtitle} glyph="skill" />
      {labs.length ? (
        <ul className="mt-12 grid gap-4 md:grid-cols-2">
          {labs.map(lab => (
            <li key={lab.slug}>
              <div>
                <Link href={`/${locale}/labs/${lab.slug}`} className="group panel block h-full p-7 transition-transform hover:-translate-y-1">
                  <p className="tag">{lab.platform}{lab.done_on ? ` · ${lab.done_on.slice(0, 4)}` : ""}</p>
                  <h2 className="mt-3 text-xl font-bold">{pick(lab.title, locale)}</h2>
                  <p className="mt-2 text-[15px] leading-7 text-muted">{pick(lab.summary, locale)}</p>
                  <p className="tag mt-4">{lab.tools.join(" · ")}</p>
                </Link>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="panel mt-12 p-10 text-center text-lg text-muted">{dict.labs.empty}</p>
      )}
    </div>
  );
}
