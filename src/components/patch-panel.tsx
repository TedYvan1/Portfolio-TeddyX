"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import type { Dictionary } from "@/i18n/dictionaries";

export type Port = {
  id: string;
  label: string;
  href: string;
  external?: boolean;
  /** Un câble est branché (contenu disponible) ; sinon le port est « libre », voyant éteint. */
  plugged: boolean;
};

const CABLE_COLORS = ["var(--cable-orange)", "var(--cable-blue)", "var(--cable-green)", "var(--cable-brown)"];

type Cable = {
  index: number;
  color: string;
  sx: number; sy: number; ex: number; ey: number;
  plugW: number; plugH: number;
  swing: number; swingVel: number;
  plug: number; plugVel: number;
  drop: number; dropVel: number;
  packets: number[];
  nextPacket: number;
};

/** Point d'une courbe de Bézier cubique, pour poser les paquets sur le câble. */
function bezier(t: number, p0: number, p1: number, p2: number, p3: number) {
  const u = 1 - t;
  return u * u * u * p0 + 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t * p3;
}

function geometry(cable: Cable) {
  const sy = cable.sy + cable.plug + cable.plugH + 10;
  const ey = sy + (cable.ey - sy) * cable.drop;
  const length = ey - sy;
  const c1x = cable.sx + cable.swing * 0.35;
  const c1y = sy + length * 0.5;
  const c2x = cable.ex + cable.swing;
  const c2y = ey - length * 0.42;
  return { sx: cable.sx, sy, c1x, c1y, c2x, c2y, ex: cable.ex + cable.swing * 0.2, ey };
}

/**
 * Panneau de brassage de l'accueil. Chaque port est un vrai lien (clavier, lecteur d'écran) ;
 * les câbles sont un décor SVG animé à la main : ils tombent au chargement, se balancent quand
 * le curseur les traverse, et transportent des paquets quand on survole leur port.
 */
export function PatchPanel({ ports, t }: { ports: Port[]; t: Dictionary["panel"] }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const socketRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const activeRef = useRef<number | null>(null);
  const cablesRef = useRef<Cable[]>([]);

  useEffect(() => {
    const wrap = wrapRef.current;
    const svg = svgRef.current;
    if (!wrap || !svg) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const NS = "http://www.w3.org/2000/svg";
    let frame = 0;
    let last = performance.now();
    let pointer: { x: number; y: number; t: number } | null = null;

    // Mesure les prises et (re)crée les câbles. On garde l'élan des câbles existants.
    const build = () => {
      const box = wrap.getBoundingClientRect();
      svg.setAttribute("viewBox", `0 0 ${box.width} ${box.height}`);
      const rects = socketRefs.current.map(el => el?.getBoundingClientRect() ?? null);
      const previous = new Map(cablesRef.current.map(cable => [cable.index, cable]));
      const cables: Cable[] = [];
      const center = box.width / 2;
      ports.forEach((port, index) => {
        const rect = rects[index];
        if (!port.plugged || !rect) return;
        // Pas de câble si une autre prise se trouve juste en dessous (deux rangées sur mobile).
        const blocked = rects.some((other, otherIndex) => other && otherIndex !== index && other.top > rect.bottom && Math.abs(other.left - rect.left) < rect.width / 2);
        if (blocked) return;
        const sx = rect.left - box.left + rect.width / 2;
        const sy = rect.top - box.top + rect.height * 0.4;
        // Les câbles convergent vers le chemin de câbles, au centre, en restant un peu écartés.
        const ex = sx + (center - sx) * 0.42 + (index - ports.length / 2) * 6;
        const old = previous.get(index);
        cables.push({
          index, color: CABLE_COLORS[index % CABLE_COLORS.length],
          sx, sy, ex, ey: box.height + 40,
          plugW: rect.width * 0.56, plugH: rect.height * 0.5,
          swing: old?.swing ?? (reduced ? 0 : (index % 2 ? 40 : -40)), swingVel: old?.swingVel ?? 0,
          plug: old?.plug ?? (reduced ? 0 : -18), plugVel: old?.plugVel ?? 0,
          drop: old?.drop ?? (reduced ? 1 : 0.05), dropVel: old?.dropVel ?? 0,
          packets: old?.packets ?? [], nextPacket: old?.nextPacket ?? 1.5 + index * 0.7,
        });
      });
      cablesRef.current = cables;

      // Un groupe SVG par câble : contour, gaine, reflet, fiche RJ45, paquets.
      svg.replaceChildren();
      for (const cable of cables) {
        const group = document.createElementNS(NS, "g");
        group.setAttribute("class", "cable-in");
        group.dataset.index = String(cable.index);
        group.innerHTML = `
          <path data-part="outline" fill="none" stroke="rgb(0 0 0 / 0.45)" stroke-width="10" stroke-linecap="round"/>
          <path data-part="sheath" fill="none" stroke="${cable.color}" stroke-width="7.5" stroke-linecap="round"/>
          <path data-part="shine" fill="none" stroke="rgb(255 255 255 / 0.28)" stroke-width="1.6" stroke-linecap="round" transform="translate(-1.6 0)"/>
          <g data-part="plug">
            <rect x="${-cable.plugW / 2}" y="0" width="${cable.plugW}" height="${cable.plugH}" rx="1.5" fill="rgb(225 232 238 / 0.55)" stroke="rgb(255 255 255 / 0.5)" stroke-width="0.8"/>
            <rect x="${-cable.plugW / 2 + 3}" y="2" width="${cable.plugW - 6}" height="${cable.plugH * 0.32}" fill="none" stroke="#c8a24a" stroke-width="0.8" stroke-dasharray="1.2 1.6"/>
            <path d="M ${-cable.plugW / 2 + 2} ${cable.plugH} L ${cable.plugW / 2 - 2} ${cable.plugH} L ${cable.plugW / 4} ${cable.plugH + 12} L ${-cable.plugW / 4} ${cable.plugH + 12} Z" fill="${cable.color}" stroke="rgb(0 0 0 / 0.35)" stroke-width="0.8"/>
          </g>
          <g data-part="packets"></g>`;
        svg.appendChild(group);
      }
      draw();
    };

    const draw = () => {
      const groups = svg.children;
      cablesRef.current.forEach((cable, i) => {
        const group = groups[i] as SVGGElement | undefined;
        if (!group) return;
        const g = geometry(cable);
        const d = `M ${g.sx} ${g.sy} C ${g.c1x} ${g.c1y} ${g.c2x} ${g.c2y} ${g.ex} ${g.ey}`;
        group.querySelectorAll<SVGPathElement>("path[data-part]").forEach(path => path.setAttribute("d", d));
        group.querySelector('[data-part="plug"]')?.setAttribute("transform", `translate(${cable.sx} ${cable.sy + cable.plug - 2})`);
        const holder = group.querySelector('[data-part="packets"]');
        if (holder) {
          holder.innerHTML = cable.packets
            .map(p => `<circle cx="${bezier(p, g.sx, g.c1x, g.c2x, g.ex)}" cy="${bezier(p, g.sy, g.c1y, g.c2y, g.ey)}" r="2.6" fill="#fff6d8" style="filter: drop-shadow(0 0 4px var(--led-act))"/>`)
            .join("");
        }
      });
    };

    const step = (now: number) => {
      const dt = Math.min(0.033, (now - last) / 1000);
      last = now;
      for (const cable of cablesRef.current) {
        // Ressorts amortis : balancement, fiche qui se réenclenche, chute à l'arrivée.
        cable.swingVel += (-38 * cable.swing - 2.6 * cable.swingVel) * dt;
        cable.swing += cable.swingVel * dt;
        cable.plugVel += (-420 * cable.plug - 22 * cable.plugVel) * dt;
        cable.plug += cable.plugVel * dt;
        cable.dropVel += (-90 * (cable.drop - 1) - 11 * cable.dropVel) * dt;
        cable.drop += cable.dropVel * dt;

        // Trafic : en continu sur le port survolé, de temps en temps ailleurs.
        const active = activeRef.current === cable.index;
        cable.nextPacket -= dt;
        if (cable.nextPacket <= 0) {
          cable.packets.push(1);
          cable.nextPacket = active ? 0.16 : 2.5 + Math.random() * 4;
        }
        if (active && cable.nextPacket > 0.3) cable.nextPacket = 0.05;
        cable.packets = cable.packets.map(p => p - dt * (active ? 1.4 : 0.55)).filter(p => p > 0);
      }
      draw();
      frame = requestAnimationFrame(step);
    };

    // Le curseur pousse les câbles qu'il traverse, selon sa vitesse horizontale.
    const onPointerMove = (event: PointerEvent) => {
      const box = wrap.getBoundingClientRect();
      const x = event.clientX - box.left;
      const y = event.clientY - box.top;
      const now = performance.now();
      if (pointer && now - pointer.t < 80) {
        const vx = ((x - pointer.x) / Math.max(1, now - pointer.t)) * 1000;
        for (const cable of cablesRef.current) {
          const g = geometry(cable);
          if (y < g.sy || y > g.ey) continue;
          const tt = (y - g.sy) / (g.ey - g.sy);
          const cx = bezier(tt, g.sx, g.c1x, g.c2x, g.ex);
          const distance = Math.abs(cx - x);
          if (distance < 30) cable.swingVel += vx * 0.22 * (1 - distance / 30) * Math.sin(Math.PI * Math.min(1, tt * 1.4));
          cable.swingVel = Math.max(-900, Math.min(900, cable.swingVel));
        }
      }
      pointer = { x, y, t: now };
    };

    build();
    const observer = new ResizeObserver(() => build());
    observer.observe(wrap);
    if (!reduced) {
      frame = requestAnimationFrame(step);
      wrap.addEventListener("pointermove", onPointerMove);
    }
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      wrap.removeEventListener("pointermove", onPointerMove);
    };
  }, [ports]);

  // Clic : la fiche se déloge puis se réenclenche, le câble accuse le coup.
  const reseat = (index: number) => {
    const cable = cablesRef.current.find(item => item.index === index);
    if (!cable) return;
    cable.plugVel += 260;
    cable.swingVel += index % 2 ? 160 : -160;
  };

  return (
    <div ref={wrapRef} className="relative">
      <div className="relative z-10 flex items-stretch rounded-[4px] bg-rack text-[var(--rack-ink)] shadow-[0_1px_0_var(--rack-edge)_inset,0_24px_40px_-24px_rgb(0_0_0/0.6)]">
        {/* Oreilles de fixation du rack */}
        <div aria-hidden="true" className="hidden w-10 flex-none flex-col items-center justify-between border-r border-black/40 py-4 sm:flex">
          <span className="screw" /><span className="screw" style={{ ["--screw-angle" as string]: "-20deg" }} />
        </div>
        <div className="min-w-0 flex-1 px-3 pt-3 pb-4 sm:px-6">
          <div className="flex items-center justify-between gap-4">
            <span className="silk">{t.serial}</span>
            <span className="silk hidden sm:inline">1U</span>
          </div>
          <ul aria-label={t.label} className="mt-3 grid grid-cols-4 gap-x-3 gap-y-6 sm:grid-cols-8 sm:gap-x-2.5 lg:gap-x-5">
            {ports.map((port, index) => {
              const number = String(index + 1).padStart(2, "0");
              const content = (
                <>
                  {/* Comme sur une vraie baie : l'étiquette au-dessus, le câble pend librement en dessous. */}
                  <span className="tape w-full justify-center px-1 text-[0.68rem] tracking-[0.04em] sm:text-[0.62rem] lg:text-[0.76rem] lg:tracking-[0.08em]">{port.label}</span>
                  <span className="mt-2 flex w-full max-w-[84px] items-center justify-between">
                    <span className="silk text-[0.6rem]">{number}</span>
                    <span aria-hidden="true" className="flex gap-1">
                      <span className={`led ${port.plugged ? "led-on" : ""}`} />
                      <span className={`led ${port.plugged ? "led-act" : ""}`} style={{ ["--blink" as string]: `${1.3 + ((index * 7) % 5) * 0.37}s` }} />
                    </span>
                  </span>
                  <span ref={el => { socketRefs.current[index] = el; }} aria-hidden="true" className="port-socket mt-1.5 max-w-[84px]" />
                  <span className="sr-only"> — {t.port} {number}, {port.plugged ? t.linked : t.free}</span>
                </>
              );
              const props = {
                className: "port flex flex-col items-center rounded-[2px] outline-offset-4",
                onPointerEnter: () => { activeRef.current = index; },
                onPointerLeave: () => { if (activeRef.current === index) activeRef.current = null; },
                onFocus: () => { activeRef.current = index; },
                onBlur: () => { if (activeRef.current === index) activeRef.current = null; },
                onClick: () => reseat(index),
              };
              return (
                <li key={port.id}>
                  {port.external ? (
                    <a href={port.href} target="_blank" rel="noreferrer" {...props}>{content}</a>
                  ) : (
                    <Link href={port.href} {...props}>{content}</Link>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
        <div aria-hidden="true" className="hidden w-10 flex-none flex-col items-center justify-between border-l border-black/40 py-4 sm:flex">
          <span className="screw" style={{ ["--screw-angle" as string]: "70deg" }} /><span className="screw" />
        </div>
      </div>

      {/* Espace où pendent les câbles, jusqu'au chemin de câbles hors champ */}
      <div aria-hidden="true" className="h-[150px] md:h-[210px]" />
      <svg ref={svgRef} aria-hidden="true" className="pointer-events-none absolute inset-0 z-20 h-full w-full overflow-visible [mask-image:linear-gradient(to_bottom,black_72%,transparent)]" />
    </div>
  );
}
