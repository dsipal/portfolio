"use client";

import { motion } from "motion/react";

/**
 * Re-mounts on every navigation, giving each page a short fade-in. Opacity
 * only: a transform here would break position: fixed/sticky inside pages.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
