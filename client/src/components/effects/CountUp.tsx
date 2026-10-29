import { useEffect, useRef, useState } from "react";
import { animate, useInView, useReducedMotion } from "framer-motion";

type CountUpProps = {
  to: number;
  from?: number;
  duration?: number;
  suffix?: string;
  className?: string;
};

export function CountUp({ to, from = 0, duration = 1.6, suffix = "", className = "" }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduceMotion = useReducedMotion();
  const [value, setValue] = useState(reduceMotion ? to : from);

  useEffect(() => {
    if (!inView) return;
    if (reduceMotion) {
      setValue(to);
      return;
    }
    const controls = animate(from, to, {
      duration,
      ease: [0.23, 1, 0.32, 1],
      onUpdate: latest => setValue(Math.round(latest)),
    });
    return () => controls.stop();
  }, [inView, to, from, duration, reduceMotion]);

  return (
    <span ref={ref} className={className}>
      {value}
      {suffix}
    </span>
  );
}
