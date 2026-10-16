import type { MetadataRoute } from "next";
import { getAllPostSlugs, getCategories } from "@/lib/strapi";
import { SITE_URL } from "@/lib/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, categories] = await Promise.all([getAllPostSlugs(), getCategories()]);
  const url = (path: string) => `${SITE_URL}${path}`;

  return [
    { url: url("/"), changeFrequency: "weekly", priority: 1 },
    { url: url("/blog/"), changeFrequency: "weekly", priority: 0.9 },
    { url: url("/projects/"), changeFrequency: "monthly", priority: 0.8 },
    { url: url("/about/"), changeFrequency: "monthly", priority: 0.7 },
    ...categories.map((c) => ({
      url: url(`/category/${c.slug}/`),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
    ...posts.map((p) => ({ url: url(`/post/${p.slug}/`), lastModified: p.updatedAt, priority: 0.8 })),
  ];
}
