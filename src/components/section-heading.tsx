import { InView } from "./in-view";

/**
 * Titre de section : une bande d'étiqueteuse (numéro de port + nom) qui s'imprime à l'arrivée,
 * puis le titre. Le numéro correspond au port du panneau de l'accueil.
 */
export function SectionHeading({ eyebrow, title, subtitle, id, port, as: Heading = "h2" }: { eyebrow: string; title: string; subtitle?: string; id?: string; port?: string; as?: "h1" | "h2" }) {
  return (
    <InView className="max-w-3xl">
      <p className="tape tape-print">
        {port && <span className="tape-num">{port}</span>}
        {eyebrow}
      </p>
      <Heading id={id} className="mt-5 text-[clamp(1.9rem,4.2vw,3.1rem)] leading-[1.04] font-extrabold tracking-[-0.025em] text-balance">
        {title}
      </Heading>
      {subtitle && <p className="mt-4 text-lg leading-8 text-muted">{subtitle}</p>}
    </InView>
  );
}
