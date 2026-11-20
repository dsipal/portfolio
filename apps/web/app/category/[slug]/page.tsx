import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PostListing } from "@/components/post-listing";
import { getCategories, getCategoryBySlug } from "@/lib/strapi";

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const category = await getCategoryBySlug((await params).slug);
  if (!category) return {};
  return {
    title: category.title,
    description: category.description ?? `All ${category.title} posts`,
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  return (
    <PostListing
      page={1}
      category={slug}
      basePath={`/category/${slug}/`}
      header={{ title: category.title, description: category.description }}
    />
  );
}
