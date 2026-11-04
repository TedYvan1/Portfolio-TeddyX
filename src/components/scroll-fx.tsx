"use client";

import { useEffect } from "react";

/**
 * Effet de vitesse : quand on défile vite, les cases marquées `.skewable` se tordent légèrement
 * dans le sens du mouvement, puis se redressent avec un ressort — comme un dessin de BD en mouvement.
 * Désactivé si l'utilisateur a demandé moins d'animations.
 */
export function ScrollFx() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const root = document.documentElement;
    let lastY = window.scrollY;
    let lastT = performance.now();
    let skew = 0;
    let target = 0;
    let frame = 0;

    const loop = () => {
      // La cible retombe vers zéro, la valeur affichée la suit avec un léger retard.
      target *= 0.86;
      skew += (target - skew) * 0.18;
      root.style.setProperty("--skew", `${skew.toFixed(3)}deg`);
      frame = Math.abs(skew) > 0.01 || Math.abs(target) > 0.01 ? requestAnimationFrame(loop) : 0;
      if (!frame) root.style.setProperty("--skew", "0deg");
    };

    const onScroll = () => {
      const now = performance.now();
      const velocity = (window.scrollY - lastY) / Math.max(8, now - lastT); // px par ms
      lastY = window.scrollY;
      lastT = now;
      target = Math.max(-3.5, Math.min(3.5, velocity * -1.6));
      if (!frame) frame = requestAnimationFrame(loop);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
      root.style.removeProperty("--skew");
    };
  }, []);
  return null;
}
