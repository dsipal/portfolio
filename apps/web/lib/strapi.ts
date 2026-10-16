import "server-only";
import qs from "qs";
import { cache } from "react";
import type { z } from "zod";
import {
  about,
  category,
  global,
  pagination as paginationSchema,
  post,
  postLink,
  postSearch,
  postSlug,
  project,
  type Pagination,
  type Post,
  type PostSummary,
  type SearchItem,
} from "./schemas";
import { readingTime } from "./reading-time";

export const REVALIDATE_SECONDS = 60;
export const POSTS_PER_PAGE = 9;

/** Cache tags, so the Strapi webhook can revalidate by content type */
export const TAGS = {
  posts: "posts",
  categories: "categories",
  projects: "projects",
  about: "about",
  global: "global",
} as const;

type Tag = (typeof TAGS)[keyof typeof TAGS];

const isBuild = process.env.NEXT_PHASE === "phase-production-build";

export function getStrapiURL(path = "") {
  const base = process.env.STRAPI_INTERNAL_URL || "http://localhost:1337";
  return `${base}${path}`;
}

type RawResponse = { data?: unknown; meta?: { pagination?: unknown } };

/**
 * GET a Strapi REST endpoint and return the raw JSON, or null for a 404
 * (an unpublished single type).
 *
 * At build time a failed request also resolves to null, so the image still
 * builds when Strapi is unreachable and ISR fills pages in later. At runtime
 * it throws, so ISR keeps serving the last good page instead of caching an
 * empty one.
 */
async function fetchAPI(path: string, params: object, tags: Tag[]): Promise<RawResponse | null> {
  const token = process.env.STRAPI_API_TOKEN;
  const query = qs.stringify(params, { encodeValuesOnly: true });
  const url = getStrapiURL(`/api${path}${query ? `?${query}` : ""}`);

  try {
    const res = await fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      next: { revalidate: REVALIDATE_SECONDS, tags },
    });
    if (res.status === 404) return null;
    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}${token ? "" : " (STRAPI_API_TOKEN is not set)"}`);
    }
    return (await res.json()) as RawResponse;
  } catch (err) {
    console.error(`[strapi] GET /api${path} failed: ${(err as Error).message}`);
    if (isBuild) return null;
    throw err;
  }
}

/** First validation issue as "path: message", for log lines */
function describeIssue(error: z.ZodError) {
  const issue = error.issues[0];
  return issue ? `${issue.path.join(".") || "(root)"}: ${issue.message}` : "invalid";
}

/** Identify an entry in log lines by slug, falling back to its id */
function entryName(raw: unknown) {
  const e = (raw ?? {}) as { slug?: unknown; title?: unknown; id?: unknown };
  return String(e.slug || e.title || e.id || "?");
}

/**
 * Fetch a collection and parse each entry. Invalid entries are logged and
 * dropped, so one bad entry can't take the whole page down.
 */
async function fetchList<S extends z.ZodType>(
  label: string,
  path: string,
  params: object,
  tags: Tag[],
  schema: S,
): Promise<{ items: z.output<S>[]; pagination: Pagination | null }> {
  const res = await fetchAPI(path, params, tags);
  if (res && !Array.isArray(res.data)) {
    console.error(`[strapi] GET /api${path}: expected a list, got ${typeof res.data}`);
  }
  const raw = Array.isArray(res?.data) ? res.data : [];

  const items: z.output<S>[] = [];
  for (const entry of raw) {
    const parsed = schema.safeParse(entry);
    if (parsed.success) items.push(parsed.data);
    else console.error(`[strapi] invalid ${label} "${entryName(entry)}" skipped: ${describeIssue(parsed.error)}`);
  }

  const pagination = paginationSchema.safeParse(res?.meta?.pagination);
  return { items, pagination: pagination.success ? pagination.data : null };
}

/** Fetch a single type. Missing or invalid content resolves to null. */
async function fetchSingle<S extends z.ZodType>(
  label: string,
  path: string,
  params: object,
  tags: Tag[],
  schema: S,
): Promise<z.output<S> | null> {
  const res = await fetchAPI(path, params, tags);
  if (res?.data == null) return null;
  const parsed = schema.safeParse(res.data);
  if (parsed.success) return parsed.data;
  console.error(`[strapi] invalid ${label} ignored: ${describeIssue(parsed.error)}`);
  return null;
}

const emptyPagination = (pageSize: number): Pagination => ({
  page: 1,
  pageSize,
  pageCount: 0,
  total: 0,
});

const postListFields = ["title", "slug", "description", "content", "published_date", "publishedAt", "updatedAt"];
const postListPopulate = {
  cover: true,
  category: { fields: ["title", "slug"] },
};

function toSummary({ content, ...post }: Post): PostSummary {
  return { ...post, readingTime: readingTime(content) };
}

export async function getPosts({
  page = 1,
  pageSize = POSTS_PER_PAGE,
  category,
}: { page?: number; pageSize?: number; category?: string } = {}) {
  const { items, pagination } = await fetchList(
    "post",
    "/posts",
    {
      fields: postListFields,
      populate: postListPopulate,
      sort: ["published_date:desc"],
      filters: category ? { category: { slug: { $eq: category } } } : undefined,
      pagination: { page, pageSize },
    },
    [TAGS.posts],
    post,
  );
  return {
    posts: items.map(toSummary),
    pagination: pagination ?? emptyPagination(pageSize),
  };
}

export const getPostBySlug = cache(async (slug: string) => {
  const { items } = await fetchList(
    "post",
    "/posts",
    {
      filters: { slug: { $eq: slug } },
      populate: { cover: true, postHero: true, category: { fields: ["title", "slug"] } },
    },
    [TAGS.posts],
    post,
  );
  return items[0] ?? null;
});

/** The posts published just before and after `post`, for prev/next links */
export async function getAdjacentPosts(current: Post) {
  if (!current.published_date) return { older: null, newer: null };
  const query = (op: "$lt" | "$gt", dir: "asc" | "desc") =>
    fetchList(
      "post",
      "/posts",
      {
        fields: ["title", "slug"],
        filters: { published_date: { [op]: current.published_date } },
        sort: [`published_date:${dir}`],
        pagination: { page: 1, pageSize: 1 },
      },
      [TAGS.posts],
      postLink,
    );
  const [older, newer] = await Promise.all([query("$lt", "desc"), query("$gt", "asc")]);
  return { older: older.items[0] ?? null, newer: newer.items[0] ?? null };
}

/** Every post slug, for generateStaticParams and the sitemap */
export async function getAllPostSlugs() {
  const { items } = await fetchList(
    "post",
    "/posts",
    { fields: ["slug", "updatedAt"], pagination: { page: 1, pageSize: 1000 } },
    [TAGS.posts],
    postSlug,
  );
  return items;
}

/** Lightweight list of every post for the ⌘K search dialog */
export async function getSearchIndex(): Promise<SearchItem[]> {
  const { items } = await fetchList(
    "post",
    "/posts",
    {
      fields: ["title", "slug", "description"],
      populate: { category: { fields: ["title", "slug"] } },
      sort: ["published_date:desc"],
      pagination: { page: 1, pageSize: 1000 },
    },
    [TAGS.posts],
    postSearch,
  );
  return items.map((p) => ({
    title: p.title,
    slug: p.slug,
    description: p.description,
    category: p.category?.title ?? null,
  }));
}

export const getCategories = cache(async () => {
  const { items } = await fetchList(
    "category",
    "/categories",
    { fields: ["title", "slug", "description"], sort: ["title:asc"] },
    [TAGS.categories],
    category,
  );
  return items;
});

export const getCategoryBySlug = cache(async (slug: string) => {
  const categories = await getCategories();
  return categories.find((c) => c.slug === slug) ?? null;
});

export async function getProjects({ featured }: { featured?: boolean } = {}) {
  const { items } = await fetchList(
    "project",
    "/projects",
    {
      // "*" populates media and components without failing on attributes an
      // older CMS doesn't have yet (e.g. techStack during a rollout)
      populate: "*",
      filters: featured ? { featured: { $eq: true } } : undefined,
      sort: ["order:asc", "title:asc"],
      pagination: { page: 1, pageSize: 100 },
    },
    [TAGS.projects],
    project,
  );
  return items;
}

export const getAbout = cache(async () =>
  fetchSingle("about", "/about", { populate: { image: true, currentPosition: true } }, [TAGS.about], about),
);

export const getGlobal = cache(async () =>
  fetchSingle(
    "global",
    "/global",
    { populate: { favicon: true, defaultSeo: { populate: "*" } } },
    [TAGS.global],
    global,
  ),
);
