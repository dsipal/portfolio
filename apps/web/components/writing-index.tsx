"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRightIcon } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import type { PostSummary } from "@/lib/schemas";

/**
 * "Latest writing" as a dense list (date, title, category, reading time) with
 * category filter chips. Filtering is client-side over the posts the server
 * already sent; the chips only list categories that appear in them.
 */
export function WritingIndex({ posts }: { posts: PostSummary[] }) {
  const [active, setActive] = useState<string | null>(null);

  const categories = useMemo(() => {
    const seen = new Map<string, string>();
    for (const p of posts) if (p.category) seen.set(p.category.slug, p.category.title);
    return [...seen];
  }, [posts]);

  const visible = active ? posts.filter((p) => p.category?.slug === active) : posts;

  if (posts.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-12 text-center text-muted-foreground">
        No posts yet. Check back soon.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {categories.length > 1 && (
        <div role="group" aria-label="Filter by category" className="flex flex-wrap gap-2">
          <Chip pressed={active === null} onClick={() => setActive(null)}>
            All
          </Chip>
          {categories.map(([slug, title]) => (
            <Chip key={slug} pressed={active === slug} onClick={() => setActive(slug)}>
              {title}
            </Chip>
          ))}
        </div>
      )}

      <ol className="border-t">
        <AnimatePresence initial={false} mode="popLayout">
          {visible.map((post) => {
            const date = post.date;
            return (
              <motion.li
                key={post.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="border-b"
              >
                <Link
                  href={`/post/${post.slug}/`}
                  className="group grid grid-cols-[1fr_auto] items-baseline gap-x-6 gap-y-1 rounded-md px-1 py-4 transition-colors hover:bg-muted/40 focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none sm:grid-cols-[7.5rem_minmax(0,1fr)_8rem_4.5rem] sm:py-5"
                >
                  <time
                    dateTime={date}
                    className="order-2 font-mono text-xs text-muted-foreground sm:order-none sm:text-sm"
                  >
                    {formatDate(date)}
                  </time>
                  <span className="col-span-2 flex items-baseline gap-2 text-lg font-medium tracking-tight text-balance group-hover:text-brand sm:col-span-1">
                    {post.title}
                    <ArrowUpRightIcon className="size-4 shrink-0 self-center opacity-0 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
                  </span>
                  <span className="order-3 hidden truncate text-sm text-brand sm:order-none sm:block">
                    {post.category?.title}
                  </span>
                  <span className="order-3 text-right text-xs text-muted-foreground sm:order-none sm:text-sm">
                    {post.readingTime} min
                  </span>
                </Link>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ol>
    </div>
  );
}

function Chip({
  pressed,
  onClick,
  children,
}: {
  pressed: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={cn(
        "h-9 rounded-full border px-3.5 text-sm transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none",
        pressed
          ? "border-brand bg-brand/15 text-foreground"
          : "text-muted-foreground hover:border-brand/40 hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}
