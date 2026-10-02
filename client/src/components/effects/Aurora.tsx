import { motion, useReducedMotion } from "framer-motion";

export function Aurora({ className = "" }: { className?: string }) {
  const reduceMotion = useReducedMotion();
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      <motion.div
        className="aurora-blob aurora-blob--1"
        animate={reduceMotion ? undefined : { x: [0, 40, -10, 0], y: [0, -20, 30, 0], scale: [1, 1.08, 0.97, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="aurora-blob aurora-blob--2"
        animate={reduceMotion ? undefined : { x: [0, -30, 20, 0], y: [0, 25, -15, 0], scale: [1, 0.96, 1.06, 1] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />
      <motion.div
        className="aurora-blob aurora-blob--3"
        animate={reduceMotion ? undefined : { x: [0, 25, -35, 0], y: [0, -10, 20, 0] }}
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />
    </div>
  );
}
