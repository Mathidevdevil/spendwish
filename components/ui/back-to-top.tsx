"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { useLenis } from "@/components/providers/smooth-scroll";

export function BackToTop() {
  const [visible, setVisible] = useState(false);
  const { scrollTo } = useLenis();

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 600);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleClick = () => {
    scrollTo(0, { duration: 1.1 });
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          onClick={handleClick}
          initial={{ opacity: 0, scale: 0.8, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 12 }}
          transition={{ duration: 0.2 }}
          aria-label="Scroll back to top"
          className="fixed bottom-20 right-4 lg:bottom-8 lg:right-8 z-30 flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full border border-border/80 bg-surface/90 text-foreground shadow-lg backdrop-blur-md transition-all hover:bg-surface-elevated hover:border-emerald-500/40 hover:text-emerald-400 hover:shadow-emerald-500/10 focus:outline-none focus:ring-2 focus:ring-emerald-400 active:scale-95"
        >
          <ArrowUp className="h-4 w-4 sm:h-5 sm:w-5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

