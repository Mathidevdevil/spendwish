"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";

interface RevealCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export function RevealCard({ children, className, delay = 0 }: RevealCardProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.3, ease: [0.21, 0.47, 0.32, 0.98], delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
