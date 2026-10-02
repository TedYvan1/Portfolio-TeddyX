import { motion, useMotionValue, useSpring } from "framer-motion";
import { useRef } from "react";

export function SpotlightCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const opacity = useMotionValue(0);
  const springOpacity = useSpring(opacity, { stiffness: 200, damping: 30 });

  const handleMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    mx.set(e.clientX - rect.left);
    my.set(e.clientY - rect.top);
    opacity.set(1);
  };
  const handleLeave = () => opacity.set(0);

  return (
    <div ref={ref} className={`spotlight-card ${className}`} onMouseMove={handleMove} onMouseLeave={handleLeave}>
      <motion.div
        className="spotlight-overlay"
        style={
          {
            "--mx": mx,
            "--my": my,
            opacity: springOpacity,
          } as unknown as React.CSSProperties
        }
        aria-hidden="true"
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
