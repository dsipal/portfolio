import "server-only";
import { cache } from "react";
import type { z } from "zod";
import { ghostInternalURL } from "./media";
import {
  about,
  category,
  global,
  homepage,
  pagination as paginationSchema,
  post,
  postLink,
  postSlug,
  project,
  type Pagination,
  type Post,
  type PostSummary,
  type SearchItem,
} from "./schemas";

export const REVALIDATE_SECONDS = 60;
export const POSTS_PER_PAGE = 9;

/** Cache tags, so the Ghost webhook can revalidate by content type */
export const TAGS = {
  posts: "posts",
  categories: "categories",
  projects: "projects",
  about: "about",
  global: "global",
  homepage: "homepage",
} as const;

type Tag = (typeof TAGS)[keyof typeof TAGS];

/** Slugs of the Ghost pages that hold site content */
export const PAGES = { about: "about", homepage: "home" } as const;

/** Internal Ghost tag marking a page as a project ("#project" → slug "hash-project") */
export const PROJECT_TAG = "hash-project";

/** Ghost's largest page size; longer lists are fetched page by page */
const MAX_LIMIT = 100;

const isBuild = process.env.NEXT_PHASE === "phase-production-build";

type Params = Record<string, string | number | undefined>;
type RawResponse = Record<string, unknown> & { meta?: { pagination?: unknown } };

/**
 * GET a Ghost Content API endpoint and return the raw JSON, or null for a
 * 404 (a missing page or post).
 *
 * At build time a failed request also resolves to null, so the image still
 * builds when Ghost is unreachable and ISR fills pages in later. At runtime
 * it throws, so ISR keeps serving the last good page instead of caching an
 * empty one.
 */
async function fetchAPI(path: string, params: Params, tags: Tag[]): Promise<RawResponse | null> {
  const key = process.env.GHOST_CONTENT_API_KEY;
  const search = new URLSearchParams({ key: key ?? "" });
  for (const [name, value] of Object.entries(params)) {
    if (value !== undefined) search.set(name, String(value));
  }
  const url = `${ghostInternalURL()}/ghost/api/content${path}?${search}`;

  try {
    const res = await fetch(url, {
      headers: {
        "Accept-Version": "v6.0",
        // Ghost redirects plain-http requests when its `url` is https; the
        // internal Docker URL is http, so say the client side was secure
        "X-Forwarded-Proto": "https",
      },
      next: { revalidate: REVALIDATE_SECONDS, tags },
    });
    if (res.status === 404) return null;
    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}${key ? "" : " (GHOST_CONTENT_API_KEY is not set)"}`);
    }
    return (await res.json()) as RawResponse;
  } catch (err) {
    console.error(`[ghost] GET ${path} failed: ${(err as Error).message}`);
    if (isBuild) return null;
    throw err;
  }
}

/** First validation issue as "path: message", for log lines */
function describeIssue(error: z.ZodError) {
  const issue = error.issues[0];
  return issue ? `${issue.path.join(".") || "(root)"}: ${issue.message}` : "invalid";
}

/** Identify an entry in log lines by slug, falling back to its title or id */
function entryName(raw: unknown) {
  const e = (raw ?? {}) as { slug?: unknown; title?: unknown; id?: unknown };
  return String(e.slug || e.title || e.id || "?");
}

/**
 * Fetch a Ghost resource list (`posts`, `pages`, `tags`) and parse each
 * entry. Invalid entries are logged and dropped, so one bad entry can't take
 * the whole page down.
 */
async function fetchList<S extends z.ZodType>(
  label: string,
  resource: "posts" | "pages" | "tags",
  path: string,
  params: Params,
  tags: Tag[],
  schema: S,
): Promise<{ items: z.output<S>[]; pagination: Pagination | null }> {
  const res = await fetchAPI(path, params, tags);
  const list = res?.[resource];
  if (res && !Array.isArray(list)) {
    console.error(`[ghost] GET ${path}: expected a list of ${resource}, got ${typeof list}`);
  }
  const raw: unknown[] = Array.isArray(list) ? list : [];

  const items: z.output<S>[] = [];
  for (const entry of raw) {
    const parsed = schema.safeParse(entry);
    if (parsed.success) items.push(parsed.data);
    else
      console.error(`[ghost] invalid ${label} "${entryName(entry)}" skipped: ${describeIssue(parsed.error)}`);
  }

  const pagination = paginationSchema.safeParse(res?.meta?.pagination);
  return { items, pagination: pagination.success ? pagination.data : null };
}

/** Every entry of a list, following Ghost's pagination */
async function fetchAll<S extends z.ZodType>(
  label: string,
  resource: "posts" | "pages" | "tags",
  path: string,
  params: Params,
  tags: Tag[],
  schema: S,
) {
  const items: z.output<S>[] = [];
  for (let page = 1; ; page++) {
    const res = await fetchList(label, resource, path, { ...params, limit: MAX_LIMIT, page }, tags, schema);
    items.push(...res.items);
    if (!res.pagination || page >= res.pagination.pageCount) return items;
  }
}

/** A single Ghost page by slug. Missing or invalid content resolves to null. */
async function fetchPage<S extends z.ZodType>(slug: string, tags: Tag[], schema: S) {
  const { items } = await fetchList(slug, "pages", `/pages/slug/${encodeURIComponent(slug)}/`, {}, tags, schema);
  return items[0] ?? null;
}

const emptyPagination = (pageSize: number): Pagination => ({
  page: 1,
  pageSize,
  pageCount: 0,
  total: 0,
});

/** Ghost NQL string literal */
const quote = (value: string) => `'${value.replace(/\\/g, "\\\\").replace(/'/g, "\\'")}'`;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const toSummary = ({ html, ...post }: Post): PostSummary => post;

export async function getPosts({
  page = 1,
  pageSize = POSTS_PER_PAGE,
  category,
}: { page?: number; pageSize?: number; category?: string } = {}) {
  const { items, pagination } = await fetchList(
    "post",
    "posts",
    "/posts/",
    {
      include: "tags",
      order: "published_at desc",
      filter: category ? `tag:${quote(category)}` : undefined,
      limit: pageSize,
      page,
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
    "posts",
    `/posts/slug/${encodeURIComponent(slug)}/`,
    { include: "tags" },
    [TAGS.posts],
    post,
  );
  return items[0] ?? null;
});

/** The posts published just before and after `current`, for prev/next links */
export async function getAdjacentPosts(current: Post) {
  const query = (op: "<" | ">", dir: "asc" | "desc") =>
    fetchList(
      "post",
      "posts",
      "/posts/",
      {
        fields: "id,title,slug",
        filter: `published_at:${op}${quote(current.date)}`,
        order: `published_at ${dir}`,
        limit: 1,
      },
      [TAGS.posts],
      postLink,
    );
  const [older, newer] = await Promise.all([query("<", "desc"), query(">", "asc")]);
  return { older: older.items[0] ?? null, newer: newer.items[0] ?? null };
}

/** Every post slug, for generateStaticParams and the sitemap */
export async function getAllPostSlugs() {
  return fetchAll("post", "posts", "/posts/", { fields: "id,slug,updated_at" }, [TAGS.posts], postSlug);
}

/** Lightweight list of every post for the ⌘K search dialog */
export async function getSearchIndex(): Promise<SearchItem[]> {
  const items = await fetchAll(
    "post",
    "posts",
    "/posts/",
    { include: "tags", order: "published_at desc" },
    [TAGS.posts],
    post,
  );
  return items.map((p) => ({
    title: p.title,
    slug: p.slug,
    description: p.description,
    category: p.category?.title ?? null,
  }));
}

export const getCategories = cache(async () =>
  fetchAll(
    "category",
    "tags",
    "/tags/",
    { filter: "visibility:public", order: "name asc" },
    [TAGS.categories],
    category,
  ),
);

export const getCategoryBySlug = cache(async (slug: string) => {
  const categories = await getCategories();
  return categories.find((c) => c.slug === slug) ?? null;
});

/** Pages tagged #project, ordered by their `order` then title */
export async function getProjects({ featured }: { featured?: boolean } = {}) {
  const items = await fetchAll(
    "project",
    "pages",
    "/pages/",
    { filter: `tag:${PROJECT_TAG}${featured ? "+featured:true" : ""}` },
    [TAGS.projects],
    project,
  );
  return items.toSorted((a, b) => a.order - b.order || a.title.localeCompare(b.title));
}

export const getAbout = cache(async () => fetchPage(PAGES.about, [TAGS.about], about));

export const getHomepage = cache(async () => fetchPage(PAGES.homepage, [TAGS.homepage], homepage));

export const getGlobal = cache(async () => {
  const res = await fetchAPI("/settings/", {}, [TAGS.global]);
  if (res?.settings == null) return null;
  const parsed = global.safeParse(res.settings);
  if (parsed.success) return parsed.data;
  console.error(`[ghost] invalid settings ignored: ${describeIssue(parsed.error)}`);
  return null;
});
