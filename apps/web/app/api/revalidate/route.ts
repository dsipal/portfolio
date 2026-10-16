import { revalidateTag } from "next/cache";
import { timingSafeEqual } from "node:crypto";
import { TAGS } from "@/lib/strapi";

/** Strapi model → cache tags to expire when an entry of that model changes */
const MODEL_TAGS: Record<string, string[]> = {
  post: [TAGS.posts],
  category: [TAGS.categories, TAGS.posts],
  project: [TAGS.projects],
  about: [TAGS.about],
  global: [TAGS.global],
};

function authorized(header: string | null) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret || !header) return false;
  const a = Buffer.from(header);
  const b = Buffer.from(`Bearer ${secret}`);
  return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * Strapi webhook target (Settings → Webhooks). Send entry create/update/
 * delete/publish/unpublish events with header `Authorization: Bearer <REVALIDATE_SECRET>`.
 */
export async function POST(request: Request) {
  if (!authorized(request.headers.get("authorization"))) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as { model?: string };
  const tags = (body.model && MODEL_TAGS[body.model]) || Object.values(TAGS);
  for (const tag of tags) revalidateTag(tag, { expire: 0 });

  return Response.json({ revalidated: tags });
}
