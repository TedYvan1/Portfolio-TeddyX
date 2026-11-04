import { InView } from "./in-view";

/**
 * Titre de section du carnet : numéro et nom en lettrage d'architecte, puis le titre.
 * `highlight` désigne le mot que le surligneur vient couvrir à l'arrivée à l'écran.
 */
export function SectionHeading({ eyebrow, title, subtitle, id, num, highlight, as: Heading = "h2" }: { eyebrow: string; title: string; subtitle?: string; id?: string; num?: string; highlight?: string; as?: "h1" | "h2" }) {
  // « last » : le surligneur couvre le dernier mot du titre (hors ponctuation), quelle que soit la langue.
  if (highlight === "last") highlight = title.replace(/[\s.!?…:;, ]+$/, "").split(/\s+/).pop();
  const index = highlight ? title.lastIndexOf(highlight) : -1;
  return (
    <InView className="grid max-w-3xl gap-3.5">
      <p className="label">{num && <>{num} — </>}{eyebrow}</p>
      <Heading id={id} className="text-[clamp(2rem,4.4vw,3.9rem)] leading-[1.05] font-bold text-balance">
        {index === -1 ? title : (
          <>
            {title.slice(0, index)}
            <mark className="hl">{highlight}</mark>
            {title.slice(index + (highlight?.length ?? 0))}
          </>
        )}
      </Heading>
      {subtitle && <p className="max-w-[52ch] text-muted">{subtitle}</p>}
    </InView>
  );
}
