# Multi-Stage Dockerfile for LifeOS Goals Engine & AI Platform

# --- Stage 1: Dependencies ---
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# --- Stage 2: Builder ---
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Build static React SPA frontend into /app/dist
RUN npm run build

# --- Stage 3: Production Runner ---
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5001

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy production frontend build and backend source code
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server

EXPOSE 5001

# Run server using tsx runner
CMD ["npx", "tsx", "server/index.ts"]
