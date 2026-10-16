FROM node:24-alpine AS base

# --- deps stage ---
FROM base AS deps
# Toolchain only needed to compile native modules; kept out of the runner image
RUN apk add --no-cache python3 make g++
WORKDIR /opt/app
COPY package.json yarn.lock ./
# Workspace plugin package.json must exist before yarn install
# so workspace dependencies are hoisted into root node_modules
COPY src/plugins/fontawesome-strapi/package.json ./src/plugins/fontawesome-strapi/package.json
RUN yarn install --frozen-lockfile --network-timeout 600000

# --- builder stage ---
FROM base AS builder
WORKDIR /opt/app
ENV NODE_ENV=production \
    STRAPI_TELEMETRY_DISABLED=true
COPY --from=deps /opt/app/node_modules ./node_modules
COPY . .
RUN yarn build

# --- runner stage ---
FROM base AS runner
WORKDIR /opt/app
ENV NODE_ENV=production \
    STRAPI_TELEMETRY_DISABLED=true \
    HOST=0.0.0.0 \
    PORT=1337
COPY --from=builder --chown=node:node /opt/app ./
# COPY --chown doesn't apply to the WORKDIR itself, and Strapi creates
# database/migrations (and other dirs) under it at startup
RUN mkdir -p database/migrations public/uploads && \
    chown node:node /opt/app && \
    chown -R node:node database public/uploads
USER node
EXPOSE 1337
# Run strapi directly (not via yarn) so SIGTERM reaches the process on redeploys
CMD ["./node_modules/.bin/strapi", "start"]
