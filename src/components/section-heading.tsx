import type { NodeGroup } from "@/lib/graph";

/** Titre de section ; la pastille reprend la forme du type de nœud correspondant dans le graphe. */
export function SectionHeading({ eyebrow, title, subtitle, id, glyph }: { eyebrow: string; title: string; subtitle?: string; id?: string; glyph?: Exclude<NodeGroup, "me"> }) {
  return (
    <div className="max-w-3xl">
      <p className="eyebrow flex items-center gap-2">
        {glyph && <span aria-hidden="true" className={`glyph glyph-${glyph}`} />}
        {eyebrow}
      </p>
      <h2 id={id} className="mt-3 text-[clamp(1.9rem,4.2vw,3rem)] leading-[1.06] font-bold tracking-[-0.02em]">
        {title}
      </h2>
      {subtitle && <p className="mt-4 text-lg leading-8 text-muted">{subtitle}</p>}
    </div>
  );
}
