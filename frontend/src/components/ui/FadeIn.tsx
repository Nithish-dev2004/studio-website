"use client";

// Fades and slides content in when it scrolls into view (Framer Motion).
// Wrap any block in <FadeIn> to animate it. Respects "reduce motion" settings.

import { motion, useReducedMotion } from "framer-motion";

type FadeInProps = {
  children: React.ReactNode;
  className?: string;
  /** Seconds to wait before animating (use small values to stagger items). */
  delay?: number;
};

export default function FadeIn({ children, className, delay = 0 }: FadeInProps) {
  const reduceMotion = useReducedMotion();

  // If the visitor prefers reduced motion, show the content without animation.
  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
