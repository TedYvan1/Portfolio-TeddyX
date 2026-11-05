"use client";

import { Children, useEffect, useRef, useState } from "react";

/**
 * Le parcours en strip horizontal : la section s'épingle à l'écran et, pendant qu'on défile
 * vers le bas, les cases glissent de droite à gauche. Un avion en papier survole la route
 * en pointillés ; la case au centre grandit, les autres s'inclinent et reculent.
 * Sans JavaScript ou avec moins d'animations : une simple grille de cases.
 */
export function JourneyStrip({ children, fly, hint }: { children: React.ReactNode; fly: string; hint: string }) {
  const outerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const planeRef = useRef<HTMLDivElement>(null);
  const [live, setLive] = useState(false);
  const [height, setHeight] = useState<number | null>(null);
  const items = Children.toArray(children);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Activé après le premier rendu, pour que la version sans JS reste une grille lisible.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLive(true);
  }, []);

  useEffect(() => {
    if (!live) return;
    const outer = outerRef.current;
    const track = trackRef.current;
    const plane = planeRef.current;
    if (!outer || !track || !plane) return;
    let frame = 0;

    // Hauteur à parcourir = distance horizontale du strip + une hauteur d'écran.
    const measure = () => {
      const shift = Math.max(0, track.scrollWidth - window.innerWidth);
      setHeight(shift + window.innerHeight);
    };

    const render = () => {
      frame = 0;
      const rect = outer.getBoundingClientRect();
      const span = Math.max(1, rect.height - window.innerHeight);
      const progress = Math.min(1, Math.max(0, -rect.top / span));
      const shift = Math.max(0, track.scrollWidth - window.innerWidth);
      track.style.transform = `translate3d(${-progress * shift}px, 0, 0)`;

      // Chaque case : plus grande au centre, inclinée et en retrait sur les bords.
      const center = window.innerWidth / 2;
      for (const card of Array.from(track.children) as HTMLElement[]) {
        if (!card.dataset.card) continue;
        const box = card.getBoundingClientRect();
        const offset = (box.left + box.width / 2 - center) / window.innerWidth;
        const scale = 1 - Math.min(Math.abs(offset), 1) * 0.14;
        card.style.transform = `rotate(${(offset * 7).toFixed(2)}deg) scale(${scale.toFixed(3)}) translateY(${(Math.abs(offset) * 30).toFixed(1)}px)`;
      }

      // L'avion avance un peu, monte et descend, et pique du nez en fin de parcours.
      const bob = Math.sin(progress * Math.PI * 6) * 14;
      plane.style.transform = `translate(${progress * 30}vw, ${bob}px) rotate(${(Math.cos(progress * Math.PI * 6) * 8 - progress * 6).toFixed(2)}deg)`;
      plane.dataset.done = progress > 0.97 ? "true" : "false";
    };

    const onScroll = () => { if (!frame) frame = requestAnimationFrame(render); };
    measure();
    render();
    const observer = new ResizeObserver(() => { measure(); render(); });
    observer.observe(track);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [live]);

  if (!live) {
    return <div className="container-site mt-12 grid gap-5 md:grid-cols-3">{items}</div>;
  }

  return (
    <div ref={outerRef} className="relative mt-6" style={{ height: height ?? "300vh" }}>
      <div className="sticky top-[72px] flex h-[calc(100svh-72px)] flex-col justify-center overflow-hidden">
        <p className="container-site eyebrow mb-4 text-right">{hint}</p>
        <div className="relative">
          {/* L'avion en papier, et son onomatopée en fin de course */}
          <div ref={planeRef} aria-hidden="true" className="group pointer-events-none absolute -top-16 left-[6vw] z-20 will-change-transform">
            <svg width="78" height="52" viewBox="0 0 78 52">
              <path d="M2 26 L76 2 L46 50 L36 32 Z" fill="var(--panel)" stroke="var(--ink)" strokeWidth="3" strokeLinejoin="round" />
              <path d="M36 32 L76 2" stroke="var(--ink)" strokeWidth="2.5" />
              <path d="M-30 30 h22 M-40 40 h28 M-24 20 h14" stroke="var(--ink)" strokeWidth="2.5" strokeLinecap="round" opacity="0.5" />
            </svg>
            <span className="pop-title absolute -top-8 left-16 text-3xl plane-sfx whitespace-nowrap">{fly}</span>
          </div>
          <div ref={trackRef} className="relative flex w-max items-center gap-8 px-[8vw] py-10 will-change-transform">
            {/* La route en pointillés que suit l'avion */}
            <span aria-hidden="true" className="absolute inset-x-0 top-1/2 h-0 border-t-[4px] border-dashed border-ink/50" />
            {items.map((item, index) => (
              <div key={index} data-card className="relative w-[min(80vw,420px)] flex-none will-change-transform">{item}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
