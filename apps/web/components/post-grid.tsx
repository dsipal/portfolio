import { PostCard } from "@/components/post-card";
import { Stagger, StaggerItem } from "@/components/motion";
import type { PostSummary } from "@/lib/schemas";

export function PostGrid({ posts }: { posts: PostSummary[] }) {
  if (posts.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-12 text-center text-muted-foreground">
        No posts yet. Check back soon.
      </div>
    );
  }

  return (
    <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {posts.map((post, i) => (
        <StaggerItem key={post.id}>
          <PostCard post={post} priority={i < 3} />
        </StaggerItem>
      ))}
    </Stagger>
  );
}
