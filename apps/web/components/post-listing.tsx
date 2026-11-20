import { notFound } from "next/navigation";
import { Container, PageHeader } from "@/components/container";
import { PostGrid } from "@/components/post-grid";
import { PostsPagination } from "@/components/posts-pagination";
import { getPosts } from "@/lib/strapi";

/** Parses a /page/[page]/ segment; anything but an integer ≥ 2 is a 404 (page 1 lives at the base path) */
export function parsePage(raw: string) {
  const page = Number(raw);
  if (!Number.isInteger(page) || page < 2) notFound();
  return page;
}

/** A paginated post grid, shared by /blog and /category/[slug] */
export async function PostListing({
  page,
  basePath,
  category,
  header,
}: {
  page: number;
  basePath: string;
  category?: string;
  header: React.ComponentProps<typeof PageHeader>;
}) {
  const { posts, pagination } = await getPosts({ page, category });
  if (page > 1 && page > pagination.pageCount) notFound();

  return (
    <Container>
      <PageHeader
        {...header}
        eyebrow={
          header.eyebrow ??
          (pagination.total > 0
            ? `${pagination.total} post${pagination.total === 1 ? "" : "s"}${page > 1 ? ` · page ${page} of ${pagination.pageCount}` : ""}`
            : undefined)
        }
      />
      <PostGrid posts={posts} />
      <PostsPagination basePath={basePath} page={page} pageCount={pagination.pageCount} />
    </Container>
  );
}

/** Static params for pages 2..n of a listing */
export async function pageParams(category?: string) {
  const { pagination } = await getPosts({ category });
  return Array.from({ length: Math.max(0, pagination.pageCount - 1) }, (_, i) => ({
    page: String(i + 2),
  }));
}
