FROM node:22.16.0-slim AS base

RUN apt-get update && apt-get install -y openssl

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME/bin:$PATH"

RUN npm install -g corepack@latest
RUN corepack enable
COPY package.json package.json
RUN corepack install
RUN rm package.json

FROM base AS prepare

WORKDIR /app

RUN pnpm install -g turbo@^2.9.15
COPY . .
RUN turbo prune sales-extension-backend --docker --out-dir sales-extension-backend-out

FROM base AS builder
WORKDIR /app

COPY --from=prepare /app/sales-extension-backend-out/json/ .
RUN pnpm install --frozen-lockfile

COPY --from=prepare /app/sales-extension-backend-out/full/ .

RUN pnpm turbo build

FROM base AS runner

WORKDIR /app
COPY --from=builder /app .

ENTRYPOINT [ "pnpm", "run", "--filter", "sales-extension-backend", "start" ]