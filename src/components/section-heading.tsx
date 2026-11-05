import { InView } from "./in-view";

/**
 * Ouverture de chapitre : un récitatif jaune « Chapitre N », puis le titre en lettrage de BD.
 * Le bloc entre par un fondu court quand il arrive à l'écran.
 */
export function SectionHeading({ eyebrow, title, subtitle, id, chapter, as: Heading = "h2" }: { eyebrow: string; title: string; subtitle?: string; id?: string; chapter?: string; as?: "h1" | "h2" }) {
  return (
    <InView className="max-w-3xl">
      <div className="scene">
        <p className="caption">{chapter ? `${chapter} · ` : ""}{eyebrow}</p>
        <Heading id={id} className="display mt-4 text-[clamp(2.4rem,5.6vw,4.6rem)] text-balance">
          {title}
        </Heading>
        {subtitle && <p className="mt-4 max-w-[54ch] text-lg text-muted">{subtitle}</p>}
      </div>
    </InView>
  );
}
