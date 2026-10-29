"use client";

import { useEffect, useState } from "react";
import { motion, useScroll, useSpring } from "framer-motion";

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });
  const [canScroll, setCanScroll] = useState(false);

  useEffect(() => {
    const checkScrollable = () => {
      const isScrollable =
        document.documentElement.scrollHeight > window.innerHeight + 60;
      setCanScroll(isScrollable);
    };

    checkScrollable();
    window.addEventListener("resize", checkScrollable);
    window.addEventListener("scroll", checkScrollable, { passive: true });
    return () => {
      window.removeEventListener("resize", checkScrollable);
      window.removeEventListener("scroll", checkScrollable);
    };
  }, []);

  if (!canScroll) return null;

  return (
    <motion.div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 origin-left z-50 pointer-events-none"
      style={{ scaleX }}
    />
  );
}

