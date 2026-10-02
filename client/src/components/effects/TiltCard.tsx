import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from "framer-motion";
import { useRef } from "react";

export function TiltCard({ children, className = "", maxTilt = 8 }: { children: React.ReactNode; className?: string; maxTilt?: number }) {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const sx = useSpring(rx, { stiffness: 260, damping: 20 });
  const sy = useSpring(ry, { stiffness: 260, damping: 20 });
  const rotateX = useTransform(sy, (v) => -v);
  const rotateY = useTransform(sx, (v) => v);
  const glareX = useTransform(sx, [-maxTilt, maxTilt], ["0%", "100%"]);

  if (reduceMotion) return <div className={className}>{children}</div>;

  const onMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    rx.set(px * maxTilt * 2);
    ry.set(py * maxTilt * 2);
  };
  const onLeave = () => { rx.set(0); ry.set(0); };

  return (
    <motion.div
      ref={ref}
      className={`tilt-card ${className}`}
      style={{ rotateX, rotateY, transformPerspective: 900 } as any}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      <motion.div className="tilt-glare" style={{ x: glareX } as any} aria-hidden="true" />
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
