import { motion, useReducedMotion } from "framer-motion";

export function ShinyText({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const reduceMotion = useReducedMotion();
  if (reduceMotion) return <span className={className}>{children}</span>;
  return (
    <motion.span className={`shiny-text ${className}`} initial={{ backgroundPosition: "-200% 0" }} animate={{ backgroundPosition: "200% 0" }} transition={{ duration: 2.8, repeat: Infinity, ease: "linear", repeatDelay: 1.2 }}>
      {children}
    </motion.span>
  );
}
