# syntax=docker/dockerfile:1.10
FROM node:24-alpine AS base

# --- deps stage ---
FROM base AS deps
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# --- builder stage ---
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
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
    STRAPI_INTERNAL_URL="${STRAPI_BUILD_URL:-http://localhost:1337}" npx next build

# --- runner stage ---
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME="0.0.0.0"
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:3000/',r=>process.exit(r.statusCode<500?0:1)).on('error',()=>process.exit(1))"
CMD ["node", "server.js"]
