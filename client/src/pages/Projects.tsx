import { useMemo, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Reveal, SiteLayout } from "@/components/SiteLayout";
import { ProjectIndex } from "@/components/portfolio/ProjectIndex";

const ALL = "tous";

export default function Projects() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(ALL);
  const input = useMemo(() => ({ search: search || undefined, category: category === ALL ? undefined : category }), [search, category]);
  const { data = [], isLoading } = trpc.public.projects.useQuery(input, { staleTime: 30_000 });
  const { data: everything = [] } = trpc.public.projects.useQuery(undefined, { staleTime: 60_000 });
  const categories = [ALL, ...Array.from(new Set(everything.map(project => project.category)))];
  const flag = (value: string) => `--${value.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

  return (
    <SiteLayout>
      <main className="container pb-24 pt-12 md:pt-16">
        <Reveal>
          <p className="cmd-line text-muted-foreground">
            <span className="tok-prompt">ted@abidjan</span>:<span className="tok-path">~</span>$ ls -la <span className="tok-path">~/projets</span>
            {category !== ALL && <span className="tok-str"> {flag(category)}</span>}
            {search && <> | grep <span className="tok-str">"{search}"</span></>}
          </p>
          <h1 className="section-title">Tout ce que j'ai construit.</h1>
          <p className="mt-4 font-mono text-sm text-muted-foreground">total {String(everything.length).padStart(2, "0")}</p>
        </Reveal>

        <div className="mt-10 flex flex-col gap-4 rounded-sm border border-border bg-card p-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-x-4 gap-y-2" role="group" aria-label="Filtrer par catégorie">
            {categories.map(item => (
              <button key={item} aria-pressed={category === item} onClick={() => setCategory(item)} className={`flag min-h-9 ${category === item ? "selected" : ""}`}>
                {item === ALL ? "--tous" : flag(item)}
              </button>
            ))}
          </div>
          <label className="flex min-h-11 items-center gap-2 rounded-sm border border-border bg-background px-3 font-mono text-sm md:w-80">
            <span className="text-primary" aria-hidden="true">grep</span>
            <span className="sr-only">Rechercher un projet</span>
            <input value={search} onChange={event => setSearch(event.target.value)} placeholder="titre, techno…" className="w-full bg-transparent py-2 outline-none placeholder:text-muted-foreground" />
          </label>
        </div>

        <div className="mt-8">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(item => (
                <div key={item} className="skeleton-block h-16" />
              ))}
            </div>
          ) : data.length ? (
            <ProjectIndex projects={data} />
          ) : (
            <p className="empty-state">grep : aucun projet ne correspond à « {search || category} ».</p>
          )}
        </div>
      </main>
    </SiteLayout>
  );
}
