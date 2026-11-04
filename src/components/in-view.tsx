"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Pose data-inview sur son conteneur pour déclencher une animation CSS quand il entre à l'écran.
 * Sans JavaScript, ou s'il est déjà visible au chargement, rien n'est masqué : seuls les blocs encore
 * sous la ligne de flottaison sont mis en attente (data-inview="false"), hors de la vue de l'utilisateur.
 */
export function InView({ children, className, as: Tag = "div" }: { children: React.ReactNode; className?: string; as?: "div" | "ol" | "ul" }) {
  const ref = useRef<HTMLElement>(null);
  const [state, setState] = useState<"idle" | "waiting" | "seen">("idle");

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    let first = true;
    const observer = new IntersectionObserver(
      ([entry]) => {
        const below = entry.boundingClientRect.top >= window.innerHeight;
        if (first) {
          first = false;
          // Déjà visible (ou déjà dépassé) au chargement : on n'anime pas, on laisse tel quel.
          if (!below) return observer.disconnect();
          setState("waiting");
          return;
        }
        if (!entry.isIntersecting) return;
        setState("seen");
        observer.disconnect();
      },
      { threshold: 0.3 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag ref={ref as React.Ref<never>} className={className} data-inview={state === "idle" ? undefined : state === "seen"}>
      {children}
    </Tag>
  );
}
