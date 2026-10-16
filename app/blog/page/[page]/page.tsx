import type { Metadata } from "next";
import { PostListing, pageParams, parsePage } from "@/components/post-listing";

export const revalidate = 60;

type Props = { params: Promise<{ page: string }> };

export function generateStaticParams() {
  return pageParams();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { page } = await params;
  return { title: `Blog · Page ${page}`, alternates: { canonical: `/blog/page/${page}/` } };
}

export default async function BlogPaginatedPage({ params }: Props) {
  const page = parsePage((await params).page);
  return <PostListing page={page} basePath="/blog/" header={{ title: "Blog" }} />;
}
