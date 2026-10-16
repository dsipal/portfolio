# syntax=docker/dockerfile:1.10
# Build context: the repository root (pnpm workspace), e.g.
#   docker build -f apps/web/Dockerfile .
# apps/web/Dockerfile.dockerignore limits the context to what this image needs.
FROM node:24-alpine AS base
ENV PNPM_HOME=/pnpm \
    PATH=/pnpm:$PATH \
    COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable

# --- deps stage ---
FROM base AS deps
WORKDIR /repo
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
# Every workspace manifest must exist for a frozen-lockfile install
COPY apps/web/package.json apps/web/
COPY apps/cms/package.json apps/cms/
COPY apps/cms/src/plugins/fontawesome-strapi/package.json apps/cms/src/plugins/fontawesome-strapi/
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm install --frozen-lockfile --filter web...

# --- builder stage ---
FROM deps AS builder
COPY apps/web apps/web
WORKDIR /repo/apps/web
ENV NEXT_TELEMETRY_DISABLED=1
ARG NEXT_PUBLIC_STRAPI_API_URL
ARG NEXT_PUBLIC_GA_TRACKING_ID
ENV NEXT_PUBLIC_STRAPI_API_URL=$NEXT_PUBLIC_STRAPI_API_URL
ENV NEXT_PUBLIC_GA_TRACKING_ID=$NEXT_PUBLIC_GA_TRACKING_ID
# Strapi URL reachable from the build environment, used to prerender pages with
# real content. The compose "strapi" host doesn't exist at build time, so CI
# passes the public URL. If unset/unreachable, pages build empty and ISR fills
# them in at runtime.
ARG STRAPI_BUILD_URL
# The API token is passed as a BuildKit secret so it never lands in an image layer.
RUN --mount=type=secret,id=strapi_api_token,env=STRAPI_API_TOKEN \
    STRAPI_INTERNAL_URL="${STRAPI_BUILD_URL:-http://localhost:1337}" pnpm exec next build

# --- runner stage ---
FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME="0.0.0.0"
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs
# Standalone output mirrors the workspace layout: server.js is at apps/web/
COPY --from=builder --chown=nextjs:nodejs /repo/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /repo/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /repo/apps/web/public ./apps/web/public
USER nextjs
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:3000/',r=>process.exit(r.statusCode<500?0:1)).on('error',()=>process.exit(1))"
CMD ["node", "apps/web/server.js"]
