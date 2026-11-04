/** Logo TK : un T entouré au stylo, surligné en vert. Il s'écrit au chargement. */
export function LogoMark({ size = 38 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" className="logo flex-none overflow-visible">
      <rect x="8" y="30" width="34" height="9" className="logo-hl" />
      <path d="M17 18 H45 M31 18 V48" pathLength={1} className="ink" strokeWidth="6" style={{ ["--d" as string]: "750ms", ["--dur" as string]: "500ms" }} />
      <path d="M52 30 C 54 12, 22 4, 10 20 C 0 36, 14 58, 34 57 C 52 56, 60 42, 55 26" pathLength={1} className="ink logo-o" strokeWidth="3.2" style={{ ["--d" as string]: "100ms", ["--dur" as string]: "800ms" }} />
    </svg>
  );
}
