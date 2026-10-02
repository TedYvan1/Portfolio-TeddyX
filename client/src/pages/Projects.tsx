import { useMemo, useState } from "react";
import { ArrowUpRight, Search, Terminal } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { trpc } from "@/lib/trpc";
import { SiteLayout, ScrollReveal, SectionHeading } from "@/components/SiteLayout";
import { Aurora } from "@/components/effects/Aurora";
import { SpotlightCard } from "@/components/effects/SpotlightCard";
import { staggerContainer, staggerItem } from "@/lib/motion";

export default function Projects() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Tous");
  const input = useMemo(() => ({ search: search || undefined, category: category === "Tous" ? undefined : category }), [search, category]);
  const { data = [], isLoading } = trpc.public.projects.useQuery(input, { staleTime: 30_000 });
  const categories = ["Tous", ...Array.from(new Set(data.map(project => project.category)))];
  return (
    <SiteLayout>
      <main className="section-shell relative overflow-hidden pt-16 md:pt-24">
        <Aurora className="opacity-30" />
        <div className="container relative">
          <ScrollReveal>
            <SectionHeading eyebrow="Projets / Index" title="Un aperçu de mon terrain de jeu." description="Explorez les projets publiés, leurs choix techniques et les problèmes auxquels ils répondent." />
          </ScrollReveal>
          <div className="mb-10 flex flex-col gap-4 border-y border-border/70 py-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap gap-2">
              {categories.map(item => (
                <motion.button key={item} onClick={() => setCategory(item)} className={`filter-chip ${category === item ? "selected" : ""}`} whileTap={{ scale: 0.96 }} whileHover={{ y: -1 }}>
                  {item}
                </motion.button>
              ))}
            </div>
            <label className="search-box">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input value={search} onChange={event => setSearch(event.target.value)} placeholder="Rechercher un projet..." />
            </label>
          </div>
          {isLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map(item => (
                <div className="skeleton-card" key={item} />
              ))}
            </div>
          ) : (
            <motion.div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3" variants={staggerContainer} initial="hidden" animate="visible">
              {data.map(project => (
                <motion.div key={project.id} variants={staggerItem}>
                  <SpotlightCard>
                    <Link href={`/projects/${project.slug}`} className="project-card group">
                      <div className="project-image">
                        {project.imageUrl ? <img src={project.imageUrl} alt="" /> : <div className="project-image-fallback"><Terminal /></div>}
                        <span className="project-category">{project.category}</span>
                        <span className="project-arrow">
                          <ArrowUpRight className="h-4 w-4" />
                        </span>
                      </div>
                      <div className="p-5">
                        <h3 className="font-display text-xl font-semibold">{project.title}</h3>
                        <p className="mt-3 text-sm leading-6 text-muted-foreground">{project.shortDescription}</p>
                        <div className="mt-5 flex flex-wrap gap-2">
                          {project.technologies.split(",").map(tag => (
                            <span key={tag} className="tag">
                              {tag.trim()}
                            </span>
                          ))}
                        </div>
                      </div>
                    </Link>
                  </SpotlightCard>
                </motion.div>
              ))}
              {!data.length && <div className="empty-state md:col-span-2 lg:col-span-3">Aucun projet ne correspond à votre recherche.</div>}
            </motion.div>
          )}
        </div>
      </main>
    </SiteLayout>
  );
}
