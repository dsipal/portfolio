import { z } from "zod";
import { getStrapiMedia } from "./media";

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

/** The project techStack component ([{ name }]) as a list of names; blank names are dropped */
export const techStack = optional(z.array(z.object({ name: optional(z.string()) }))).transform((items) =>
  (items ?? []).map((item) => item.name?.trim() ?? "").filter(Boolean),
);

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
    techStack,
    link: url,
    repoUrl: url,
    featured: optional(z.boolean()).transform(Boolean),
    order: optional(z.number()).transform((n) => n ?? 0),
  })
  .transform(({ techStack, ...p }) => ({ ...p, tech: techStack }));

/** An editable label: blank or missing falls back to the CMS default */
const label = (fallback: string) => optional(z.string()).transform((value) => value?.trim() || fallback);

/** A Font Awesome icon picked in the CMS ("fa-solid code", "fa-brands github") */
const icon = optional(z.string()).transform((value) => value?.trim() || null);

/**
 * A downloadable document (résumé, cover letter): an uploaded file wins over
 * the external URL. Null when neither is set, so the link is hidden.
 */
function documentLink(file: StrapiMedia | null, href: string | null, label: string) {
  const resolved = getStrapiMedia(file, { public: true }) ?? href;
  return resolved ? { href: resolved, label } : null;
}

export const about = z.object({
  ...entry,
  eyebrow: label("About me"),
  header: optional(z.string()),
  body: optional(z.string()),
  image: optional(strapiMedia),
  github: url,
  linkedIn: url,
  resumeUrl: url,
  resumeLabel: label("Résumé"),
  resumeFile: optional(strapiMedia),
  coverLetterUrl: url,
  coverLetterLabel: label("Cover letter"),
  coverLetterFile: optional(strapiMedia),
  currentPosition: optional(
    z.object({
      companyTitle: optional(z.string()),
      positionTitle: optional(z.string()),
      since: optional(z.string()),
      companyLink: url,
    }),
  ),
  nowHeading: label("Now"),
  currentlyWorkingOn: optional(z.string()),
  skillsHeading: label("What I do"),
  skills: optional(
    z.array(z.object({ name: optional(z.string()), description: optional(z.string()), icon })),
  ).transform((items) =>
    (items ?? []).filter((s): s is typeof s & { name: string } => Boolean(s.name?.trim())),
  ),
  toolboxHeading: label("Toolbox"),
  tech: optional(z.array(z.object({ name: optional(z.string()), link: url, icon }))).transform((items) =>
    (items ?? []).filter((t): t is typeof t & { name: string } => Boolean(t.name?.trim())),
  ),
})
  .transform(({ resumeUrl, resumeLabel, resumeFile, coverLetterUrl, coverLetterLabel, coverLetterFile, ...a }) => ({
    ...a,
    resume: documentLink(resumeFile, resumeUrl, resumeLabel),
    coverLetter: documentLink(coverLetterFile, coverLetterUrl, coverLetterLabel),
  }));

export const homepage = z.object({
  ...entry,
  heroGreeting: label("Hi, I'm"),
  /** Name in the hero heading; the site name is used when empty */
  heroName: optional(z.string()).transform((value) => value?.trim() || null),
  heroSubheading: optional(z.string()).transform((value) => value?.trim() || null),
  /** "Open to" cell of the front page's Now strip; hidden when empty */
  availability: optional(z.string()).transform((value) => value?.trim() || null),
});

export const global = z.object({
  ...entry,
  SiteName: optional(z.string()),
  favicon: optional(strapiMedia),
  defaultSeo: optional(
    z.object({
      MetaDescription: optional(z.string()),
      /** Default Open Graph image; a card is generated when unset */
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
export type Homepage = z.infer<typeof homepage>;
export type Global = z.infer<typeof global>;

/** Post as shown in lists: content is replaced by its reading time */
export type PostSummary = Omit<Post, "content"> & { readingTime: number };

export type SearchItem = {
  title: string;
  slug: string;
  description: string | null;
  category: string | null;
};
