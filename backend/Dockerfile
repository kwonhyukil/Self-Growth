# ─────────────────────────────────────────────────────────────────────────────
# Self Growth Log — Backend API
# Build context: ./backend/  (set in docker-compose.yml)
# ─────────────────────────────────────────────────────────────────────────────
FROM node:22-alpine

WORKDIR /app

# Install dependencies first for better layer caching
COPY package*.json ./
COPY prisma ./prisma

RUN npm install

# Copy the rest of the backend source
COPY . .

# Generate Prisma client
RUN npx prisma generate

EXPOSE 3000

CMD ["npm", "run", "dev"]
