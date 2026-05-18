FROM node:24-alpine AS base
RUN apk add --no-cache python3 make g++

# --- deps stage ---
FROM base AS deps
WORKDIR /opt/app
COPY package.json yarn.lock ./
# Workspace plugin package.json must exist before yarn install
# so workspace dependencies are hoisted into root node_modules
COPY src/plugins/fontawesome-strapi/package.json ./src/plugins/fontawesome-strapi/package.json
RUN yarn install --frozen-lockfile

# --- builder stage ---
FROM base AS builder
WORKDIR /opt/app
ENV NODE_ENV=production
COPY --from=deps /opt/app/node_modules ./node_modules
COPY . .
RUN yarn build

# --- runner stage ---
FROM base AS runner
WORKDIR /opt/app
ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=1337
COPY --from=builder /opt/app/node_modules ./node_modules
COPY --from=builder /opt/app/.strapi ./.strapi
COPY --from=builder /opt/app/src ./src
COPY --from=builder /opt/app/config ./config
COPY --from=builder /opt/app/public ./public
COPY --from=builder /opt/app/package.json ./package.json
RUN mkdir -p /opt/app/public/uploads
EXPOSE 1337
CMD ["yarn", "start"]
