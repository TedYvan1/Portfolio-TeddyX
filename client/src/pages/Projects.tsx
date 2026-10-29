import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Reveal, SiteLayout } from "@/components/SiteLayout";
import { ProjectIndex } from "@/components/portfolio/ProjectIndex";

const ALL = "Tous";

export default function Projects() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(ALL);
  const input = useMemo(() => ({ search: search || undefined, category: category === ALL ? undefined : category }), [search, category]);
  const { data = [], isLoading } = trpc.public.projects.useQuery(input, { staleTime: 30_000 });
  const { data: everything = [] } = trpc.public.projects.useQuery(undefined, { staleTime: 60_000 });
  const categories = [ALL, ...Array.from(new Set(everything.map(project => project.category)))];

  return (
    <SiteLayout>
      <main className="container pb-24 pt-32 md:pt-40">
        <Reveal>
          <p className="mono-label">
            <span className="text-primary">Index</span> — {String(everything.length).padStart(2, "0")} projets
          </p>
          <h1 className="mt-6 font-serif leading-[.92] tracking-[-.01em]" style={{ fontSize: "clamp(3rem, 9vw, 8rem)" }}>
            Tout ce que j'ai <em className="text-primary">construit</em>.
          </h1>
        </Reveal>

        <div className="mt-14 flex flex-col gap-6 border-y border-foreground/80 py-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-x-6 gap-y-2" role="tablist" aria-label="Filtrer par catégorie">
            {categories.map(item => (
              <button key={item} role="tab" aria-selected={category === item} onClick={() => setCategory(item)} className={`filter-tab ${category === item ? "selected" : ""}`}>
                {item}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-2 border-b border-foreground/25 pb-1 md:w-72">
            <Search className="h-4 w-4 text-muted-foreground" />
            <span className="sr-only">Rechercher un projet</span>
            <input value={search} onChange={event => setSearch(event.target.value)} placeholder="Rechercher (titre, techno…)" className="w-full bg-transparent py-1.5 text-sm outline-none placeholder:text-muted-foreground" />
          </label>
        </div>

        <div className="mt-6">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(item => (
                <div key={item} className="skeleton-block h-24" />
              ))}
            </div>
          ) : data.length ? (
            <ProjectIndex projects={data} />
          ) : (
            <p className="empty-state mt-6">Aucun projet ne correspond à cette recherche.</p>
          )}
        </div>
      </main>
    </SiteLayout>
  );
}
