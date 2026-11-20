import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PostListing, pageParams, parsePage } from "@/components/post-listing";
import { getCategories, getCategoryBySlug } from "@/lib/strapi";

export const revalidate = 60;

type Props = { params: Promise<{ slug: string; page: string }> };

export async function generateStaticParams() {
  const categories = await getCategories();
  const params = await Promise.all(
    categories.map(async (c) => (await pageParams(c.slug)).map((p) => ({ slug: c.slug, ...p }))),
  );
  return params.flat();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, page } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return {};
  return {
    title: `${category.title} · Page ${page}`,
    alternates: { canonical: `/category/${slug}/page/${page}/` },
  };
}

export default async function CategoryPaginatedPage({ params }: Props) {
  const { slug, page: rawPage } = await params;
  const page = parsePage(rawPage);
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  return (
    <PostListing
      page={page}
      category={slug}
      basePath={`/category/${slug}/`}
      header={{ title: category.title }}
    />
  );
}
