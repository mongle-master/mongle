# syntax=docker/dockerfile:1
FROM node:22-bookworm-slim AS base
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/* \
    && corepack enable \
    && corepack prepare pnpm@10.30.1 --activate
WORKDIR /app

FROM base AS dependencies
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma
RUN pnpm install --frozen-lockfile

FROM dependencies AS build
COPY nest-cli.json tsconfig.json tsconfig.build.json ./
COPY src ./src
RUN pnpm prisma:generate && pnpm build

FROM base AS production-dependencies
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma
RUN pnpm install --prod --frozen-lockfile && pnpm prisma:generate

FROM node:22-bookworm-slim AS runtime
ENV NODE_ENV=production
ENV TZ=Asia/Seoul
RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=production-dependencies /app/node_modules ./node_modules
COPY --from=production-dependencies /app/package.json ./package.json
COPY --from=production-dependencies /app/prisma ./prisma
COPY --from=build /app/dist ./dist
EXPOSE 8080
CMD ["sh", "-c", "./node_modules/.bin/prisma migrate deploy && exec node dist/main.js"]
