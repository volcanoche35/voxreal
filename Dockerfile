# VoxReal — Multi-stage Dockerfile
# Build: production Next.js app
# Run: minimal Node.js runtime

# ---- Build Stage ----
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies (separate for layer caching)
COPY package.json package-lock.json ./
RUN npm ci --only=production && \
    npm ci --only=development

# Copy source
COPY . .

# Build
RUN npm run build

# ---- Production Stage ----
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy standalone output
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

CMD ["node", "server.js"]
