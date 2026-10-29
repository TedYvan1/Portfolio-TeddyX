import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { Link } from "wouter";
import type { Project } from "@shared/types";
import { splitList } from "@/lib/profile";
import { easeOutExpo } from "@/lib/motion";
import { ProjectCover } from "./ProjectCover";

/**
 * Index éditorial des projets. Sur un écran avec souris, un aperçu suit le curseur
 * au survol d'une ligne ; sur tactile, la liste reste simple et lisible.
 */
export function ProjectIndex({ projects }: { projects: Project[] }) {
  const listRef = useRef<HTMLOListElement>(null);
  const [active, setActive] = useState<Project | null>(null);
  const [finePointer, setFinePointer] = useState(false);
  const reduceMotion = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 260, damping: 30, mass: 0.4 });
  const springY = useSpring(y, { stiffness: 260, damping: 30, mass: 0.4 });

  useEffect(() => {
    const media = window.matchMedia("(hover: hover) and (pointer: fine)");
    const sync = () => setFinePointer(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  const onMove = (event: React.PointerEvent) => {
    const rect = listRef.current?.getBoundingClientRect();
    if (!rect) return;
    x.set(event.clientX - rect.left);
    y.set(event.clientY - rect.top);
  };

  return (
    <div className="relative">
      <ol ref={listRef} onPointerMove={finePointer ? onMove : undefined} onPointerLeave={() => setActive(null)}>
        {projects.map((project, index) => (
          <motion.li
            key={project.id}
            initial={reduceMotion ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.7, delay: index * 0.06, ease: easeOutExpo }}
          >
            <Link href={`/projects/${project.slug}`} className="project-row group" onPointerEnter={() => setActive(project)} onFocus={() => setActive(project)}>
              <span className="self-start pt-2 font-mono text-[11px] text-muted-foreground md:pt-3">{String(index + 1).padStart(2, "0")}</span>
              <span className="min-w-0">
                <span className="project-row-title block truncate">{project.title}</span>
                <span className="mt-3 block max-w-xl text-sm leading-6 text-muted-foreground md:hidden">{project.shortDescription}</span>
              </span>
              <span className="hidden min-w-0 md:block">
                <span className="mono-label block text-foreground">{project.category}</span>
                <span className="mt-2 block truncate font-mono text-[11px] text-muted-foreground">{splitList(project.technologies).join(" · ")}</span>
              </span>
              <span className="project-row-arrow" aria-hidden="true">
                <ArrowUpRight className="h-4 w-4" />
              </span>
            </Link>
          </motion.li>
        ))}
      </ol>

      {finePointer && (
        <motion.div className="pointer-events-none absolute left-0 top-0 z-20 hidden md:block" style={{ x: springX, y: springY }} aria-hidden="true">
          <div className="relative h-[220px] w-[320px] -translate-x-1/2 -translate-y-[115%]">
            <AnimatePresence>
              {active && (
                <motion.div
                  key={active.id}
                  className="absolute inset-0 overflow-hidden shadow-[0_30px_60px_-20px_rgba(0,0,0,.35)]"
                  initial={{ opacity: 0, scale: 0.92, rotate: -2 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.3, ease: easeOutExpo }}
                >
                  <ProjectCover project={active} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </div>
  );
}
