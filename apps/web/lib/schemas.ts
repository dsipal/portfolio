import { z } from "zod";
import { getCmsMedia } from "./media";

// Schemas for Ghost Content API responses. Every response is parsed against
// these and transformed into the shapes the components use; the TypeScript
// types below are derived from them so the two can't drift apart.
//
// Ghost has no custom fields, so projects, the about page and the homepage
// keep their structured fields as a JSON object in the page's code injection
// (Settings → Code injection → Site header), see `readPageData`. Hand-entered
// values are parsed leniently and normalized, so a formatting slip shows up
// as a log line instead of a broken page.

/** Optional field: missing and null both become null */
const optional = <T extends z.ZodType>(schema: T) => schema.nullish().transform((v) => v ?? null);

/** Trimmed text; blank becomes null */
const text = optional(z.string()).transform((value) => value?.trim() || null);

function httpUrl(value: string | null | undefined) {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  try {
    return ["http:", "https:"].includes(new URL(trimmed).protocol) ? trimmed : null;
  } catch {
    return null;
  }
}

/** A trimmed http(s) URL; empty or invalid values become null */
const url = optional(z.string()).transform(httpUrl);

/** A link to an uploaded file: an http(s) URL, or a path on Ghost ("/content/files/cv.pdf") */
const fileUrl = optional(z.string()).transform((value) => {
  const trimmed = value?.trim();
  if (trimmed?.startsWith("/") && !trimmed.startsWith("//")) {
    return getCmsMedia({ url: trimmed }, { public: true });
  }
  return httpUrl(trimmed);
});

/** An editable label: blank or missing falls back to the default */
const label = (fallback: string) => optional(z.string()).transform((value) => value?.trim() || fallback);

/** A Font Awesome icon name ("fa-solid code", "fa-brands github") */
const icon = text;

/** A list of names (project tech stack); blank names are dropped */
export const nameList = optional(z.array(optional(z.string()))).transform((items) =>
  (items ?? []).map((name) => name?.trim() ?? "").filter(Boolean),
);

export const cmsImage = z.object({ url: z.string().min(1), alt: z.string().nullable() });

const toImage = (url: string | null, alt: string | null) => (url ? { url, alt } : null);

// Ghost's limit is a number, or "all"
export const pagination = z
  .object({
    page: z.number(),
    limit: z.union([z.number(), z.string()]),
    pages: z.number(),
    total: z.number(),
  })
  .transform((p) => ({
    page: p.page,
    pageSize: typeof p.limit === "number" ? p.limit : p.total,
    pageCount: p.pages,
    total: p.total,
  }));

const ghostTag = z.object({
  id: z.string(),
  name: z.string().min(1),
  slug: z.string().min(1),
  description: optional(z.string()),
  visibility: optional(z.string()),
});

/** A public Ghost tag, used as a post category */
export const category = ghostTag.transform(({ id, name, slug, description }) => ({
  id,
  title: name,
  slug,
  description: description?.trim() || null,
}));

export const post = z
  .object({
    id: z.string(),
    title: z.string().min(1),
    slug: z.string().min(1),
    custom_excerpt: optional(z.string()),
    html: optional(z.string()),
    published_at: z.string(),
    updated_at: optional(z.string()),
    feature_image: optional(z.string()),
    feature_image_alt: optional(z.string()),
    reading_time: optional(z.number()),
    primary_tag: optional(ghostTag),
  })
  .transform((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    description: p.custom_excerpt?.trim() || null,
    html: p.html?.trim() || null,
    date: p.published_at,
    updatedAt: p.updated_at ?? p.published_at,
    cover: toImage(p.feature_image, p.feature_image_alt),
    // Internal tags (#something) are for organisation, never a category
    category:
      p.primary_tag && p.primary_tag.visibility !== "internal" ? category.parse(p.primary_tag) : null,
    readingTime: Math.max(1, p.reading_time ?? 1),
  }));

/** Just the fields getAllPostSlugs selects */
export const postSlug = z
  .object({ id: z.string(), slug: z.string().min(1), updated_at: optional(z.string()) })
  .transform(({ id, slug, updated_at }) => ({ id, slug, updatedAt: updated_at ?? undefined }));

/** Just the fields getAdjacentPosts selects */
export const postLink = z.object({ id: z.string(), title: z.string().min(1), slug: z.string().min(1) });

/**
 * The JSON object in a page's code injection. Either the bare object or one
 * wrapped in <script type="application/json">…</script> (which keeps Ghost's
 * own theme from printing it). Empty means {}; malformed JSON throws.
 */
export function readPageData(raw: string | null | undefined): unknown {
  if (!raw?.trim()) return {};
  const script = /<script\b[^>]*>([\s\S]*?)<\/script>/i.exec(raw);
  const json = (script ? script[1] : raw).trim();
  return json ? JSON.parse(json) : {};
}

const ghostPage = z.object({
  id: z.string(),
  title: z.string().min(1),
  slug: z.string().min(1),
  html: optional(z.string()),
  custom_excerpt: optional(z.string()),
  excerpt: optional(z.string()),
  feature_image: optional(z.string()),
  feature_image_alt: optional(z.string()),
  featured: optional(z.boolean()),
  codeinjection_head: optional(z.string()),
});

type GhostPage = z.output<typeof ghostPage>;

/**
 * A Ghost page plus its page data, validated against `data`. Malformed JSON
 * is logged and treated as empty, so the page still renders with defaults;
 * well-formed JSON with invalid values fails the page like any other field.
 */
function pageWith<T extends z.ZodType>(data: T) {
  return ghostPage.transform((page, ctx): { page: GhostPage; data: z.output<T> } => {
    let raw: unknown = {};
    try {
      raw = readPageData(page.codeinjection_head);
    } catch (err) {
      console.error(`[ghost] invalid page data "${page.slug}" ignored: ${(err as Error).message}`);
    }
    const parsed = data.safeParse(raw);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        ctx.addIssue({ code: "custom", message: issue.message, path: ["codeinjection_head", ...issue.path] });
      }
      return z.NEVER;
    }
    return { page, data: parsed.data };
  });
}

export const projectData = z.object({
  link: url,
  repoUrl: url,
  tech: nameList,
  order: optional(z.number()).transform((n) => n ?? 0),
});

export const project = pageWith(projectData).transform(({ page, data }) => ({
  id: page.id,
  slug: page.slug,
  title: page.title,
  summary: page.custom_excerpt?.trim() || page.excerpt?.trim() || null,
  image: toImage(page.feature_image, page.feature_image_alt),
  featured: Boolean(page.featured),
  ...data,
}));

/** A downloadable document (résumé, cover letter): a URL string or { url, label } */
const documentLink = (fallbackLabel: string) =>
  optional(
    z.union([
      z.string().transform((url) => ({ url, label: null })),
      z.object({ url: optional(z.string()), label: optional(z.string()) }),
    ]),
  ).transform((doc) => {
    const href = fileUrl.parse(doc?.url);
    return href ? { href, label: doc?.label?.trim() || fallbackLabel } : null;
  });

export const aboutData = z.object({
  eyebrow: label("About me"),
  github: url,
  linkedIn: url,
  resume: documentLink("Résumé"),
  coverLetter: documentLink("Cover letter"),
  currentPosition: optional(
    z.object({
      companyTitle: text,
      positionTitle: text,
      since: text,
      companyLink: url,
    }),
  ),
  nowHeading: label("Now"),
  currentlyWorkingOn: text,
  skillsHeading: label("What I do"),
  skills: optional(z.array(z.object({ name: text, description: text, icon }))).transform((items) =>
    (items ?? []).filter((s): s is typeof s & { name: string } => Boolean(s.name)),
  ),
  toolboxHeading: label("Toolbox"),
  tech: optional(z.array(z.object({ name: text, link: url, icon }))).transform((items) =>
    (items ?? []).filter((t): t is typeof t & { name: string } => Boolean(t.name)),
  ),
});

/** The `about` page: title is the headline, content the bio, feature image the portrait */
export const about = pageWith(aboutData).transform(({ page, data }) => ({
  id: page.id,
  header: page.title,
  body: page.html?.trim() || null,
  image: toImage(page.feature_image, page.feature_image_alt),
  ...data,
}));

export const homepageData = z.object({
  heroGreeting: label("Hi, I'm"),
  heroSubheading: text,
  /** "Open to" cell of the front page's Now strip; hidden when empty */
  availability: text,
});

/** The `home` page: only its page data is used */
export const homepage = pageWith(homepageData).transform(({ data }) => data);

/** Ghost's site settings */
export const global = z
  .object({
    title: optional(z.string()),
    description: optional(z.string()),
    icon: optional(z.string()),
    og_image: optional(z.string()),
    meta_description: optional(z.string()),
  })
  .transform((s) => ({
    siteName: s.title?.trim() || null,
    description: s.meta_description?.trim() || s.description?.trim() || null,
    favicon: s.icon ? { url: s.icon } : null,
    shareImage: s.og_image ? { url: s.og_image } : null,
  }));

export type CmsImage = z.infer<typeof cmsImage>;
export type Pagination = z.output<typeof pagination>;
export type Category = z.output<typeof category>;
export type Post = z.output<typeof post>;
export type Project = z.output<typeof project>;
export type About = z.output<typeof about>;
export type Homepage = z.output<typeof homepage>;
export type Global = z.output<typeof global>;

/** Post as shown in lists, without its body */
export type PostSummary = Omit<Post, "html">;

export type SearchItem = {
  title: string;
  slug: string;
  description: string | null;
  category: string | null;
};
