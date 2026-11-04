"use client";

import { forceCollide, forceLink, forceManyBody, forceSimulation, forceX, forceY, type Simulation, type SimulationLinkDatum, type SimulationNodeDatum } from "d3-force";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Dictionary } from "@/i18n/dictionaries";
import type { GraphData, GraphNode, NodeGroup } from "@/lib/graph";

type SimNode = GraphNode & SimulationNodeDatum & { phase: number };
type SimLink = SimulationLinkDatum<SimNode> & { kind: "tree" | "uses"; index: number };
type Packet = { link: number; t: number; speed: number };

const GROUP_COLOR: Record<NodeGroup, string> = {
  me: "var(--node-me)",
  project: "var(--node-project)",
  skill: "var(--node-skill)",
  journey: "var(--node-journey)",
  contact: "var(--node-contact)",
};
// Direction de départ de chaque pôle autour du centre (en degrés) : une disposition lisible dès la première image.
const GROUP_ANGLE: Record<NodeGroup, number> = { me: 0, project: -60, skill: -140, journey: 110, contact: 25 };
const FILTERABLE: Exclude<NodeGroup, "me">[] = ["project", "skill", "journey", "contact"];

function radius(node: GraphNode) {
  if (node.kind === "me") return 30;
  if (node.kind === "hub") return 15;
  if (node.kind === "category") return 8;
  return node.group === "skill" ? 5 : node.group === "project" ? 10 : 8;
}

// Sur mobile, seuls le centre et les hubs gardent leur étiquette en permanence ; les autres apparaissent au survol ou au focus.
const showsLabel = (node: GraphNode, compact = false) => (compact ? node.kind === "me" || node.kind === "hub" : node.kind !== "leaf" || node.group !== "skill");

export function NetworkGraph({ data, t }: { data: GraphData; t: Dictionary["graph"] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef(new Map<string, SVGGElement>());
  const linkRefs = useRef<(SVGLineElement | null)[]>([]);
  const packetRefs = useRef<(SVGCircleElement | null)[]>([]);
  const simRef = useRef<Simulation<SimNode, SimLink> | null>(null);
  const nodesRef = useRef<SimNode[]>([]);
  const linksRef = useRef<SimLink[]>([]);
  const cursorRef = useRef<{ x: number; y: number } | null>(null);
  const dragRef = useRef<{ id: string; moved: number; startX: number; startY: number } | null>(null);
  const returnFocusRef = useRef<string | null>(null);

  const [size, setSize] = useState({ width: 0, height: 0 });
  const [hovered, setHovered] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [focused, setFocused] = useState<string | null>(null);
  const [hidden, setHidden] = useState<Set<NodeGroup>>(new Set());
  const [reduceMotion, setReduceMotion] = useState(false);

  const PACKETS = 8;
  const byId = useMemo(() => new Map(data.nodes.map(node => [node.id, node])), [data.nodes]);
  const neighbors = useMemo(() => {
    const map = new Map<string, Set<string>>(data.nodes.map(node => [node.id, new Set([node.id])]));
    data.links.forEach(link => {
      map.get(link.source)?.add(link.target);
      map.get(link.target)?.add(link.source);
    });
    return map;
  }, [data]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduceMotion(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  // Taille du conteneur (le graphe occupe toute la zone, recalculé au redimensionnement).
  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => setSize({ width: Math.round(entry.contentRect.width), height: Math.round(entry.contentRect.height) }));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  // Simulation physique : créée une fois par jeu de données et par taille.
  useEffect(() => {
    if (!size.width || !size.height) return;
    const { width, height } = size;
    const compact = width < 768;
    // Zone à laisser libre sur grand écran : le bloc de texte du héros, mesuré plutôt que deviné.
    const box = containerRef.current?.getBoundingClientRect();
    const text = containerRef.current?.closest("section")?.querySelector("[data-graph-avoid]")?.getBoundingClientRect();
    const avoid = !compact && box && text ? { right: text.right - box.left + 32, bottom: text.bottom - box.top + 24 } : null;
    // Sur mobile, le graphe a sa propre zone : on garde de la place pour la légende en bas.
    const band = { top: 24, bottom: height - 96 };
    const cx = compact ? width / 2 : width * 0.64;
    const cy = compact ? (band.top + band.bottom) / 2 : height * 0.52;
    const spread = Math.min(width, height) / (compact ? 2.6 : 2.4);

    const nodes: SimNode[] = data.nodes.map((node, index) => {
      const angle = (GROUP_ANGLE[node.group] * Math.PI) / 180;
      const distance = node.kind === "me" ? 0 : node.kind === "hub" ? spread * 0.45 : spread * 0.85;
      const jitter = ((index * 37) % 60) - 30;
      return {
        ...node,
        phase: index * 1.7,
        x: cx + Math.cos(angle) * distance + jitter,
        y: cy + Math.sin(angle) * distance + jitter * 0.6,
        ...(node.kind === "me" ? { fx: cx, fy: cy } : {}),
      };
    });
    const links: SimLink[] = data.links.map((link, index) => ({ ...link, index }));
    nodesRef.current = nodes;
    linksRef.current = links;
    const scale = compact ? 0.5 : 1;

    const simulation = forceSimulation<SimNode, SimLink>(nodes)
      .force(
        "link",
        forceLink<SimNode, SimLink>(links)
          .id(node => node.id)
          .distance(link => {
            if (link.kind === "uses") return 170 * scale;
            const source = link.source as SimNode;
            if (source.kind === "me") return 120 * scale;
            if (source.kind === "category") return 34 * scale;
            return 72 * scale;
          })
          .strength(link => (link.kind === "uses" ? 0.03 : 0.7)),
      )
      .force("charge", forceManyBody<SimNode>().strength(node => (node.kind === "me" ? -900 : node.kind === "hub" ? -380 : node.group === "skill" ? -40 : -160) * scale))
      .force("collide", forceCollide<SimNode>(node => radius(node) + (showsLabel(node, compact) ? 16 : 5) * scale))
      .force("x", forceX<SimNode>(cx).strength(0.04))
      .force("y", forceY<SimNode>(cy).strength(compact ? 0.06 : 0.08))
      // Le curseur écarte doucement les nœuds proches : le réseau « réagit » à la souris.
      .force("cursor", alpha => {
        const cursor = cursorRef.current;
        if (!cursor) return;
        for (const node of nodes) {
          if (node.fx != null) continue;
          const dx = (node.x ?? 0) - cursor.x;
          const dy = (node.y ?? 0) - cursor.y;
          const distance2 = dx * dx + dy * dy;
          if (distance2 < 140 * 140 && distance2 > 1) {
            const push = (1 - Math.sqrt(distance2) / 140) * 2.2 * alpha * 10;
            node.vx = (node.vx ?? 0) + (dx / Math.sqrt(distance2)) * push;
            node.vy = (node.vy ?? 0) + (dy / Math.sqrt(distance2)) * push;
          }
        }
      })
      // Sur grand écran, le bloc de texte (en haut à gauche) reste dégagé : les nœuds qui y entrent sont repoussés.
      // Sur mobile, le graphe reste dans sa zone, sans déborder sur les côtés ni sur la légende.
      .force("keepout", alpha => {
        if (compact) {
          const { top, bottom } = band;
          for (const node of nodes) {
            if (node.fx != null) continue;
            const x = node.x ?? 0;
            const y = node.y ?? 0;
            if (y < top) node.vy = (node.vy ?? 0) + (top - y) * 0.08 * alpha * 10;
            if (y > bottom) node.vy = (node.vy ?? 0) - (y - bottom) * 0.08 * alpha * 10;
            if (x < 28) node.vx = (node.vx ?? 0) + (28 - x) * 0.08 * alpha * 10;
            if (x > width - 28) node.vx = (node.vx ?? 0) - (x - width + 28) * 0.08 * alpha * 10;
          }
          return;
        }
        if (!avoid) return;
        const { right, bottom } = avoid;
        for (const node of nodes) {
          if (node.fx != null || (node.x ?? 0) > right || (node.y ?? 0) > bottom) continue;
          node.vx = (node.vx ?? 0) + (right - (node.x ?? 0)) * 0.08 * alpha * 10;
        }
      })
      // Légère dérive permanente : le graphe respire au lieu de se figer.
      .force("drift", () => {
        if (reduceMotion) return;
        const time = performance.now() / 1000;
        for (const node of nodes) {
          if (node.fx != null) continue;
          node.vx = (node.vx ?? 0) + Math.sin(time * 0.6 + node.phase) * 0.012;
          node.vy = (node.vy ?? 0) + Math.cos(time * 0.5 + node.phase) * 0.012;
        }
      });

    const paint = () => {
      for (const node of nodes) {
        nodeRefs.current.get(node.id)?.setAttribute("transform", `translate(${node.x?.toFixed(1)},${node.y?.toFixed(1)})`);
      }
      for (const link of links) {
        const element = linkRefs.current[link.index];
        if (!element) continue;
        const source = link.source as SimNode;
        const target = link.target as SimNode;
        element.setAttribute("x1", String(source.x));
        element.setAttribute("y1", String(source.y));
        element.setAttribute("x2", String(target.x));
        element.setAttribute("y2", String(target.y));
      }
    };

    if (reduceMotion) {
      simulation.stop();
      simulation.tick(320);
      paint();
    } else {
      simulation.alphaTarget(0.015).on("tick", paint);
    }
    simRef.current = simulation;
    return () => {
      simulation.stop();
    };
  }, [data, size, reduceMotion]);

  // Paquets de données le long des liens (arrêtés hors écran, désactivés si animations réduites).
  useEffect(() => {
    if (reduceMotion || !size.width) return;
    const packets: Packet[] = Array.from({ length: PACKETS }, (_, index) => ({ link: index % Math.max(1, data.links.length), t: (index * 0.13) % 1, speed: 0.004 + (index % 5) * 0.0012 }));
    let frame = 0;
    let visible = true;
    const io = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting));
    if (containerRef.current) io.observe(containerRef.current);

    const loop = () => {
      frame = requestAnimationFrame(loop);
      if (!visible || document.hidden) return;
      const links = linksRef.current;
      packets.forEach((packet, index) => {
        const element = packetRefs.current[index];
        const link = links[packet.link];
        if (!element || !link) return;
        packet.t += packet.speed;
        if (packet.t >= 1) {
          packet.t = 0;
          packet.link = Math.floor(Math.random() * links.length);
        }
        const source = link.source as SimNode;
        const target = link.target as SimNode;
        element.setAttribute("cx", String((source.x ?? 0) + ((target.x ?? 0) - (source.x ?? 0)) * packet.t));
        element.setAttribute("cy", String((source.y ?? 0) + ((target.y ?? 0) - (source.y ?? 0)) * packet.t));
        element.setAttribute("fill", GROUP_COLOR[target.group]);
      });
    };
    loop();
    return () => {
      cancelAnimationFrame(frame);
      io.disconnect();
    };
  }, [data.links.length, reduceMotion, size.width]);

  // ── Interactions
  const toLocal = (event: React.PointerEvent) => {
    const rect = containerRef.current!.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };

  const onPointerMove = (event: React.PointerEvent) => {
    const point = toLocal(event);
    cursorRef.current = event.pointerType === "mouse" ? point : null;
    const drag = dragRef.current;
    if (drag) {
      const node = nodesRef.current.find(item => item.id === drag.id);
      if (node && node.kind !== "me") {
        node.fx = point.x;
        node.fy = point.y;
      }
      drag.moved = Math.max(drag.moved, Math.hypot(point.x - drag.startX, point.y - drag.startY));
    }
  };

  const onNodePointerDown = (event: React.PointerEvent, id: string) => {
    event.stopPropagation();
    (event.currentTarget as Element).setPointerCapture(event.pointerId);
    const point = toLocal(event);
    dragRef.current = { id, moved: 0, startX: point.x, startY: point.y };
    simRef.current?.alphaTarget(0.25).restart();
  };

  const onNodePointerUp = (id: string) => {
    const drag = dragRef.current;
    dragRef.current = null;
    const node = nodesRef.current.find(item => item.id === id);
    if (node && node.kind !== "me") {
      node.fx = null;
      node.fy = null;
    }
    simRef.current?.alphaTarget(reduceMotion ? 0 : 0.015);
    if (!drag || drag.moved < 5) open(id);
  };

  const open = (id: string) => {
    returnFocusRef.current = id;
    setSelected(id);
  };
  const close = () => {
    setSelected(null);
    const id = returnFocusRef.current;
    if (id) requestAnimationFrame(() => nodeRefs.current.get(id)?.focus());
  };

  useEffect(() => {
    if (!selected) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const toggleGroup = (group: NodeGroup) =>
    setHidden(current => {
      const next = new Set(current);
      if (next.has(group)) next.delete(group);
      else next.add(group);
      return next;
    });

  const spotlight = hovered ?? selected ?? focused;
  const lit = spotlight ? neighbors.get(spotlight) : null;
  const isHidden = (node: GraphNode) => node.group !== "me" && hidden.has(node.group);
  const selectedNode = selected ? byId.get(selected) : null;

  return (
    <div className="relative h-full w-full">
      <div
        ref={containerRef}
        className="absolute inset-0 touch-none select-none"
        onPointerMove={onPointerMove}
        onPointerLeave={() => (cursorRef.current = null)}
      >
        {size.width > 0 && (
          <svg width={size.width} height={size.height} viewBox={`0 0 ${size.width} ${size.height}`} role="group" aria-label={t.label} className="block">
            {/* Mise en réseau au chargement : les liens apparaissent une fois leurs nœuds en place. */}
            <g aria-hidden="true" className="graph-links-boot">
              {data.links.map((link, index) => {
                const source = byId.get(link.source)!;
                const target = byId.get(link.target)!;
                const active = lit ? lit.has(link.source) && lit.has(link.target) && (link.source === spotlight || link.target === spotlight) : true;
                const gone = isHidden(source) || isHidden(target);
                return (
                  <line
                    key={index}
                    ref={element => {
                      linkRefs.current[index] = element;
                    }}
                    stroke={link.kind === "uses" ? GROUP_COLOR.project : "var(--muted)"}
                    strokeWidth={link.kind === "uses" ? 1 : 1.1}
                    strokeDasharray={link.kind === "uses" ? "3 5" : undefined}
                    opacity={gone ? 0 : spotlight ? (active ? 0.75 : 0.06) : link.kind === "uses" ? 0.22 : 0.28}
                    style={{ transition: "opacity 0.25s" }}
                  />
                );
              })}
              {Array.from({ length: PACKETS }, (_, index) => (
                <circle
                  key={index}
                  r={2.2}
                  ref={element => {
                    packetRefs.current[index] = element;
                  }}
                  opacity={spotlight || hidden.size ? 0.25 : 0.9}
                />
              ))}
            </g>

            {data.nodes.map((node, index) => {
              const r = radius(node);
              const color = GROUP_COLOR[node.group];
              const dim = (lit && !lit.has(node.id)) || isHidden(node);
              const emphasized = spotlight === node.id;
              const permanentLabel = showsLabel(node, size.width < 768);
              const labelVisible = permanentLabel || (lit?.has(node.id) ?? false);
              return (
                <g
                  key={node.id}
                  ref={element => {
                    if (element) nodeRefs.current.set(node.id, element);
                    else nodeRefs.current.delete(node.id);
                  }}
                  role="button"
                  tabIndex={isHidden(node) ? -1 : 0}
                  aria-label={`${node.group === "me" ? t.me : t.groups[node.group]} : ${node.label}`}
                  aria-haspopup="dialog"
                  className="cursor-pointer outline-none"
                  style={{ opacity: isHidden(node) ? 0.04 : dim ? 0.22 : 1, transition: "opacity 0.25s", pointerEvents: isHidden(node) ? "none" : undefined }}
                  onPointerEnter={() => setHovered(node.id)}
                  onPointerLeave={() => setHovered(current => (current === node.id ? null : current))}
                  onPointerDown={event => onNodePointerDown(event, node.id)}
                  onPointerUp={() => onNodePointerUp(node.id)}
                  onFocus={() => setFocused(node.id)}
                  onBlur={() => setFocused(current => (current === node.id ? null : current))}
                  onKeyDown={event => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      open(node.id);
                    }
                  }}
                >
                  {/* zone de clic élargie (cible tactile d'au moins 32 px) */}
                  <circle r={Math.max(r + 8, 16)} fill="transparent" />
                  {emphasized && <circle className="node-halo" r={r + 9} fill="none" stroke={color} strokeOpacity={0.45} strokeWidth={1.5} />}
                  {focused === node.id && <circle r={r + 13} fill="none" stroke="var(--accent)" strokeWidth={2} />}
                  {/* Apparition en vagues depuis le centre : moi, puis les hubs, les catégories, les feuilles. */}
                  <g className="node-boot" style={{ animationDelay: `${bootDelay(node, index)}ms` }}>
                    <NodeShape node={node} r={r} color={color} />
                  </g>
                  {labelVisible && (
                    <text
                      aria-hidden="true"
                      y={node.kind === "me" ? r + 22 : r + 15}
                      textAnchor="middle"
                      className={`${permanentLabel ? "label-boot" : "label-in"} ${node.kind === "me" ? "fill-foreground text-[15px] font-bold" : node.kind === "hub" ? "fill-foreground text-[13px] font-semibold" : "fill-[var(--muted)] text-[11.5px]"}`}
                      style={{ paintOrder: "stroke", stroke: "var(--background)", strokeWidth: 4, strokeLinejoin: "round", animationDelay: permanentLabel ? `${bootDelay(node, index) + 120}ms` : undefined }}
                    >
                      {node.label}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        )}
      </div>

      {/* Légende = filtres */}
      <div className="pointer-events-auto absolute bottom-4 left-4 right-4 flex flex-wrap items-center gap-2 sm:right-auto" role="group" aria-label={t.legend}>
        {FILTERABLE.map(group => (
          <button
            key={group}
            type="button"
            aria-pressed={!hidden.has(group)}
            onClick={() => toggleGroup(group)}
            className={`chip transition-opacity ${hidden.has(group) ? "opacity-45" : ""}`}
          >
            <span aria-hidden="true" className={`glyph glyph-${group}`} />
            {t.groups[group]}
          </button>
        ))}
      </div>

      {selectedNode && <NodePanel node={selectedNode} onClose={close} closeLabel={t.close} groupLabel={selectedNode.group === "me" ? t.me : t.groups[selectedNode.group]} />}
    </div>
  );
}

/** Délai d'apparition d'un nœud (ms) : par niveau, avec un léger décalage entre voisins, plafonné. */
function bootDelay(node: GraphNode, index: number) {
  const level = { me: 0, hub: 160, category: 300, leaf: 380 }[node.kind];
  return node.kind === "me" ? 0 : level + Math.min(index % 12, 11) * 22;
}

function NodeShape({ node, r, color }: { node: GraphNode; r: number; color: string }) {
  if (node.kind === "me") {
    return (
      <>
        <circle r={r + 6} fill="none" stroke="var(--node-me)" strokeOpacity={0.18} strokeWidth={6} />
        <circle r={r} fill="var(--node-me)" />
        <text textAnchor="middle" dy="0.35em" className="fill-[var(--background)] text-[15px] font-bold" aria-hidden="true">
          TYK
        </text>
      </>
    );
  }
  if (node.kind === "hub" || node.kind === "category") {
    return (
      <>
        <circle r={r} fill="var(--background)" stroke={color} strokeWidth={node.kind === "hub" ? 2 : 1.5} />
        <circle r={node.kind === "hub" ? 4 : 2.5} fill={color} />
      </>
    );
  }
  if (node.group === "project") return <rect x={-r} y={-r} width={r * 2} height={r * 2} rx={3} fill={color} />;
  if (node.group === "journey") return <rect x={-r * 0.75} y={-r * 0.75} width={r * 1.5} height={r * 1.5} transform="rotate(45)" fill={color} />;
  if (node.group === "contact") return <circle r={r - 1} fill="var(--background)" stroke={color} strokeWidth={2.5} />;
  return <circle r={r} fill={color} />;
}

function NodePanel({ node, onClose, closeLabel, groupLabel }: { node: GraphNode; onClose: () => void; closeLabel: string; groupLabel: string }) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => headingRef.current?.focus(), [node.id]);
  const { detail } = node;
  return (
    <aside
      role="dialog"
      aria-modal="false"
      aria-labelledby="node-panel-title"
      className="panel panel-in pointer-events-auto absolute inset-x-3 bottom-3 z-20 max-h-[70%] overflow-y-auto p-6 sm:inset-x-auto sm:bottom-auto sm:right-5 sm:top-5 sm:w-[380px]"
    >
      <div className="flex items-start justify-between gap-4">
        <p className="eyebrow flex items-center gap-2">
          <span aria-hidden="true" className={`glyph glyph-${node.group === "me" ? "project" : node.group}`} />
          {groupLabel} · {detail.eyebrow}
        </p>
        <button type="button" onClick={onClose} className="-mr-2 -mt-2 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-(--radius) border border-border transition-colors hover:border-muted" aria-label={closeLabel}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
        </button>
      </div>
      <h2 id="node-panel-title" ref={headingRef} tabIndex={-1} className="mt-3 text-2xl leading-tight font-bold tracking-tight outline-none">
        {detail.title}
      </h2>
      {detail.body && <p className="mt-3 text-[15px] leading-7 text-muted">{detail.body}</p>}
      {detail.tags && detail.tags.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-2">
          {detail.tags.map(tag => <li key={tag} className="chip">{tag}</li>)}
        </ul>
      )}
      {detail.action && (
        <a href={detail.action.href} className="btn btn-primary mt-6" {...(detail.action.external ? { target: "_blank", rel: "noreferrer" } : {})}>
          {detail.action.label} <span aria-hidden="true">→</span>
        </a>
      )}
    </aside>
  );
}
