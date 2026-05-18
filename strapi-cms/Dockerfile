FROM node:24-alpine AS base
RUN apk add --no-cache python3 make g++

# --- deps stage ---
FROM base AS deps
WORKDIR /opt/app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# --- builder stage ---
FROM base AS builder
WORKDIR /opt/app
COPY --from=deps /opt/app/node_modules ./node_modules
COPY . .
ENV NODE_ENV=production
RUN npm run build

# --- runner stage ---
FROM base AS runner
WORKDIR /opt/app
ENV NODE_ENV=production
COPY --from=builder /opt/app/node_modules ./node_modules
COPY --from=builder /opt/app/dist ./dist
COPY --from=builder /opt/app/.strapi ./.strapi
COPY --from=builder /opt/app/src ./src
COPY --from=builder /opt/app/config ./config
COPY --from=builder /opt/app/public ./public
COPY --from=builder /opt/app/package.json ./package.json
RUN mkdir -p /opt/app/public/uploads
EXPOSE 1337
CMD ["npm", "run", "start"]
