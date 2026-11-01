import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { Link } from "wouter";
import type { Project } from "@shared/types";
import { splitList } from "@/lib/profile";
import { easeOutExpo } from "@/lib/motion";
import { ProjectCover } from "./ProjectCover";

/**
 * Projets présentés comme la sortie de `ls -la`. Sur un écran avec souris,
 * un aperçu suit le curseur au survol ; sur tactile, la liste reste simple.
 */
export function ProjectIndex({ projects }: { projects: Project[] }) {
  const listRef = useRef<HTMLOListElement>(null);
  const [active, setActive] = useState<Project | null>(null);
  const [finePointer, setFinePointer] = useState(false);
  const reduceMotion = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 300, damping: 32, mass: 0.4 });
  const springY = useSpring(y, { stiffness: 300, damping: 32, mass: 0.4 });

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
      <p className="mb-2 hidden px-2 font-mono text-xs text-muted-foreground md:grid md:grid-cols-[8.5rem_7rem_minmax(0,1fr)_minmax(0,1.1fr)_auto] md:gap-x-4" aria-hidden="true">
        <span>mode</span>
        <span>type</span>
        <span>nom</span>
        <span>stack</span>
        <span className="w-9" />
      </p>
      <ol ref={listRef} onPointerMove={finePointer ? onMove : undefined} onPointerLeave={() => setActive(null)}>
        {projects.map((project, index) => (
          <motion.li
            key={project.id}
            initial={reduceMotion ? false : { opacity: 0, x: -8 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.35, delay: index * 0.05, ease: easeOutExpo }}
          >
            <Link href={`/projects/${project.slug}`} className="ls-row" onPointerEnter={() => setActive(project)} onFocus={() => setActive(project)}>
              <span className="hidden text-xs text-muted-foreground md:block">drwxr-xr-x</span>
              <span className="hidden text-xs text-amber md:block">{project.category.toLowerCase()}</span>
              <span className="col-start-1 row-start-1 min-w-0 md:col-start-auto md:row-start-auto">
                <span className="ls-name block">
                  {project.title}
                  <span className="text-muted-foreground">/</span>
                </span>
                <span className="mt-1 block font-sans text-sm leading-6 text-muted-foreground md:hidden">{project.shortDescription}</span>
              </span>
              <span className="col-span-2 col-start-1 row-start-2 truncate text-xs text-cyan md:col-span-1 md:col-start-auto md:row-start-auto">{splitList(project.technologies).join(" · ")}</span>
              <span className="ls-arrow col-start-2 row-start-1 self-start md:col-start-auto md:row-start-auto md:self-center" aria-hidden="true">
                <ArrowUpRight className="h-4 w-4" />
              </span>
            </Link>
          </motion.li>
        ))}
      </ol>

      {finePointer && (
        <motion.div className="pointer-events-none absolute left-0 top-0 z-20 hidden md:block" style={{ x: springX, y: springY }} aria-hidden="true">
          <div className="relative h-[200px] w-[300px] -translate-x-1/2 -translate-y-[112%]">
            <AnimatePresence>
              {active && (
                <motion.div
                  key={active.id}
                  className="pane absolute inset-0 shadow-[0_24px_60px_-20px_rgba(0,0,0,.55)]"
                  initial={{ opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.2, ease: easeOutExpo }}
                >
                  <div className="pane-bar">
                    <span className="pane-dots"><i /><i /><i /></span>
                    <span>~/projets/{active.slug}</span>
                  </div>
                  <div className="min-h-0 flex-1">
                    <ProjectCover project={active} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </div>
  );
}
