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
COPY apps/web/package.json apps/web/
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm install --frozen-lockfile --filter web...

# --- builder stage ---
FROM deps AS builder
COPY apps/web apps/web
WORKDIR /repo/apps/web
ENV NEXT_TELEMETRY_DISABLED=1
ARG NEXT_PUBLIC_GA_TRACKING_ID
ENV NEXT_PUBLIC_GA_TRACKING_ID=$NEXT_PUBLIC_GA_TRACKING_ID
# Ghost's public URL, used to prerender pages with real content. The compose
# "ghost" host doesn't exist at build time, so the build reads from the public
# URL. If unset/unreachable, pages build empty and ISR fills them in at runtime.
ARG GHOST_URL=http://localhost:2368
# The Content API key is passed as a BuildKit secret so it never lands in an image layer.
RUN --mount=type=secret,id=ghost_content_api_key,env=GHOST_CONTENT_API_KEY \
    GHOST_URL="$GHOST_URL" GHOST_INTERNAL_URL="$GHOST_URL" pnpm exec next build

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
