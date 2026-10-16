import { getPostBySlug } from "@/lib/strapi";
import { getSiteInfo } from "@/lib/site";
import { ogImage, ogSize } from "@/lib/og";

export const size = ogSize;
export const contentType = "image/png";
export const alt = "Post preview";
export const revalidate = 60;

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const [post, { name }] = await Promise.all([getPostBySlug((await params).slug), getSiteInfo()]);
  return ogImage({
    eyebrow: post?.category?.title,
    title: post?.title ?? name,
    footer: name.toLowerCase(),
  });
}
