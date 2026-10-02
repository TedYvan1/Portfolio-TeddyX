import { motion, useReducedMotion } from "framer-motion";

type SplitTextProps = { text: string; className?: string; delay?: number; stagger?: number; as?: "h1" | "h2" | "p" | "span" };

export function SplitText({ text, className = "", delay = 0, stagger = 0.03, as = "span" }: SplitTextProps) {
  const reduceMotion = useReducedMotion();
  const chars = text.split("");
  const Tag = as as any;
  if (reduceMotion) return <Tag className={className}>{text}</Tag>;
  return (
    <Tag className={className} aria-label={text}>
      {chars.map((ch, i) => (
        <motion.span
          key={`${ch}-${i}`}
          className="inline-block"
          initial={{ opacity: 0, y: 18, rotateX: -18 }}
          whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5, delay: delay + i * stagger, ease: [0.23, 1, 0.32, 1] }}
          style={{ transformOrigin: "bottom center" }}
        >
          {ch === " " ? "\u00A0" : ch}
        </motion.span>
      ))}
    </Tag>
  );
}
