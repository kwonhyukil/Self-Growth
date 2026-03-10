# ─────────────────────────────────────────────────────────────────────────────
# Self Growth Log — Backend API
# Build context: project root  (needed for packages/contracts workspace)
#
#   docker build -f backend/Dockerfile --target development .
#   docker build -f backend/Dockerfile --target production  .
# ─────────────────────────────────────────────────────────────────────────────

# ── base: shared system deps ───────────────────────────────────────────────────
# node:22-slim (Debian/glibc) avoids native-module issues (bcrypt, Prisma) on
# Alpine musl. Production stage stays on node:22-alpine for a smaller image.
FROM node:22-slim AS base
# openssl: required by Prisma client at runtime
RUN apt-get update && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app

# ── development: hot-reload with ts-node-dev ───────────────────────────────────
FROM base AS development

# Copy workspace manifests only — keeps this layer cached until deps change
COPY package.json package-lock.json* ./
COPY backend/package.json           ./backend/
COPY frontend/package.json          ./frontend/
COPY packages/contracts/package.json ./packages/contracts/

# npm install (not npm ci): resolves platform-specific optional packages that
# may be absent from a Windows-generated lockfile (same reason as frontend).
RUN npm install

# Copy sources — in docker-compose dev mode these are overridden by bind mounts.
# Included here so the image also runs standalone (CI, testing, etc.)
COPY packages/ ./packages/
COPY backend/  ./backend/

WORKDIR /app/backend

# Generate Prisma client from the schema at build time
RUN npx prisma generate

EXPOSE 4000
# Run migrations then start hot-reload dev server
CMD ["sh", "-c", "npx prisma migrate deploy && npm run dev"]

# ── builder: compile TypeScript ────────────────────────────────────────────────
FROM base AS builder

COPY package.json package-lock.json* ./
COPY backend/package.json           ./backend/
COPY frontend/package.json          ./frontend/
COPY packages/contracts/package.json ./packages/contracts/

RUN npm install

COPY packages/ ./packages/
COPY backend/  ./backend/

WORKDIR /app/backend
RUN npx prisma generate && npm run build

# ── production: minimal runtime image ─────────────────────────────────────────
FROM node:22-alpine AS production

# dumb-init: proper PID-1 signal handling; openssl: Prisma runtime requirement
RUN apk add --no-cache openssl dumb-init

ENV NODE_ENV=production
WORKDIR /app

# Install all deps (prisma CLI is a devDep but needed for migrate deploy)
COPY package.json package-lock.json* ./
COPY backend/package.json           ./backend/
COPY frontend/package.json          ./frontend/
COPY packages/contracts/package.json ./packages/contracts/
RUN npm install

# Copy compiled output and Prisma artifacts from builder
COPY --from=builder /app/backend/dist    ./backend/dist
COPY --from=builder /app/backend/prisma  ./backend/prisma
# Overwrite generated Prisma client with the one compiled against the schema
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

WORKDIR /app/backend
EXPOSE 4000

ENTRYPOINT ["dumb-init", "--"]
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
