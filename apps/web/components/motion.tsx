"use client";

import { motion, type HTMLMotionProps, type Variants } from "motion/react";

const ease = [0.21, 0.47, 0.32, 0.98] as const;

/** Fades and slides its children up the first time they scroll into view */
export function FadeIn({
  delay = 0,
  y = 16,
  ...props
}: HTMLMotionProps<"div"> & { delay?: number; y?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay, ease }}
      {...props}
    />
  );
}

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease } },
};

/** Reveals each <StaggerItem> child in turn when the group scrolls into view */
export function Stagger(props: HTMLMotionProps<"div">) {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
      {...props}
    />
  );
}

export function StaggerItem(props: HTMLMotionProps<"div">) {
  return <motion.div variants={item} {...props} />;
}
