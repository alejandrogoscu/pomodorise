
FROM node:20-alpine AS builder

WORKDIR /app


RUN corepack enable && corepack prepare pnpm@10.21.0 --activate


COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY tsconfig.base.json ./
COPY tsconfig.json ./
COPY packages/shared/package.json packages/shared/
COPY packages/backend/package.json packages/backend/


RUN pnpm install --frozen-lockfile


COPY packages ./packages


RUN pnpm -F @pomodorise/shared run clean && pnpm -F @pomodorise/backend run clean


RUN pnpm exec tsc -b --clean


RUN pnpm exec tsc -b packages/shared
RUN ls -l /app/packages/shared/dist
RUN pnpm exec tsc -b packages/backend
RUN ls -l /app/packages/backend/dist


FROM node:20-alpine

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.21.0 --activate


COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/backend/dist ./dist
COPY --from=builder /app/packages/backend/package.json ./
COPY --from=builder /app/packages/shared ./packages/shared


RUN CI=true pnpm install --prod --filter @pomodorise/backend...

RUN echo "Contenido de /app/dist en imagen final:" && ls -l /app/dist

ENV NODE_ENV=production
ENV PORT=4000

EXPOSE 4000

CMD ["node", "dist/index.js"]