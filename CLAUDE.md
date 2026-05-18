# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Personal portfolio website with two sub-projects:
- **`/` (root)** — Next.js 16 frontend (Pages Router), deployed to Vercel or as a Docker container
- **`/strapi-cms`** — Strapi 5 CMS backend, the sole data source for the frontend

All content (posts, categories, about page, global site settings) lives in Strapi and is fetched at build/request time via REST API.

## Commands

### Frontend (root)
```bash
yarn dev       # Start Next.js dev server on :3000
yarn build     # Production build (clears .next and .out first)
yarn lint      # ESLint via next lint
```

### Strapi CMS (`strapi-cms/`)
```bash
yarn dev       # Start Strapi with auto-reload on :1337
yarn build     # Build Strapi admin panel
yarn start     # Start Strapi in production mode
```

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
| `STRAPI_API_TOKEN` | Next.js runtime + build | Create in Strapi Admin → Settings → API Tokens |
| `STRAPI_INTERNAL_URL` | Next.js server-side only | Docker internal URL (`http://strapi:1337`); falls back to `http://localhost:1337` |
| `NEXT_PUBLIC_STRAPI_API_URL` | Next.js client-side | Baked in at build time; must be the public Strapi URL |
| `NEXT_PUBLIC_GA_TRACKING_ID` | Next.js client-side | Baked in at build time |
| `APP_KEYS`, `ADMIN_JWT_SECRET`, etc. | Strapi | Generate with `openssl rand -base64 32` |
| `CLOUDINARY_*` | Strapi production | Media uploads; not needed in dev |

**Important:** `NEXT_PUBLIC_*` vars must be set at Docker build time (passed as `ARG`), not just at runtime.

## Architecture

### Data Flow

```
Strapi CMS (PostgreSQL) → REST API → fetchAPI() in lib/api.js → Next.js pages (getStaticProps / getInitialProps)
```

- `lib/api.js` — All Strapi communication. `getStrapiURL()` switches between `STRAPI_INTERNAL_URL` (server) and `NEXT_PUBLIC_STRAPI_API_URL` (browser). `fetchAPI()` handles query string serialization via `qs` and bearer token auth.
- `lib/media.js` — `getStrapiMedia()` resolves Strapi media URLs: relative paths get prefixed with the Strapi base URL, absolute URLs (Cloudinary) pass through unchanged.

### Global Context

`pages/_app.js` fetches the `/global` Strapi endpoint on every request using `getInitialProps` (intentionally, to avoid disabling SSG on other pages — see comment in the file). The result is stored in `GlobalContext` and provides `SiteName`, `favicon`, and `defaultSeo` to all pages. `components/seo.js` reads this context to merge page-level SEO with site defaults.

### Pages and Rendering

All pages use **ISR** with `revalidate: 60`. On error, pages fall back to empty props (`revalidate: 1`) rather than failing the build. Dynamic routes use `fallback: "blocking"`.

| Route | Strapi endpoint |
|---|---|
| `/` | `/posts`, `/categories` |
| `/about` | `/about`, `/categories` |
| `/post/[slug]` | `/posts?filters[slug]=...`, `/categories` |
| `/category/[slug]` | `/categories?filters[slug]=...`, `/categories` |

### Strapi Content Types

- **`post`** (collection) — `title`, `description`, `slug`, `content` (richtext/Markdown), `published_date`, `cover` (media), `postHero` (media), `category` (relation)
- **`category`** (collection) — `title`, `slug`, has `posts` inverse relation
- **`about`** (single type) — `header`, `body`, `image`, `github`, `linkedIn`, `resumeUrl`, `currentPosition` (component), `skills` / `tech` (repeatable components — currently commented out in the UI)
- **`global`** (single type) — `SiteName`, `favicon`, `defaultSeo` (component)

### Styling

Tailwind CSS v4 with PostCSS. Dark mode uses `next-themes` with the `class` strategy — the `dark` class is toggled on `<html>`. Styles are in `styles/globals.css`. Syntax highlighting for code blocks uses `styles/prism-onedark.css` paired with `react-syntax-highlighter`.

### Post Rendering

Post `content` is stored as Markdown (Strapi richtext) and rendered with `react-markdown` + `rehype-raw` (allows embedded HTML). Code blocks are handled by `components/code-block.js` which maps to `react-syntax-highlighter`.

## Deployment

Pushing to `main` triggers a Portainer webhook (`.github/workflows/deploy.yml`) which redeploys the Docker stack. The production stack (`docker-compose.yml`) sits behind a Traefik reverse proxy for TLS termination.
