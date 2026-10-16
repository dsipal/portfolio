"use client";

import { useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useSpring } from "motion/react";
import { ArrowUpIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Thin progress bar under the header, plus a back-to-top button once the reader is well into the post */
export function ReadingProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 30, restDelta: 0.001 });
  const [showTop, setShowTop] = useState(false);
  useMotionValueEvent(scrollYProgress, "change", (p) => setShowTop(p > 0.25));

  return (
    <>
      <motion.div
        aria-hidden
        className="fixed inset-x-0 top-0 z-50 h-0.5 origin-left bg-brand"
        style={{ scaleX }}
      />
      <AnimatePresence>
        {showTop && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="fixed right-4 bottom-4 z-40 sm:right-6 sm:bottom-6"
          >
            <Button
              size="icon"
              variant="outline"
              className="rounded-full shadow-lg backdrop-blur"
              aria-label="Back to top"
              onClick={() => window.scrollTo({ top: 0 })}
            >
              <ArrowUpIcon />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
