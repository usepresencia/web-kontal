FROM node:20-alpine AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS dev
COPY --from=deps /app/node_modules ./node_modules
COPY . .
EXPOSE 3002
# Polling para o hot reload funcionar com volume montado no container
ENV WATCHPACK_POLLING=true
CMD ["npx", "next", "dev", "-H", "0.0.0.0", "-p", "3002"]

FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV SKIP_ENV_VALIDATION=1
RUN npm run build

FROM base AS runner
ENV NODE_ENV=production
RUN addgroup -S app && adduser -S app -G app
COPY --from=build --chown=app:app /app/.next ./.next
COPY --from=build --chown=app:app /app/package.json ./package.json
COPY --from=deps --chown=app:app /app/node_modules ./node_modules
USER app
EXPOSE 3002
CMD ["npx", "next", "start", "-p", "3002"]
