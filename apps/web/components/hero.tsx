"use client";

import Link from "next/link";
import { motion, type Variants } from "motion/react";
import { ArrowRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CubesLazy } from "@/components/cubes-lazy";
import { DRIP_BAND_HEIGHT, MetaballEdge } from "@/components/metaball-edge";

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 24, filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] },
  },
};

export function Hero({
  name,
  role,
  intro,
  socials,
}: {
  name: string;
  role: string | null;
  intro: string | null;
  socials: React.ReactNode;
}) {
  return (
    <section className="relative isolate overflow-hidden">
      <HeroBackground />
      <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 pt-12 pb-44 sm:px-6 md:grid-cols-[1.2fr_1fr] md:pt-20 md:pb-52">
        <motion.div variants={container} initial="hidden" animate="show" className="order-2 md:order-1">
          {role && (
            <motion.p
              variants={item}
              className="mb-4 inline-flex items-center gap-2 rounded-full border bg-background/60 px-3 py-1 text-sm text-muted-foreground backdrop-blur"
            >
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand opacity-60 motion-reduce:animate-none" />
                <span className="relative inline-flex size-2 rounded-full bg-brand" />
              </span>
              {role}
            </motion.p>
          )}
          <motion.h1
            variants={item}
            className="text-5xl font-semibold tracking-tight text-balance sm:text-6xl lg:text-7xl"
          >
            Hi, I&apos;m{" "}
            <span className="bg-gradient-to-r from-brand-1 to-brand-2 bg-clip-text text-transparent">
              {name}
            </span>
          </motion.h1>
          {intro && (
            <motion.p variants={item} className="mt-6 max-w-xl text-lg text-pretty text-muted-foreground">
              {intro}
            </motion.p>
          )}
          <motion.div variants={item} className="mt-8 flex flex-wrap items-center gap-3">
            <Button asChild size="lg" className="group">
              <Link href="/blog/">
                Read the blog
                <ArrowRightIcon className="transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/projects/">View projects</Link>
            </Button>
          </motion.div>
          <motion.div variants={item} className="mt-6 -ml-2">
            {socials}
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="order-1 mx-auto w-full max-w-[260px] sm:max-w-[340px] md:order-2 md:max-w-[420px]"
        >
          <CubesLazy />
        </motion.div>
      </div>
    </section>
  );
}

function HeroBackground() {
  return (
    <div aria-hidden className="absolute inset-0 -z-10">
      <div
        className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:48px_48px] bg-bottom-left opacity-60 [mask-composite:intersect]"
        style={{
          // Fade in at the top and sides; stop exactly where the drip band takes over
          maskImage: `linear-gradient(to bottom, transparent, #000 30%, #000 calc(100% - ${DRIP_BAND_HEIGHT}px), transparent calc(100% - ${DRIP_BAND_HEIGHT}px)), linear-gradient(to right, transparent, #000 20%, #000 80%, transparent)`,
        }}
      />
      <motion.div
        className="absolute -top-32 right-0 size-[28rem] rounded-full bg-brand-1/20 blur-3xl"
        animate={{ x: [0, -40, 0], y: [0, 30, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-40 -left-24 size-[22rem] rounded-full bg-brand-3/15 blur-3xl"
        animate={{ x: [0, 40, 0], y: [0, -20, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* The hero's bottom edge melts into the next section */}
      <MetaballEdge className="absolute inset-x-0 bottom-0" />
    </div>
  );
}
