# Stage 1 – deps
FROM node:22-alpine AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json ./
RUN npm ci

# Stage 2 – builder
# NEXT_PUBLIC_* são embutidas no bundle do cliente no build.
# Variáveis só de servidor (KONTAL_API_URL) entram em runtime e não são necessárias aqui.
FROM node:22-alpine AS builder
WORKDIR /app
RUN apk add --no-cache libc6-compat
ENV NEXT_TELEMETRY_DISABLED=1

ARG NEXT_PUBLIC_PRESENCIA_URL
ENV NEXT_PUBLIC_PRESENCIA_URL=$NEXT_PUBLIC_PRESENCIA_URL

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Stage 3 – runner
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN apk add --no-cache curl
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
