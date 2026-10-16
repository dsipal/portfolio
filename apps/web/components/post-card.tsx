import Link from "next/link";
import { ArrowUpRightIcon, ClockIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { StrapiImage } from "@/components/strapi-image";
import { formatDate } from "@/lib/utils";
import type { PostSummary } from "@/lib/schemas";

/**
 * The whole card is one link to the post. The category badge is plain text
 * rather than a nested link, which would be invalid inside <a>.
 */
export function PostCard({ post, priority = false }: { post: PostSummary; priority?: boolean }) {
  const date = post.published_date ?? post.publishedAt;

  return (
    <Link
      href={`/post/${post.slug}/`}
      className="group flex h-full flex-col overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand/40 hover:shadow-lg hover:shadow-brand/5 focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-muted">
        {post.cover ? (
          <StrapiImage
            image={post.cover}
            fill
            priority={priority}
            sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-brand/25 via-brand/5 to-transparent" />
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
          {post.category ? <Badge variant="secondary">{post.category.title}</Badge> : <span />}
          <time dateTime={date}>{formatDate(date)}</time>
        </div>

        <h3 className="text-lg leading-snug font-semibold tracking-tight text-balance">{post.title}</h3>

        {post.description && (
          <p className="line-clamp-3 text-sm text-pretty text-muted-foreground">{post.description}</p>
        )}

        <div className="mt-auto flex items-center justify-between pt-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <ClockIcon className="size-3.5" />
            {post.readingTime} min read
          </span>
          <ArrowUpRightIcon className="size-4 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-brand" />
        </div>
      </div>
    </Link>
  );
}
