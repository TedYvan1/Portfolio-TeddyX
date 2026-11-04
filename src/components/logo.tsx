/** Logo : trois nœuds reliés, aux couleurs des types du graphe. */
export function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" aria-hidden="true">
      <path d="M8 19 L14 8 L21 18 Z" fill="none" stroke="var(--muted)" strokeWidth="1.3" />
      <circle cx="14" cy="8" r="3.6" fill="var(--node-me)" />
      <rect x="4.6" y="15.6" width="6.8" height="6.8" rx="1.4" fill="var(--node-project)" />
      <circle cx="21" cy="18" r="3.4" fill="var(--node-skill)" />
    </svg>
  );
}
