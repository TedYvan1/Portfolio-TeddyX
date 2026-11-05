"use client";

import { useState } from "react";
import { InView } from "./in-view";
import type { CustomIcon, TechIcon } from "@/lib/tech-icons";

type Skill = { name: string; level: 1 | 2 | 3; icons: TechIcon[] };
type Card = Skill & { family: string; tint: number };
type Labels = { all: string; hint: string; cards: string; rarity: string[]; families: string; swipe: string };

const TINTS = ["var(--blue)", "var(--red)", "var(--yellow)"];

/**
 * La stack en cartes à collectionner. Des onglets par famille ; à chaque choix, les cartes
 * sont distribuées depuis le paquet, en éventail. Au survol, la carte s'incline vers le curseur
 * La distribution attend que la section soit à l'écran. Les cartes restent sobres (papier et encre) :
 * la couleur de la famille n'apparaît que sur une pastille.
 */
export function SkillDeck({ families, levels, labels }: { families: { name: string; skills: Skill[] }[]; levels: string[]; labels: Labels }) {
  const [active, setActive] = useState(-1);
  const all: Card[] = families.flatMap((family, tint) => family.skills.map(skill => ({ ...skill, family: family.name, tint })));
  const shown = active === -1 ? all : all.filter(card => card.tint === active);
  const tabs = [{ label: labels.all, index: -1, count: all.length }, ...families.map((family, index) => ({ label: family.name, index, count: family.skills.length }))];

  // Onglets accessibles : flèches gauche/droite, Début et Fin déplacent le choix et le focus (motif WAI-ARIA).
  const onTabKey = (event: React.KeyboardEvent<HTMLButtonElement>, position: number) => {
    const last = tabs.length - 1;
    const target = { ArrowRight: position === last ? 0 : position + 1, ArrowLeft: position === 0 ? last : position - 1, Home: 0, End: last }[event.key];
    if (target === undefined) return;
    event.preventDefault();
    setActive(tabs[target].index);
    (event.currentTarget.parentElement?.children[target] as HTMLElement | undefined)?.focus();
  };

  return (
    <div className="mt-10">
      <p className="text-muted">{labels.hint}</p>
      <div role="tablist" aria-label={labels.families} className="mt-5 flex flex-wrap gap-2.5">
        {tabs.map((tab, position) => {
          const selected = tab.index === active;
          return (
            <button
              key={tab.index}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls="skill-cards"
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(tab.index)}
              onKeyDown={event => onTabKey(event, position)}
              className={`deck-tab flex min-h-11 items-center gap-2 border-[3px] border-ink px-3.5 py-1.5 font-bold shadow-[2px_2px_0_var(--shadow)] transition-colors duration-150 ${selected ? "bg-ink text-page" : "bg-panel hover:bg-yellow hover:text-[#141210]"}`}
            >
              {tab.label}
              <span className="display text-sm opacity-70">{tab.count}</span>
            </button>
          );
        })}
      </div>

      {/* Sur téléphone, les cartes forment une rangée : on l'annonce, avec le nombre de cartes */}
      <p aria-hidden="true" className="mt-6 flex items-center gap-2 text-sm font-bold text-muted sm:hidden">
        <span className="display text-lg text-red">←→</span> {labels.swipe.replace("{n}", String(shown.length))}
      </p>

      <InView className="deck-stage mt-4 sm:mt-10">
        {/* La clé change à chaque onglet : la grille est recréée et la distribution rejoue */}
        <ul key={active} id="skill-cards" role="tabpanel" aria-label={`${shown.length} ${labels.cards}`} className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pt-2 pb-6 [perspective:1100px] sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 lg:grid-cols-5">
          {shown.map((card, index) => {
            const number = all.indexOf(card) + 1;
            const fan = ((index % 5) - 2) * 7;
            return (
              <li key={`${card.family}-${card.name}`} className="deal w-[46vw] flex-none snap-start sm:w-auto" style={{ animationDelay: `${Math.min(index, 10) * 40}ms`, ["--fan" as string]: `${fan}deg` }}>
                <article className="trading-card relative flex aspect-[4/5] flex-col overflow-hidden rounded-[8px] border-[3px] border-ink bg-panel shadow-[4px_4px_0_var(--shadow)]">
                  {/* Bandeau de famille */}
                  <header className="flex items-center justify-between gap-2 border-b-2 border-ink px-3 py-1 text-xs text-muted">
                    <span className="flex min-w-0 items-center gap-1.5"><span aria-hidden="true" className="size-2 flex-none rounded-full" style={{ background: TINTS[card.tint % 3] }} /><span className="truncate">{card.family}</span></span>
                    <span>#{String(number).padStart(2, "0")}/{all.length}</span>
                  </header>
                  {/* Le logo de la techno, à l'encre, sur la trame */}
                  <div className="dots relative grid flex-1 place-items-center">
                    <span className="display grid place-items-center text-[clamp(1.4rem,3vw,2rem)] text-ink" style={{ width: "62%", aspectRatio: "1" }}>
                      {card.icons.length ? (
                        <span className={`flex items-center justify-center ${card.icons.length > 1 ? "gap-1" : ""}`}>
                          {card.icons.map(icon => <Icon key={icon.title} icon={icon} size={card.icons.length > 1 ? "32%" : "44%"} />)}
                        </span>
                      ) : initials(card.name)}
                    </span>
                  </div>
                  <div className="border-t-[3px] border-ink px-2.5 pt-2 pb-2.5">
                    <h3 className="display text-[clamp(1.05rem,1.6vw,1.35rem)] leading-tight [overflow-wrap:anywhere]">{card.name}</h3>
                    <p className="mt-1 flex items-center justify-between gap-2 text-xs">
                      <span aria-label={levels[card.level - 1]} className="text-lg leading-none text-ink">{"★".repeat(card.level)}<span className="text-muted">{"☆".repeat(3 - card.level)}</span></span>
                      <span className="text-muted">{labels.rarity[card.level - 1]}</span>
                    </p>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      </InView>
    </div>
  );
}

/** Initiales d'une techno : « React.js » → RJ, « Git & GitHub » → GG, « SQL (MySQL…) » → SQL. */
function initials(name: string) {
  const words = name.replace(/\(.*\)/, "").split(/[\s.&·/-]+/).filter(Boolean);
  if (words.length === 1) return words[0].slice(0, 3).toUpperCase();
  return words.slice(0, 2).map(word => word[0]).join("").toUpperCase();
}

/** Pictos maison, au trait, pour les compétences qui ne sont pas une marque. */
const CUSTOM_PATHS: Record<CustomIcon, string> = {
  api: "M8 4H6a2 2 0 0 0-2 2v4l-2 2 2 2v4a2 2 0 0 0 2 2h2M16 4h2a2 2 0 0 1 2 2v4l2 2-2 2v4a2 2 0 0 1-2 2h-2M9 12h.01M12 12h.01M15 12h.01",
  tests: "M9 6h11M9 12h11M9 18h11M3.5 6l1.5 1.5L7.5 4.5M3.5 12l1.5 1.5 2.5-3M3.5 18l1.5 1.5 2.5-3",
  model: "M3 3h7v6H3zM14 15h7v6h-7zM14 3h7v6h-7zM6.5 9v6a2 2 0 0 0 2 2H14M17.5 9v6",
  key: "M10.8 12.2 20 3M17 6l2.5 2.5M14.5 8.5l2 2M8 11a4 4 0 1 0 0 8 4 4 0 0 0 0-8z",
  shield: "M12 2l8 3v6c0 5-3.4 9.3-8 11-4.6-1.7-8-6-8-11V5zM8.5 12l2.5 2.5 4.5-5",
  database: "M4 6c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3zM4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3",
};

function Icon({ icon, size }: { icon: TechIcon; size: string }) {
  return icon.kind === "brand" ? (
    <svg viewBox="0 0 24 24" width={size} aria-hidden="true" className="aspect-square flex-none" fill="currentColor"><path d={icon.path} /></svg>
  ) : (
    <svg viewBox="0 0 24 24" width={size} aria-hidden="true" className="aspect-square flex-none" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d={CUSTOM_PATHS[icon.id]} /></svg>
  );
}
