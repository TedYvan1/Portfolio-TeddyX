/** Logo : une prise RJ45 vue de face, avec son voyant. */
export function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" aria-hidden="true">
      <rect x="1" y="1" width="26" height="26" rx="3" fill="var(--rack)" />
      <path d="M6 8h16v9h-4v4h-8v-4H6z" fill="var(--socket)" stroke="var(--cable-orange)" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M9.5 10.5v2.5M12.5 10.5v2.5M15.5 10.5v2.5M18.5 10.5v2.5" stroke="#c8a24a" strokeWidth="1" />
      <circle cx="22.5" cy="4.5" r="1.6" fill="var(--led-on)" />
    </svg>
  );
}
