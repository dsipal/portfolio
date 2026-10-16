# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Personal portfolio website with two sub-projects:
- **`/` (root)** — Next.js 16 frontend (App Router, TypeScript), deployed as a Docker container
- **`/strapi-cms`** — Strapi 5 CMS backend, the sole data source for the frontend

All content (posts, categories, projects, about page, global site settings) lives in Strapi and is fetched on the server via the REST API.

## Commands

### Frontend (root)
```bash
yarn dev       # Start Next.js dev server on :3000
yarn build     # Production build (clears .next and .out first; also type-checks)
yarn lint      # ESLint (flat config, eslint-config-next)
npx tsc --noEmit
```

### Strapi CMS (`strapi-cms/`)
```bash
yarn dev       # Start Strapi with auto-reload on :1337
yarn build     # Build Strapi admin panel
yarn start     # Start Strapi in production mode
```

Strapi's CLI searches parent directories for a `tsconfig.json`, so in a full checkout it finds the frontend's root config and fails at "Compiling TS". Run Strapi through `docker-compose.dev.yml` (which mounts only `strapi-cms/`), or move the root `tsconfig.json` aside while running Strapi commands on the host. Docker image builds are unaffected (the build context is `strapi-cms/`).

### Docker (full stack)
```bash
# Development — mounts source for hot-reload, exposes :3000 and :1337
docker compose -f docker-compose.dev.yml up

# Production — requires Traefik reverse proxy and populated .env
docker compose up
```

## Environment Variables

Copy `.env.example` to `.env`. Required variables:

| Variable | Where used | Notes |
|---|---|---|
| `STRAPI_API_TOKEN` | Next.js runtime + build | Create in Strapi Admin → Settings → API Tokens. Needs `find`/`findOne` on post, category, project, about, global. **Required at runtime** — ISR regenerates pages on the server |
| `STRAPI_INTERNAL_URL` | Next.js server | Docker internal URL (`http://strapi:1337`); falls back to `http://localhost:1337` |
| `NEXT_PUBLIC_STRAPI_API_URL` | Next.js | Public Strapi URL, used for relative media URLs in metadata. Baked in at build time |
| `NEXT_PUBLIC_GA_TRACKING_ID` | Next.js client-side | Baked in at build time; GA is omitted when unset |
| `SITE_URL` | Next.js server | Canonical site URL for metadata, sitemap, RSS. Defaults to `https://devinsipal.com` |
| `REVALIDATE_SECRET` | Next.js server | Bearer secret for `/api/revalidate` (Strapi webhook) |
| `APP_KEYS`, `ADMIN_JWT_SECRET`, etc. | Strapi | Generate with `openssl rand -base64 32` |
| `CLOUDINARY_*` | Strapi production | Media uploads; not needed in dev |

**Important:** `NEXT_PUBLIC_*` vars must be set at Docker build time (passed as `ARG`), not just at runtime. In production they come from GitHub Actions repository variables.

## Architecture

### Data Flow

```
Strapi CMS (PostgreSQL) → REST API → lib/strapi.ts (server-only) → Server Components in app/
```

- `lib/strapi.ts` — All Strapi communication; typed query helpers (`getPosts`, `getPostBySlug`, `getProjects`, …). Strapi 5 returns **flat** entries (`post.title`, `post.cover.url`) — there is no `attributes` wrapper. Every `fetch` is tagged (`TAGS`) and revalidates every 60s. A failed request returns an empty fallback **at build time** (so the image builds without Strapi) but **throws at runtime**, so ISR keeps serving the last good page. Errors are logged as `[strapi] GET /api/... failed: <status>`.
- `lib/types.ts` — Types for the Strapi 5 response shapes.
- `lib/media.ts` — `getStrapiMedia()`: absolute URLs (Cloudinary) pass through; relative paths get the internal Strapi URL (for next/image) or, with `{ public: true }`, the public URL (for metadata).
- `lib/site.ts` — `SITE_URL` and `getSiteInfo()` (site name/description from the `global` single type).
- `app/api/revalidate/route.ts` — Strapi webhook target; expires cache tags by model so edits appear immediately.

### Rendering

`app/layout.tsx` fetches global settings, categories, about (footer socials) and the search index once, and sets `title.template` metadata. All routes set `revalidate = 60` and use `generateStaticParams`; unknown params render on demand. Pagination uses path segments (`/blog/page/2/`) so pages stay static; page 1 lives at the base path.

| Route | Content |
|---|---|
| `/` | Hero (with the three.js `Cubes`), featured projects, latest 6 posts |
| `/blog/`, `/blog/page/[page]/` | Paginated post grid (9 per page, `POSTS_PER_PAGE`) |
| `/category/[slug]/`, `.../page/[page]/` | Same grid filtered by category |
| `/post/[slug]/` | Post with TOC, reading progress, prev/next; generated OG image |
| `/projects/` | Project grid |
| `/about/` | Bio, current position, socials |
| `/rss.xml`, `/sitemap.xml`, `/robots.txt`, `/opengraph-image` | Feeds and SEO |

`next.config.ts` keeps `trailingSlash: true` and `output: "standalone"` (used by the Dockerfile).

### Strapi Content Types

- **`post`** (collection) — `title`, `description`, `slug`, `content` (Markdown), `published_date`, `cover`, `postHero` (media), `category` (relation)
- **`category`** (collection) — `title`, `slug`, `description`, has `posts` inverse relation
- **`project`** (collection) — `title`, `slug`, `summary`, `description`, `image`, `tech` (JSON string array), `link` (live URL), `repoUrl`, `featured`, `order`
- **`about`** (single type) — `header`, `body`, `image`, `github`, `linkedIn`, `resumeUrl`, `currentlyWorkingOn`, `currentPosition` (component)
- **`global`** (single type) — `SiteName`, `favicon`, `defaultSeo` (component: `MetaTitle`, `MetaDescription`, `shareImage`)
- **`homepage`** (single type) — currently unused

### UI

- **shadcn/ui** (`components/ui/*`, config in `components.json`) on Tailwind CSS v4. Theme tokens (`--background`, `--brand`, …) are defined in `app/globals.css` for light and `.dark`; use semantic classes (`bg-background`, `text-muted-foreground`, `text-brand`) rather than raw colors. Add components with `npx shadcn@latest add <name>` (check the generated `cn` import path).
- Dark mode: `next-themes` with the `class` strategy.
- Animation: `motion` (`motion/react`). Reusable `FadeIn` / `Stagger` / `StaggerItem` in `components/motion.tsx`; `MotionConfig reducedMotion="user"` in `components/providers.tsx`. `app/template.tsx` fades pages in (opacity only — transforms there would break fixed/sticky elements).
- Fonts: Geist Sans/Mono via `next/font`.
- Markdown (`components/markdown.tsx`) renders on the server with `MarkdownAsync`: remark-gfm, rehype-raw, rehype-slug, rehype-autolink-headings and rehype-pretty-code (Shiki, dual light/dark themes). `lib/toc.ts` extracts h2/h3 with the same github-slugger ids.
- `components/cubes.tsx` is three.js, loaded client-only via `components/cubes-lazy.tsx`; it pauses off-screen and respects reduced motion.
- ⌘K search (`components/search-dialog.tsx`) filters the server-provided post index on the client.

## Deployment

Pushing to `main` runs `.github/workflows/build.yml`, which builds `portfolio-web` and `portfolio-strapi` images and pushes them to GHCR (`:latest` and `:<sha>`). Watchtower on the host detects the new `:latest` images and recreates the `strapi` and `portfolio` containers (opted in via `com.centurylinklabs.watchtower.enable=true`; `postgres` is opted out). There is no deploy step in CI. The production stack (`docker-compose.yml`) is pasted into Portainer as a web-editor stack, only references images (no `build:`) and sits behind a Traefik reverse proxy for TLS termination.

GitHub repo config the workflow needs: variables `NEXT_PUBLIC_STRAPI_API_URL`, `NEXT_PUBLIC_GA_TRACKING_ID`; secrets `STRAPI_API_TOKEN` (optional, for prerendering real content at build). The Portainer stack env needs `STRAPI_API_TOKEN` and `REVALIDATE_SECRET` for the `portfolio` container at runtime.
