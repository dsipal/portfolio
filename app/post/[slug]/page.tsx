import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon, ArrowRightIcon, CalendarIcon, ClockIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/container";
import { FadeIn } from "@/components/motion";
import { Markdown } from "@/components/markdown";
import { ReadingProgress } from "@/components/reading-progress";
import { StrapiImage } from "@/components/strapi-image";
import { TableOfContents } from "@/components/table-of-contents";
import { getAdjacentPosts, getAllPostSlugs, getPostBySlug } from "@/lib/strapi";
import { readingTime } from "@/lib/reading-time";
import { extractToc } from "@/lib/toc";
import { formatDate } from "@/lib/utils";

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const posts = await getAllPostSlugs();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPostBySlug((await params).slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `/post/${post.slug}/` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description ?? undefined,
      publishedTime: post.published_date ?? post.publishedAt,
      modifiedTime: post.updatedAt,
    },
  };
}

export default async function PostPage({ params }: Props) {
  const post = await getPostBySlug((await params).slug);
  if (!post) notFound();

  const { older, newer } = await getAdjacentPosts(post);
  const toc = extractToc(post.content);
  const date = post.published_date ?? post.publishedAt;
  const heroImage = post.postHero ?? post.cover;

  return (
    <>
      <ReadingProgress />

      <header className="relative isolate overflow-hidden border-b">
        {heroImage ? (
          <>
            <StrapiImage image={heroImage} fill priority sizes="100vw" className="-z-20 object-cover" />
            <div className="absolute inset-0 -z-10 bg-gradient-to-t from-background via-background/85 to-background/40" />
          </>
        ) : (
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-brand/15 to-transparent" />
        )}
        <Container className="max-w-4xl pt-16 pb-10 sm:pt-28 sm:pb-14">
          <FadeIn>
            <Link
              href="/blog/"
              className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeftIcon className="size-4" />
              All posts
            </Link>
            {post.category && (
              <div className="mb-4">
                <Badge asChild variant="secondary">
                  <Link href={`/category/${post.category.slug}/`}>{post.category.title}</Link>
                </Badge>
              </div>
            )}
            <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-5xl">{post.title}</h1>
            {post.description && (
              <p className="mt-4 text-lg text-pretty text-muted-foreground">{post.description}</p>
            )}
            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <CalendarIcon className="size-4" />
                <time dateTime={date}>{formatDate(date)}</time>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ClockIcon className="size-4" />
                {readingTime(post.content)} min read
              </span>
            </div>
          </FadeIn>
        </Container>
      </header>

      <Container className="grid max-w-6xl gap-10 py-12 lg:grid-cols-[minmax(0,1fr)_14rem]">
        <article className="mx-auto w-full max-w-3xl min-w-0">
          {post.content && <Markdown>{post.content}</Markdown>}
        </article>
        {toc.length > 1 && (
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <TableOfContents entries={toc} />
            </div>
          </aside>
        )}
      </Container>

      {(older || newer) && (
        <Container className="max-w-3xl">
          <nav aria-label="More posts" className="grid gap-4 border-t pt-10 sm:grid-cols-2">
            {older ? (
              <AdjacentLink
                href={`/post/${older.slug}/`}
                label="Previous"
                title={older.title}
                direction="prev"
              />
            ) : (
              <span />
            )}
            {newer && (
              <AdjacentLink href={`/post/${newer.slug}/`} label="Next" title={newer.title} direction="next" />
            )}
          </nav>
        </Container>
      )}
    </>
  );
}

function AdjacentLink({
  href,
  label,
  title,
  direction,
}: {
  href: string;
  label: string;
  title: string;
  direction: "prev" | "next";
}) {
  const Icon = direction === "prev" ? ArrowLeftIcon : ArrowRightIcon;
  return (
    <Link
      href={href}
      className={`group flex flex-col gap-1 rounded-xl border p-5 transition-colors hover:border-brand/40 hover:bg-accent/50 ${direction === "next" ? "sm:items-end sm:text-right" : ""}`}
    >
      <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
        {direction === "prev" && (
          <Icon className="size-3.5 transition-transform group-hover:-translate-x-0.5" />
        )}
        {label}
        {direction === "next" && (
          <Icon className="size-3.5 transition-transform group-hover:translate-x-0.5" />
        )}
      </span>
      <span className="font-medium text-balance">{title}</span>
    </Link>
  );
}
