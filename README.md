My personal portfolio website created using [Next.js](https://nextjs.org/) and [Strapi CMS](https://strapi.io/).
You can view this project at my website: [devinsipal.com](https://devinsipal.com)

## Layout

A pnpm workspace:

- `apps/web` — the Next.js frontend
- `apps/cms` — the Strapi CMS that provides all of the content

## Running it locally

```bash
cp .env.example .env               # fill in the Strapi secrets
docker compose -f docker-compose.dev.yml up
```

The site runs on <http://localhost:3000> and the Strapi admin on <http://localhost:1337/admin>. Create an API token in Strapi (Settings → API Tokens), put it in `.env` as `STRAPI_API_TOKEN` and restart.

Without Docker: `corepack enable && pnpm install`, then `pnpm dev:cms` and `pnpm dev:web`.

## Deploying

Pushes to `main` that pass CI publish both images to GHCR; the production `docker-compose.yml` runs them behind Traefik. See `CLAUDE.md` for details.
