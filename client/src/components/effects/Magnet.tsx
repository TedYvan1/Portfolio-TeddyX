import { motion, useMotionValue, useSpring, useReducedMotion } from "framer-motion";
import { useRef } from "react";

export function Magnet({ children, strength = 0.3, className = "" }: { children: React.ReactNode; strength?: number; className?: string }) {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 260, damping: 18 });
  const sy = useSpring(y, { stiffness: 260, damping: 18 });

  if (reduceMotion) return <div className={className}>{children}</div>;

  const handleMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    x.set((e.clientX - cx) * strength);
    y.set((e.clientY - cy) * strength);
  };
  const handleLeave = () => { x.set(0); y.set(0); };

  return (
    <motion.div ref={ref} className={className} style={{ x: sx, y: sy }} onMouseMove={handleMove} onMouseLeave={handleLeave}>
      {children}
    </motion.div>
  );
}
