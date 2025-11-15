# =========================================
# Dockerfile para PomodoRise Backend
# Teacher note:
# - Multi-stage build para eficiencia y seguridad
# - Usa pnpm y Node 20
# - Compila shared y backend en orden
# - Solo copia artefactos necesarios a la imagen final
# =========================================

# Etapa 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Instala pnpm globalmente
RUN corepack enable && corepack prepare pnpm@10.21.0 --activate

# Copia archivos de configuración y dependencias primero (mejor cache)
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY tsconfig.base.json ./
COPY tsconfig.json ./
COPY packages/shared/package.json packages/shared/
COPY packages/backend/package.json packages/backend/

# Instala dependencias del monorepo (incluye devDependencies para build)
RUN pnpm install --frozen-lockfile

# Copia el código fuente necesario
COPY packages ./packages

# Limpia artefactos previos antes de compilar
RUN pnpm -F @pomodorise/shared run clean && pnpm -F @pomodorise/backend run clean

# Limpia artefactos TS build incremental
RUN pnpm exec tsc -b --clean

# Compila shared y backend en orden
RUN pnpm exec tsc -b packages/shared
RUN ls -l /app/packages/shared/dist
RUN pnpm exec tsc -b packages/backend
RUN ls -l /app/packages/backend/dist

# Etapa 2: Imagen final
FROM node:20-alpine

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.21.0 --activate

# Copia sólo lo necesario
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/backend/dist ./dist
COPY --from=builder /app/packages/backend/package.json ./
COPY --from=builder /app/packages/shared ./packages/shared

# Instala sólo dependencias de producción del backend y sus dependencias internas
RUN CI=true pnpm install --prod --filter @pomodorise/backend...

ENV NODE_ENV=production
ENV PORT=4000

EXPOSE 4000

CMD ["node", "dist/index.js"]