"use client";

import { useEffect } from "react";

/**
 * Onomatopées de clic : seuls les boutons d'action principaux (et ceux marqués data-sfx) font jaillir un « CLIC ! » (ou un autre bruit)
 * à l'endroit touché. Purement décoratif : rien n'est lu par les lecteurs d'écran.
 */
export function ComicSfx({ words }: { words: string[] }) {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let last = -1;
    const onClick = (event: MouseEvent) => {
      const target = (event.target as Element | null)?.closest(".btn-primary, [data-sfx]");
      if (!target || event.clientX === 0) return;
      // Jamais deux fois le même bruit d'affilée
      let index = Math.floor(Math.random() * words.length);
      if (index === last) index = (index + 1) % words.length;
      last = index;
      const sfx = document.createElement("span");
      sfx.className = "sfx";
      sfx.setAttribute("aria-hidden", "true");
      sfx.textContent = words[index];
      sfx.style.left = `${event.clientX}px`;
      sfx.style.top = `${event.clientY}px`;
      sfx.style.setProperty("--r", `${Math.round(Math.random() * 20 - 10)}deg`);
      document.body.appendChild(sfx);
      sfx.addEventListener("animationend", () => sfx.remove());
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [words]);
  return null;
}
