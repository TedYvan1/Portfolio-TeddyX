import { InView } from "./in-view";

/**
 * Ouverture de chapitre : un récitatif jaune « Chapitre N », puis le titre en lettrage de BD.
 * À l'arrivée à l'écran, le titre s'abat avec une secousse et une grosse onomatopée (`sfx`)
 * explose derrière lui.
 */
export function SectionHeading({ eyebrow, title, subtitle, id, chapter, sfx, as: Heading = "h2" }: { eyebrow: string; title: string; subtitle?: string; id?: string; chapter?: string; sfx?: string; as?: "h1" | "h2" }) {
  return (
    <InView className="relative isolate max-w-3xl">
      {sfx && (
        <span aria-hidden="true" className="slam-sfx pop-title pointer-events-none absolute -top-10 right-0 -z-10 text-[clamp(4rem,11vw,8.5rem)] text-red! opacity-90 sm:-right-24">
          {sfx}
        </span>
      )}
      <p className="caption slam-caption -rotate-1">{chapter ? `${chapter} · ` : ""}{eyebrow}</p>
      <Heading id={id} className="slam display mt-4 text-[clamp(2.4rem,5.6vw,4.6rem)] text-balance">
        {title}
      </Heading>
      {subtitle && <p className="slam-sub mt-3 max-w-[54ch] text-lg text-muted">{subtitle}</p>}
    </InView>
  );
}
