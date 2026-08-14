# ─────────────────────────────────────────────────────────────────
# Dockerfile — Root Dockerfile for Dokploy Single Application Deployment
# ─────────────────────────────────────────────────────────────────

FROM node:22-alpine AS builder
RUN npm install -g pnpm@9.15.4
WORKDIR /app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* .npmrc ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
COPY workers/package.json ./workers/

RUN pnpm install --no-frozen-lockfile

COPY packages/shared ./packages/shared
COPY apps/web ./apps/web
COPY tsconfig.json ./

RUN pnpm --filter shared build

ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm --filter web build

FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/apps/web/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static

USER nextjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/', r => process.exit(r.statusCode === 200 || r.statusCode === 307 || r.statusCode === 302 ? 0 : 1)).on('error', () => process.exit(1))" || exit 1

CMD ["node", "apps/web/server.js"]
