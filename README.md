My personal portfolio website created using [Next.js](https://nextjs.org/) and [Ghost](https://ghost.org/) as a headless CMS.
You can view this project at my website: [devinsipal.com](https://devinsipal.com)

## Layout

A pnpm workspace:

- `apps/web` — the Next.js frontend
- Ghost runs from the official `ghost` Docker image and provides all of the content

## Running it locally

```bash
cp .env.example .env
pnpm docker:dev up                 # docker compose -f docker-compose.dev.yml up
```

The site runs on <http://localhost:3000> and Ghost on <http://localhost:2368/ghost>. Set up the Ghost admin account, add a custom integration (Settings → Integrations), put its Content API key in `.env` as `GHOST_CONTENT_API_KEY` and restart.

Without Docker: run Ghost yourself, then `corepack enable && pnpm install` and `pnpm dev:web` with `GHOST_URL` and `GHOST_CONTENT_API_KEY` set.

Moving content over from the old Strapi CMS: `scripts/migrate-strapi-to-ghost.mjs` (usage in its header).

## Deploying

Pushes to `main` that pass CI publish the web image to GHCR; the production `docker-compose.yml` runs it with Ghost and MySQL behind Traefik. See `CLAUDE.md` for details.
