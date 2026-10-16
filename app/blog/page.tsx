import type { Metadata } from "next";
import { PostListing } from "@/components/post-listing";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Blog",
  description: "Writing on software, infrastructure and whatever I'm building.",
};

export default function BlogPage() {
  return (
    <PostListing page={1} basePath="/blog/" header={{ title: "Blog", description: metadata.description }} />
  );
}
