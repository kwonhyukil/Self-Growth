# ─────────────────────────────────────────────────────────────────────────────
# Self Growth Log — Frontend (React + Vite)
# Build context: project root  (needed for packages/contracts workspace)
#
#   docker build -f frontend/Dockerfile --target development .
#   docker build -f frontend/Dockerfile --target production  .
# ─────────────────────────────────────────────────────────────────────────────

# ── base: shared system deps ───────────────────────────────────────────────────
# node:22-slim (Debian/glibc) instead of Alpine:
# Alpine uses musl libc → native module binaries compiled for glibc won't load.
# Production stage stays on nginx:1.27-alpine (no Node.js needed there).
FROM node:22-slim AS base
WORKDIR /app

# ── deps: workspace install + rollup native fallback ──────────────────────────
FROM base AS deps

ARG TARGETARCH

# Copy workspace manifests only — keeps this layer cached until deps change
COPY package.json package-lock.json* ./
COPY backend/package.json            ./backend/
COPY frontend/package.json           ./frontend/
COPY packages/contracts/package.json ./packages/contracts/

# npm install (not npm ci) is intentional: npm ci strictly follows the lockfile
# and skips optional packages absent from it. A Windows-generated lockfile omits
# @rollup/rollup-linux-x64-gnu, causing "Cannot find module '@rollup/rollup-*'"
# on Linux. npm install resolves platform-specific optional packages correctly.
#
# Some cached installs still miss Rollup's Linux native optional dependency.
# If that happens, install the matching Linux package explicitly for the
# current build architecture so Vite can bundle inside the container.
RUN npm install \
    && node -e "const fs=require('fs'); const dir='frontend/node_modules/@rollup'; const names=fs.existsSync(dir)?fs.readdirSync(dir):[]; if (!names.some((name)=>name.startsWith('rollup-linux-'))) process.exit(1);" \
    || case "$TARGETARCH" in \
        amd64) npm install --workspace @self-growth/web --no-save @rollup/rollup-linux-x64-gnu ;; \
        arm64) npm install --workspace @self-growth/web --no-save @rollup/rollup-linux-arm64-gnu ;; \
        *) echo "Unsupported TARGETARCH: $TARGETARCH" >&2; exit 1 ;; \
       esac

# ── development: Vite dev server with HMR ─────────────────────────────────────
FROM deps AS development

# Copy sources — in docker-compose dev mode these are overridden by bind mounts.
COPY packages/ ./packages/
COPY frontend/  ./frontend/

WORKDIR /app/frontend

EXPOSE 5174
# --host binds Vite to 0.0.0.0 so the port is reachable outside the container
CMD ["npm", "run", "dev", "--", "--host"]

# ── builder: Vite production build ────────────────────────────────────────────
FROM deps AS builder

COPY packages/ ./packages/
COPY frontend/  ./frontend/

WORKDIR /app/frontend
RUN npm run build

# ── production: Nginx serving static assets ───────────────────────────────────
FROM nginx:1.27-alpine AS production

# Replace default Nginx config with our SPA-aware config
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Copy Vite build output
COPY --from=builder /app/frontend/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
