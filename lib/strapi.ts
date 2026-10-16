import "server-only";
import qs from "qs";
import { cache } from "react";
import type {
  About,
  Category,
  Global,
  Pagination,
  Post,
  PostSummary,
  Project,
  SearchItem,
  StrapiResponse,
} from "./types";
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

/**
 * GET a Strapi REST endpoint.
 *
 * At build time a failed request resolves to `fallback`, so the image still
 * builds when Strapi is unreachable and ISR fills pages in later. At runtime
 * it throws, so ISR keeps serving the last good page instead of caching an
 * empty one.
 */
async function fetchAPI<T>(
  path: string,
  params: object,
  tags: Tag[],
  fallback: StrapiResponse<T>,
): Promise<StrapiResponse<T>> {
  const token = process.env.STRAPI_API_TOKEN;
  const query = qs.stringify(params, { encodeValuesOnly: true });
  const url = getStrapiURL(`/api${path}${query ? `?${query}` : ""}`);

  try {
    const res = await fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      next: { revalidate: REVALIDATE_SECONDS, tags },
    });
    if (res.status === 404) return fallback;
    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}${token ? "" : " (STRAPI_API_TOKEN is not set)"}`);
    }
    return (await res.json()) as StrapiResponse<T>;
  } catch (err) {
    console.error(`[strapi] GET /api${path} failed: ${(err as Error).message}`);
    if (isBuild) return fallback;
    throw err;
  }
}

const emptyPagination = (pageSize: number): Pagination => ({
  page: 1,
  pageSize,
  pageCount: 0,
  total: 0,
});

const postListFields = [
  "title",
  "slug",
  "description",
  "content",
  "published_date",
  "publishedAt",
  "updatedAt",
];
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
  const res = await fetchAPI<Post[]>(
    "/posts",
    {
      fields: postListFields,
      populate: postListPopulate,
      sort: ["published_date:desc"],
      filters: category ? { category: { slug: { $eq: category } } } : undefined,
      pagination: { page, pageSize },
    },
    [TAGS.posts],
    { data: [], meta: { pagination: emptyPagination(pageSize) } },
  );
  return {
    posts: res.data.map(toSummary),
    pagination: res.meta.pagination ?? emptyPagination(pageSize),
  };
}

export const getPostBySlug = cache(async (slug: string) => {
  const res = await fetchAPI<Post[]>(
    "/posts",
    {
      filters: { slug: { $eq: slug } },
      populate: { cover: true, postHero: true, category: { fields: ["title", "slug"] } },
    },
    [TAGS.posts],
    { data: [], meta: {} },
  );
  return res.data[0] ?? null;
});

/** The posts published just before and after `post`, for prev/next links */
export async function getAdjacentPosts(post: Post) {
  if (!post.published_date) return { older: null, newer: null };
  const query = (op: "$lt" | "$gt", dir: "asc" | "desc") =>
    fetchAPI<Pick<Post, "title" | "slug">[]>(
      "/posts",
      {
        fields: ["title", "slug"],
        filters: { published_date: { [op]: post.published_date } },
        sort: [`published_date:${dir}`],
        pagination: { page: 1, pageSize: 1 },
      },
      [TAGS.posts],
      { data: [], meta: {} },
    );
  const [older, newer] = await Promise.all([query("$lt", "desc"), query("$gt", "asc")]);
  return { older: older.data[0] ?? null, newer: newer.data[0] ?? null };
}

/** Every post slug, for generateStaticParams and the sitemap */
export async function getAllPostSlugs() {
  const res = await fetchAPI<Pick<Post, "slug" | "updatedAt">[]>(
    "/posts",
    { fields: ["slug", "updatedAt"], pagination: { page: 1, pageSize: 1000 } },
    [TAGS.posts],
    { data: [], meta: {} },
  );
  return res.data;
}

/** Lightweight list of every post for the ⌘K search dialog */
export async function getSearchIndex(): Promise<SearchItem[]> {
  const res = await fetchAPI<Pick<Post, "title" | "slug" | "description" | "category">[]>(
    "/posts",
    {
      fields: ["title", "slug", "description"],
      populate: { category: { fields: ["title"] } },
      sort: ["published_date:desc"],
      pagination: { page: 1, pageSize: 1000 },
    },
    [TAGS.posts],
    { data: [], meta: {} },
  );
  return res.data.map((p) => ({
    title: p.title,
    slug: p.slug,
    description: p.description,
    category: p.category?.title ?? null,
  }));
}

export const getCategories = cache(async () => {
  const res = await fetchAPI<Category[]>(
    "/categories",
    { fields: ["title", "slug", "description"], sort: ["title:asc"] },
    [TAGS.categories],
    { data: [], meta: {} },
  );
  return res.data;
});

export const getCategoryBySlug = cache(async (slug: string) => {
  const categories = await getCategories();
  return categories.find((c) => c.slug === slug) ?? null;
});

export async function getProjects({ featured }: { featured?: boolean } = {}) {
  const res = await fetchAPI<Project[]>(
    "/projects",
    {
      populate: { image: true },
      filters: featured ? { featured: { $eq: true } } : undefined,
      sort: ["order:asc", "title:asc"],
      pagination: { page: 1, pageSize: 100 },
    },
    [TAGS.projects],
    { data: [], meta: {} },
  );
  return res.data;
}

export const getAbout = cache(async () => {
  const res = await fetchAPI<About | null>(
    "/about",
    { populate: { image: true, currentPosition: true } },
    [TAGS.about],
    { data: null, meta: {} },
  );
  return res.data;
});

export const getGlobal = cache(async () => {
  const res = await fetchAPI<Global | null>(
    "/global",
    { populate: { favicon: true, defaultSeo: { populate: "*" } } },
    [TAGS.global],
    { data: null, meta: {} },
  );
  return res.data;
});
