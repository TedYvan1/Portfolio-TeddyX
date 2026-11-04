import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { pick } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { getContent } from "@/lib/content";

// Cache Components exige au moins un paramètre au build : sans lab publié, un paramètre factice renvoie une 404.
const NO_LAB = "__aucun-lab__";

export async function generateStaticParams() {
  const { labs } = await getContent();
  return labs.length ? labs.map(lab => ({ slug: lab.slug })) : [{ slug: NO_LAB }];
}

async function findLab(slug: string) {
  const { labs } = await getContent();
  return labs.find(lab => lab.slug === slug) ?? null;
}

export async function generateMetadata({ params }: PageProps<"/[lang]/labs/[slug]">): Promise<Metadata> {
  const [{ slug }, locale] = await Promise.all([params, getLocale()]);
  const lab = await findLab(slug);
  return lab ? { title: pick(lab.title, locale), description: pick(lab.summary, locale) } : {};
}

export default async function LabPage({ params }: PageProps<"/[lang]/labs/[slug]">) {
  const [{ slug }, locale, dict] = await Promise.all([params, getLocale(), getDictionary()]);
  const lab = await findLab(slug);
  if (!lab) notFound();
  // Corps du lab : paragraphes séparés par une ligne vide.
  const paragraphs = pick(lab.body, locale).split(/\n{2,}/).filter(Boolean);

  return (
    <article className="container-site py-12 md:py-20">
      <Link href={`/${locale}/labs`} className="link-underline font-mono text-sm text-muted">← {dict.labs.back}</Link>
      <div className="mt-8 max-w-3xl">
        <p className="label">{lab.platform}{lab.done_on ? ` · ${lab.done_on}` : ""}</p>
        <h1 className="mt-5 text-[clamp(2.25rem,6vw,4.5rem)] leading-none font-bold">{pick(lab.title, locale)}</h1>
        <p className="mt-5 text-xl leading-relaxed text-muted">{pick(lab.summary, locale)}</p>
        {lab.tools.length > 0 && (
          <p className="mt-6 flex flex-wrap gap-2" aria-label={dict.labs.tools}>
            {lab.tools.map(tool => <span key={tool} className="chip">{tool}</span>)}
          </p>
        )}
      </div>
      <div className="mt-12 grid max-w-3xl gap-5 text-lg leading-8">
        {paragraphs.map((paragraph, index) => <p key={index} className="whitespace-pre-line">{paragraph}</p>)}
      </div>
    </article>
  );
}
