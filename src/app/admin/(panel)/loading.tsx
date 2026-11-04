/** Pendant la lecture de la session et des données : la coquille (navigation) reste affichée, seul le contenu attend. */
export default function Loading() {
  return (
    <div className="max-w-4xl" aria-busy="true">
      <p className="sr-only">Chargement…</p>
      <div aria-hidden="true" className="h-8 w-56 animate-pulse rounded-(--radius) bg-surface-2" />
      <div aria-hidden="true" className="mt-4 h-4 w-80 max-w-full animate-pulse rounded-(--radius) bg-surface" />
      <div aria-hidden="true" className="mt-10 grid gap-3">
        {[0, 1, 2, 3].map(row => <div key={row} className="h-12 animate-pulse rounded-(--radius) bg-surface" />)}
      </div>
    </div>
  );
}
