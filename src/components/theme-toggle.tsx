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

/** Interrupteur à bascule, comme celui d'une alimentation de baie. */
export function ThemeToggle({ t }: { t: { label: string; toLight: string; toDark: string } }) {
  const theme = useSyncExternalStore(subscribe, current, () => null);
  // Filet de sécurité : si React a réécrit <html> (page d'erreur rendue côté client), on réapplique le choix.
  useEffect(() => {
    try {
      const saved = localStorage.getItem("theme");
      if ((saved === "light" || saved === "dark") && document.documentElement.dataset.theme !== saved) document.documentElement.dataset.theme = saved;
    } catch {}
  }, []);
  const next: Theme = theme === "dark" ? "light" : "dark";
  const toggle = () => {
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem("theme", next); } catch {}
  };
  return (
    <button type="button" onClick={toggle} className="inline-flex h-11 items-center gap-2 rounded-(--radius) px-1.5" aria-label={theme ? (next === "dark" ? t.toDark : t.toLight) : t.label} title={t.label}>
      <span aria-hidden="true" className="silk hidden text-muted lg:inline">{theme === "dark" ? "OFF" : "ON"}</span>
      <span aria-hidden="true" className="rocker"><span className="rocker-knob" /></span>
    </button>
  );
}
