import { motion, useReducedMotion } from "framer-motion";

type GradientTextProps = {
  children: React.ReactNode;
  className?: string;
  duration?: number;
};

export function GradientText({ children, className = "", duration = 6 }: GradientTextProps) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.span
      className={`text-gradient ${className}`}
      style={{ backgroundSize: "200% auto", display: "inline-block" }}
      animate={reduceMotion ? undefined : { backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
      transition={{ duration, repeat: Infinity, ease: "linear" }}
    >
      {children}
    </motion.span>
  );
}
