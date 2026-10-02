import { motion, useReducedMotion } from "framer-motion";

type BlurTextProps = {
  text: string;
  className?: string;
  as?: "h1" | "h2" | "p" | "span";
  delay?: number;
  stagger?: number;
  duration?: number;
  animateBy?: "words" | "letters";
};

export function BlurText({ text, className = "", as = "span", delay = 0, stagger = 0.04, duration = 0.45, animateBy = "words" }: BlurTextProps) {
  const reduceMotion = useReducedMotion();
  if (reduceMotion) {
    const Tag = as as any;
    return <Tag className={className}>{text}</Tag>;
  }
  const segments = animateBy === "words" ? text.split(/(\s+)/) : text.split("");
  const Tag = as as any;
  return (
    <Tag className={className} aria-label={text}>
      {segments.map((seg, i) => {
        if (seg.trim() === "" && animateBy === "words") return <span key={i}>{seg}</span>;
        return (
          <motion.span
            key={i}
            className="inline-block"
            initial={{ opacity: 0, filter: "blur(12px)", y: 10 }}
            whileInView={{ opacity: 1, filter: "blur(0px)", y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration, delay: delay + i * stagger, ease: [0.23, 1, 0.32, 1] }}
          >
            {seg}
          </motion.span>
        );
      })}
    </Tag>
  );
}
