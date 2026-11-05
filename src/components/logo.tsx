/** Logo : les initiales TY dans une étoile d'action jaune, encrée. */
export function LogoMark({ size = 44 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true" className="flex-none">
      <path d="M24 2l5 8 9-4-1 10 9 3-7 7 6 8-10 1 0 10-9-5-6 8-4-9-10 3 3-10-8-5 8-6-3-9 10 1 4-9z" fill="var(--yellow)" stroke="var(--ink)" strokeWidth="2.5" strokeLinejoin="round" />
      <text x="24" y="31" textAnchor="middle" fontSize="19" fontFamily="var(--font-display), sans-serif" fill="#141210" letterSpacing="0.5">TY</text>
    </svg>
  );
}
