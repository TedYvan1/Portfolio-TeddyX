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

/** Choix de l'édition : jour (papier journal) ou nuit (encre crème sur bleu nuit). */
export function ThemeToggle({ t, day, night }: { t: { label: string; toLight: string; toDark: string }; day: string; night: string }) {
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
    <button type="button" onClick={toggle} className="flex h-11 items-center gap-2 rounded-(--radius) border-[3px] border-ink bg-panel px-2.5 text-sm font-bold shadow-[3px_3px_0_var(--shadow)] transition-transform duration-150 active:translate-x-0.5 active:translate-y-0.5" aria-label={theme ? (next === "dark" ? t.toDark : t.toLight) : t.label} title={t.label}>
      <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
        {theme === "dark" ? (
          <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5z" fill="var(--yellow)" stroke="var(--ink)" strokeWidth="2" strokeLinejoin="round" />
        ) : (
          <g stroke="var(--ink)" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="5" fill="var(--yellow)" /><path d="M12 1.5v3M12 19.5v3M1.5 12h3M19.5 12h3M4.6 4.6l2 2M17.4 17.4l2 2M4.6 19.4l2-2M17.4 6.6l2-2" /></g>
        )}
      </svg>
      <span className="hidden whitespace-nowrap sm:inline">{theme === "dark" ? night : day}</span>
    </button>
  );
}
