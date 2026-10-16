"use client";

import dynamic from "next/dynamic";

/** Keeps three.js out of the initial bundle; a soft glow holds the space while it loads */
export const CubesLazy = dynamic(() => import("@/components/cubes"), {
  ssr: false,
  loading: () => <div className="aspect-square w-full animate-pulse rounded-full bg-brand/10 blur-3xl" />,
});
