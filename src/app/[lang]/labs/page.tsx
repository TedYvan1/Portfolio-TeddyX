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
      <SectionHeading as="h1" num="04" highlight={dict.labs.highlight} eyebrow={dict.labs.eyebrow} title={dict.labs.title} subtitle={dict.labs.subtitle} />
      {labs.length ? (
        <ul className="mt-12 grid gap-8 md:grid-cols-2">
          {labs.map((lab, index) => (
            <li key={lab.slug}>
              <Link href={`/${locale}/labs/${lab.slug}`} className="card-lift panel block h-full p-7" style={{ transform: `rotate(${index % 2 ? 0.8 : -0.8}deg)` }}>
                <p className="tag">{lab.platform}{lab.done_on ? ` · ${lab.done_on.slice(0, 4)}` : ""}</p>
                <h2 className="mt-2 text-2xl font-bold">{pick(lab.title, locale)}</h2>
                <p className="mt-2 text-[15px] text-muted">{pick(lab.summary, locale)}</p>
                <p className="tag mt-4">{lab.tools.join(" · ")}</p>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        // Page encore blanche du carnet
        <div className="panel relative mt-14 max-w-xl -rotate-1 p-10">
          <span aria-hidden="true" className="scotch" />
          <p className="note text-3xl">{locale === "fr" ? "à venir…" : "coming soon…"}</p>
          <p className="mt-3 text-lg text-muted">{dict.labs.empty}</p>
        </div>
      )}
    </div>
  );
}
