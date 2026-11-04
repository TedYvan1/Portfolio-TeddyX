import type { Dictionary } from "@/i18n/dictionaries";

export type MapNode = { id: string; label: string; href: string; active: boolean };

// Positions des nœuds autour du routeur central (repère 560 × 500).
const SPOTS = [
  { x: 120, y: 78 }, { x: 440, y: 70 }, { x: 492, y: 250 },
  { x: 440, y: 430 }, { x: 120, y: 428 }, { x: 72, y: 252 },
];
const CENTER = { x: 280, y: 250 };

/** Rectangle « tracé à main levée » : coins légèrement décalés, second passage du stylo. */
function sketchBox(cx: number, cy: number, w: number, h: number, seed: number) {
  const j = (n: number) => ((seed * 13 + n * 7) % 5) - 2;
  const x0 = cx - w / 2, y0 = cy - h / 2, x1 = cx + w / 2, y1 = cy + h / 2;
  return {
    body: `M${x0 + j(1)} ${y0 + j(2)} L${x1 + j(3)} ${y0 + j(4)} L${x1 + j(5)} ${y1 + j(6)} L${x0 + j(7)} ${y1 + j(8)} Z`,
    pass: `M${x0 - 3} ${y0 + 4} Q${cx} ${y0 - 2 + j(9)} ${x1 + 2} ${y0 + 1}`,
  };
}

/**
 * Accueil : le schéma réseau de Ted, dessiné au stylo dans le carnet.
 * Un routeur au centre, un nœud par partie du site. Les traits s'écrivent au chargement,
 * des paquets circulent sur les liaisons ; survoler un nœud le surligne et fait « bouillir » son trait.
 * Chaque nœud est un vrai lien (clavier, lecteur d'écran).
 */
export function SketchMap({ name, nodes, t }: { name: string; nodes: MapNode[]; t: Dictionary["panel"] }) {
  return (
    <svg viewBox="0 0 560 500" className="h-auto w-full overflow-visible" role="group" aria-label={t.label}>
      <defs>
        <filter id="boil">
          <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="1" seed="1">
            <animate attributeName="seed" values="1;2;3;4;5" dur="0.5s" repeatCount="indefinite" calcMode="discrete" />
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" scale="3.5" />
        </filter>
      </defs>

      {nodes.map((node, index) => {
        const spot = SPOTS[index % SPOTS.length];
        const width = Math.max(112, node.label.length * 12 + 40);
        const box = sketchBox(spot.x, spot.y, width, 48, index + 3);
        // Liaison courbe : point de contrôle décalé perpendiculairement, un coup à gauche, un coup à droite.
        const mx = (CENTER.x + spot.x) / 2, my = (CENTER.y + spot.y) / 2;
        const dx = spot.y - CENTER.y, dy = CENTER.x - spot.x;
        const length = Math.hypot(dx, dy) || 1;
        const bend = index % 2 ? 22 : -22;
        const link = `M${CENTER.x} ${CENTER.y} Q${mx + (dx / length) * bend} ${my + (dy / length) * bend} ${spot.x} ${spot.y}`;
        const delay = 700 + index * 130;
        return (
          <a key={node.id} href={node.href} className="map-node" aria-label={`${String(index + 1).padStart(2, "0")} — ${node.label}`}>
            <path id={`link-${node.id}`} d={link} pathLength={1} className="ink link-line" strokeWidth="2.2" strokeDasharray={node.active ? undefined : "0.02 0.025"} style={{ ["--d" as string]: `${delay}ms` }} />
            {node.active && (
              <circle r="4.5" className="packet">
                <animateMotion dur={`${2.2 + (index % 3) * 0.5}s`} begin={`${2.4 + index * 0.45}s`} repeatCount="indefinite" keyPoints={index % 2 ? "1;0" : "0;1"} keyTimes="0;1" calcMode="linear">
                  <mpath href={`#link-${node.id}`} />
                </animateMotion>
              </circle>
            )}
            <g className="node-box">
              <path d={box.body} className="node-fill" />
              <g className="boil text-ink">
                <path d={box.body} pathLength={1} className="ink" strokeWidth="2" style={{ ["--d" as string]: `${delay + 260}ms`, ["--dur" as string]: "520ms" }} />
                <path d={box.pass} pathLength={1} className="ink" strokeWidth="1.3" style={{ ["--d" as string]: `${delay + 700}ms`, ["--dur" as string]: "260ms" }} />
              </g>
              <g className="node-label" style={{ ["--d" as string]: `${delay + 500}ms` }}>
                <text x={spot.x - width / 2 + 2} y={spot.y - 32} fontSize="13" fontFamily="var(--font-code), cursive" fill="var(--ink-2)">{String(index + 1).padStart(2, "0")}</text>
                <text x={spot.x} y={spot.y + 7} textAnchor="middle" fontSize="21" fontWeight="700" fontFamily="var(--font-body), cursive" className="node-text" fill="var(--ink)">{node.label}</text>
              </g>
            </g>
          </a>
        );
      })}

      {/* Le routeur central : le nom de Ted entouré au stylo, ses antennes, sa note de marge */}
      <g aria-hidden="true">
        <ellipse cx={CENTER.x} cy={CENTER.y} rx="96" ry="52" fill="var(--sheet)" />
        <path d={`M${CENTER.x - 92} ${CENTER.y + 8} C ${CENTER.x - 100} ${CENTER.y - 58}, ${CENTER.x + 104} ${CENTER.y - 62}, ${CENTER.x + 96} ${CENTER.y + 2} C ${CENTER.x + 90} ${CENTER.y + 60}, ${CENTER.x - 86} ${CENTER.y + 62}, ${CENTER.x - 98} ${CENTER.y - 6}`} pathLength={1} className="ink text-ink" strokeWidth="2.6" style={{ ["--dur" as string]: "800ms" }} />
        <path d={`M${CENTER.x - 30} ${CENTER.y - 50} l-12 -26 M${CENTER.x + 30} ${CENTER.y - 50} l12 -26`} pathLength={1} className="ink text-ink" strokeWidth="2.4" style={{ ["--d" as string]: "650ms", ["--dur" as string]: "300ms" }} />
        <rect x={CENTER.x - 54} y={CENTER.y - 20} width="108" height="44" fill="var(--hl)" className="logo-hl" style={{ transformOrigin: `${CENTER.x - 54}px ${CENTER.y}px`, animationDelay: "0.9s" }} />
        <text x={CENTER.x} y={CENTER.y + 14} textAnchor="middle" fontSize="34" fontWeight="700" fontFamily="var(--font-body), cursive" fill="var(--on-hl)" className="rise" style={{ animationDelay: "0.4s" }}>{name}</text>
        <text x={CENTER.x + 64} y={CENTER.y - 72} fontSize="24" fontWeight="700" fontFamily="var(--font-note), cursive" fill="var(--hl)" transform={`rotate(-6 ${CENTER.x + 64} ${CENTER.y - 72})`} className="rise" style={{ animationDelay: "1.6s" }}>{t.router}</text>
      </g>
    </svg>
  );
}
