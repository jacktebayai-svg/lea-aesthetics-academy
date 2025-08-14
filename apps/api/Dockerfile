# syntax=docker/dockerfile:1
FROM node:20-alpine AS base
WORKDIR /app

# Install core deps
RUN apk add --no-cache libc6-compat

# PNPM
RUN corepack enable && corepack prepare pnpm@9.4.0 --activate

# Copy workspace manifests
COPY ../../pnpm-lock.yaml ../../pnpm-workspace.yaml ../../package.json ./

# Copy API app and packages needed at build time
COPY . ./apps/api

# Install only API dependencies using filter
RUN pnpm install --filter api... --frozen-lockfile

# Build API
RUN pnpm --filter api build

# Runtime image
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

# Copy built dist and node_modules for the API only
COPY --from=base /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=base /app/apps/api/dist ./apps/api/dist
COPY --from=base /app/apps/api/package.json ./apps/api/package.json

# Expose port
EXPOSE 3333

# Start
CMD ["node", "apps/api/dist/main.js"]
