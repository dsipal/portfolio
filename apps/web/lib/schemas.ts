import { z } from "zod";

// Schemas for Strapi 5 REST responses (flat: fields live directly on each
// entry). Every response is parsed against these, and the TypeScript types
// below are derived from them so the two can't drift apart.
//
// Fields editors fill in by hand are parsed leniently and normalized, so a
// formatting slip shows up as a log line instead of a broken page.

/** Optional field: missing (not populated / not selected) and null both become null */
const optional = <T extends z.ZodType>(schema: T) => schema.nullish().transform((v) => v ?? null);

/** A trimmed http(s) URL; empty or invalid values become null */
const url = optional(z.string()).transform((value) => {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  try {
    return ["http:", "https:"].includes(new URL(trimmed).protocol) ? trimmed : null;
  } catch {
    return null;
  }
});

/**
 * A list of technology names. Accepts the techStack component
 * ([{ name }]), the legacy JSON field as an array (["a", "b"]), an object with
 * numeric keys ({ 0: "a", 1: "b" }) or a comma-separated string ("a, b").
 */
export const techList = z.unknown().transform((value): string[] => {
  const items =
    typeof value === "string"
      ? value.split(",")
      : Array.isArray(value)
        ? value
        : value && typeof value === "object"
          ? Object.values(value)
          : [];
  return items
    .map((item) =>
      typeof item === "string"
        ? item
        : item && typeof item === "object" && "name" in item
          ? String(item.name ?? "")
          : "",
    )
    .map((s) => s.trim())
    .filter(Boolean);
});

const entry = {
  id: z.number(),
  documentId: z.string(),
};

const mediaFormat = z.object({ url: z.string(), width: z.number(), height: z.number() });

export const strapiMedia = z.object({
  id: z.number(),
  url: z.string().min(1),
  alternativeText: optional(z.string()),
  width: optional(z.number()),
  height: optional(z.number()),
  formats: optional(z.record(z.string(), mediaFormat.partial())),
});

export const pagination = z.object({
  page: z.number(),
  pageSize: z.number(),
  pageCount: z.number(),
  total: z.number(),
});

export const category = z.object({
  ...entry,
  title: z.string().min(1),
  slug: z.string().min(1),
  description: optional(z.string()),
});

export const post = z.object({
  ...entry,
  title: z.string().min(1),
  slug: z.string().min(1),
  description: optional(z.string()),
  content: optional(z.string()),
  published_date: optional(z.string()),
  publishedAt: z.string(),
  updatedAt: z.string(),
  cover: optional(strapiMedia),
  postHero: optional(strapiMedia),
  category: optional(category),
});

/** Just the fields getAllPostSlugs selects */
export const postSlug = post.pick({ id: true, documentId: true, slug: true, updatedAt: true });

/** Just the fields getAdjacentPosts selects */
export const postLink = post.pick({ id: true, documentId: true, title: true, slug: true });

/** Just the fields getSearchIndex selects */
export const postSearch = post.pick({
  id: true,
  documentId: true,
  title: true,
  slug: true,
  description: true,
  category: true,
});

export const project = z
  .object({
    ...entry,
    title: z.string().min(1),
    slug: optional(z.string()),
    summary: optional(z.string()),
    description: optional(z.string()),
    image: optional(strapiMedia),
    techStack: techList.default([]),
    /** Legacy JSON field, read until every project uses techStack */
    tech: techList.default([]),
    link: url,
    repoUrl: url,
    featured: optional(z.boolean()).transform(Boolean),
    order: optional(z.number()).transform((n) => n ?? 0),
  })
  .transform(({ techStack, tech, ...p }) => ({ ...p, tech: techStack.length > 0 ? techStack : tech }));

export const about = z.object({
  ...entry,
  header: optional(z.string()),
  body: optional(z.string()),
  image: optional(strapiMedia),
  github: url,
  linkedIn: url,
  resumeUrl: url,
  currentlyWorkingOn: optional(z.string()),
  currentPosition: optional(
    z.object({
      companyTitle: optional(z.string()),
      positionTitle: optional(z.string()),
      since: optional(z.string()),
      companyLink: url,
    }),
  ),
});

export const global = z.object({
  ...entry,
  SiteName: optional(z.string()),
  favicon: optional(strapiMedia),
  defaultSeo: optional(
    z.object({
      MetaTitle: optional(z.string()),
      MetaDescription: optional(z.string()),
      shareImage: optional(strapiMedia),
    }),
  ),
});

export type StrapiMedia = z.infer<typeof strapiMedia>;
export type Pagination = z.infer<typeof pagination>;
export type Category = z.infer<typeof category>;
export type Post = z.infer<typeof post>;
export type Project = z.infer<typeof project>;
export type About = z.infer<typeof about>;
export type Global = z.infer<typeof global>;

/** Post as shown in lists: content is replaced by its reading time */
export type PostSummary = Omit<Post, "content"> & { readingTime: number };

export type SearchItem = {
  title: string;
  slug: string;
  description: string | null;
  category: string | null;
};
