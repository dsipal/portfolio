import { revalidateTag } from "next/cache";
import { TAGS } from "@/lib/ghost";
import { verifyGhostSignature } from "@/lib/webhook";

/** Ghost webhook payload key → cache tags to expire when a resource of that kind changes */
const RESOURCE_TAGS: Record<string, string[]> = {
  post: [TAGS.posts],
  // Projects, the about page and the homepage are all Ghost pages
  page: [TAGS.projects, TAGS.about, TAGS.homepage],
  tag: [TAGS.categories, TAGS.posts],
};

/**
 * Ghost webhook target (Settings → Integrations → custom integration →
 * webhooks), with REVALIDATE_SECRET as the webhook secret. Point the post,
 * page, tag and "site changed" events here.
 */
export async function POST(request: Request) {
  const body = await request.text();
  if (!verifyGhostSignature(request.headers.get("x-ghost-signature"), body, process.env.REVALIDATE_SECRET)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: unknown = null;
  try {
    payload = JSON.parse(body);
  } catch {
    // An empty or non-JSON body revalidates everything
  }
  const resource =
    payload && typeof payload === "object" ? Object.keys(payload).find((key) => key in RESOURCE_TAGS) : undefined;
  // Anything else (site.changed) can touch every page
  const tags = (resource && RESOURCE_TAGS[resource]) || Object.values(TAGS);
  for (const tag of tags) revalidateTag(tag, { expire: 0 });

  return Response.json({ revalidated: tags });
}
