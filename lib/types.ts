// Strapi 5 REST responses are flat: fields live directly on each entry,
// not under `attributes` as in Strapi 4.

export type MediaFormat = {
  url: string;
  width: number;
  height: number;
};

export type StrapiMedia = {
  id: number;
  url: string;
  alternativeText: string | null;
  width: number | null;
  height: number | null;
  formats?: Partial<Record<"thumbnail" | "small" | "medium" | "large", MediaFormat>> | null;
};

export type Pagination = {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
};

export type StrapiResponse<T> = {
  data: T;
  meta: { pagination?: Pagination };
};

type Entry = {
  id: number;
  documentId: string;
};

export type Category = Entry & {
  title: string;
  slug: string;
  description: string | null;
};

export type Post = Entry & {
  title: string;
  slug: string;
  description: string | null;
  content: string | null;
  published_date: string | null;
  publishedAt: string;
  updatedAt: string;
  cover: StrapiMedia | null;
  postHero: StrapiMedia | null;
  category: Category | null;
};

/** Post as shown in lists: content is replaced by its reading time */
export type PostSummary = Omit<Post, "content" | "postHero"> & {
  readingTime: number;
};

export type Project = Entry & {
  title: string;
  slug: string | null;
  summary: string | null;
  description: string | null;
  image: StrapiMedia | null;
  tech: string[] | null;
  link: string | null;
  repoUrl: string | null;
  featured: boolean | null;
  order: number | null;
};

export type About = Entry & {
  header: string | null;
  body: string | null;
  image: StrapiMedia | null;
  github: string | null;
  linkedIn: string | null;
  resumeUrl: string | null;
  currentlyWorkingOn: string | null;
  currentPosition: {
    companyTitle: string | null;
    positionTitle: string | null;
    since: string | null;
    companyLink: string | null;
  } | null;
};

export type Global = Entry & {
  SiteName: string | null;
  favicon: StrapiMedia | null;
  defaultSeo: {
    MetaTitle: string | null;
    MetaDescription: string | null;
    shareImage: StrapiMedia | null;
  } | null;
};

export type SearchItem = {
  title: string;
  slug: string;
  description: string | null;
  category: string | null;
};
