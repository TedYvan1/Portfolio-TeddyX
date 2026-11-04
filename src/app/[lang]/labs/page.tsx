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
      <SectionHeading as="h1" port="04" eyebrow={dict.labs.eyebrow} title={dict.labs.title} subtitle={dict.labs.subtitle} />
      {labs.length ? (
        <ul className="mt-12 grid gap-5 md:grid-cols-2">
          {labs.map(lab => (
            <li key={lab.slug}>
              <Link href={`/${locale}/labs/${lab.slug}`} className="module group panel block h-full p-7">
                <p className="flex items-center gap-2 tag"><span aria-hidden="true" className="led led-on" />{lab.platform}{lab.done_on ? ` · ${lab.done_on.slice(0, 4)}` : ""}</p>
                <h2 className="mt-3 text-xl font-extrabold">{pick(lab.title, locale)}</h2>
                <p className="mt-2 text-[15px] leading-7 text-muted">{pick(lab.summary, locale)}</p>
                <p className="tag mt-4">{lab.tools.join(" · ")}</p>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        // Port libre : rien de branché pour l'instant.
        <div className="mt-12 flex flex-col items-center gap-5 rounded-[4px] bg-rack px-6 py-14 text-center">
          <span aria-hidden="true" className="flex items-center gap-1.5"><span className="led" /><span className="led" /></span>
          <span aria-hidden="true" className="port-socket w-20" />
          <p className="max-w-md text-lg text-[#e9e7e1]">{dict.labs.empty}</p>
        </div>
      )}
    </div>
  );
}
