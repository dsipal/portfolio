# syntax=docker/dockerfile:1.10
# Build context: the repository root (pnpm workspace), e.g.
#   docker build -f apps/cms/Dockerfile .
# apps/cms/Dockerfile.dockerignore limits the context to what this image needs.
FROM node:24-alpine AS base
ENV PNPM_HOME=/pnpm \
    PATH=/pnpm:$PATH \
    COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable

# --- deps stage ---
FROM base AS deps
# Toolchain only needed to compile native modules; kept out of the runner image
RUN apk add --no-cache python3 make g++
WORKDIR /opt/app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
# Every workspace manifest must exist for a frozen-lockfile install
COPY apps/web/package.json apps/web/
COPY apps/cms/package.json apps/cms/
COPY apps/cms/src/plugins/fontawesome-strapi/package.json apps/cms/src/plugins/fontawesome-strapi/
# cms... includes the fontawesome-strapi workspace plugin it depends on
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm install --frozen-lockfile --filter cms...

# --- builder stage ---
FROM deps AS builder
ENV NODE_ENV=production \
    STRAPI_TELEMETRY_DISABLED=true
COPY apps/cms apps/cms
WORKDIR /opt/app/apps/cms
RUN pnpm build

# --- runner stage ---
FROM node:24-alpine AS runner
ENV NODE_ENV=production \
    STRAPI_TELEMETRY_DISABLED=true \
    HOST=0.0.0.0 \
    PORT=1337
COPY --from=builder --chown=node:node /opt/app /opt/app
WORKDIR /opt/app/apps/cms
# COPY --chown doesn't apply to directories Strapi creates at startup
# (database/migrations, uploads), so create them owned by node
RUN mkdir -p database/migrations public/uploads && \
    chown node:node /opt/app/apps/cms && \
    chown -R node:node database public/uploads
USER node
EXPOSE 1337
# Run strapi directly (not via pnpm) so SIGTERM reaches the process on redeploys
CMD ["/opt/app/node_modules/.bin/strapi", "start"]
