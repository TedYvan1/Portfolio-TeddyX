"use client";

import { useEffect, useSyncExternalStore } from "react";

type Theme = "light" | "dark";

function current(): Theme {
  const forced = document.documentElement.dataset.theme;
  if (forced === "light" || forced === "dark") return forced;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function subscribe(callback: () => void) {
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  media.addEventListener("change", callback);
  return () => { observer.disconnect(); media.removeEventListener("change", callback); };
}

/** Bouton soleil / lune : le soleil perd ses rayons et se creuse en croissant. */
export function ThemeToggle({ t }: { t: { label: string; toLight: string; toDark: string } }) {
  const theme = useSyncExternalStore(subscribe, current, () => null);
  const next: Theme = theme === "dark" ? "light" : "dark";

  // Filet de sécurité : si React a réécrit <html> (page d'erreur rendue côté client), on réapplique le choix.
  useEffect(() => {
    try {
      const saved = localStorage.getItem("theme");
      if ((saved === "light" || saved === "dark") && document.documentElement.dataset.theme !== saved) document.documentElement.dataset.theme = saved;
    } catch {}
  }, []);

  const toggle = () => {
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem("theme", next); } catch {}
  };

  return (
    <button type="button" onClick={toggle} className="sq theme-toggle" aria-label={theme ? (next === "dark" ? t.toDark : t.toLight) : t.label} title={t.label}>
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <g className="rays">
          <path d="M12 1.8v2.4M12 19.8v2.4M1.8 12h2.4M19.8 12h2.4M4.8 4.8l1.7 1.7M17.5 17.5l1.7 1.7M4.8 19.2l1.7-1.7M17.5 6.5l1.7-1.7" />
        </g>
        <circle cx="12" cy="12" r="4.6" className="core" />
        <circle cx="16.5" cy="8.5" r="5.4" className="cut" />
      </svg>
    </button>
  );
}
