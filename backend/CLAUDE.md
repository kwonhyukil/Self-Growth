# Backend — Self Growth Log

> Node.js + Express + TypeScript REST API with MySQL / Prisma ORM.

---

## Monorepo Location

```
<project-root>/
├── backend/   ← you are here
└── frontend/
```

---

## Quick Start

```bash
# From backend/
cp .env.example .env        # fill in DATABASE_URL, JWT_SECRET, GPT_MODEL …
npm install
npx prisma migrate dev      # run migrations
npm run dev                 # ts-node-dev on http://localhost:4000
```

### Docker (full stack)

```bash
# From backend/
docker-compose up           # MySQL + API

# From project root
docker-compose -f backend/docker-compose.yml up
```

---

## Directory Structure

```
backend/
├── src/
│   ├── app.ts                  Express app (middleware, routes)
│   ├── server.ts               Entry point (port 4000)
│   ├── controllers/            Route handlers
│   ├── services/               Business logic
│   ├── routes/                 Express routers
│   ├── middlewares/            Auth, validation, rate-limit, error
│   ├── validators/             Zod schemas (request validation)
│   └── utils/                  AppError, JWT, Prisma client, GPT helper
├── prisma/
│   ├── schema.prisma           DB models (User, GrowthLog, JaCheckResult, JaRevision)
│   └── migrations/
├── Dockerfile
├── docker-compose.yml
├── package.json
├── tsconfig.json
└── jest.config.js
```

---

## Key API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/signup` | — | Register |
| POST | `/api/auth/login` | — | Login → JWT |
| GET | `/api/logs` | ✓ | List growth logs |
| POST | `/api/logs` | ✓ | Create log |
| GET | `/api/logs/:id` | ✓ | Get log detail |
| PATCH | `/api/logs/:id` | ✓ | Update log |
| DELETE | `/api/logs/:id` | ✓ | Delete log |
| POST | `/api/logs/:id/check-ja` | ✓ | AI Japanese feedback |
| GET | `/api/logs/:id/check-ja/latest` | ✓ | Latest check result |
| POST | `/api/logs/:id/rewrite-ja` | ✓ | Submit revised text |
| GET | `/api/logs/:id/revisions` | ✓ | Revision history |
| GET | `/api/stats/summary` | ✓ | Dashboard summary |
| GET | `/api/stats/dashboard` | ✓ | Coach insights |
| GET | `/api/stats/ja-improvement` | ✓ | Improvement trend |

All success responses: `{ "data": { … } }`
All error responses: `{ "error": { "code": "…", "message": "…" } }`

---

## Environment Variables

```env
DATABASE_URL=mysql://user:pass@localhost:3306/self_growth_log?charset=utf8mb4
JWT_SECRET=change_me_in_production
JWT_EXPIRES_IN=3600
GPT_MODEL=gpt-4.1-mini
PORT=4000
```

For tests create `.env.test` with a separate DB URL.

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with hot-reload |
| `npm run build` | Compile TypeScript → `dist/` |
| `npm start` | Run compiled `dist/server.js` |
| `npm test` | Reset test DB + run Jest e2e suite |
| `npx prisma studio` | Open Prisma GUI |
| `npx prisma migrate dev` | Create & apply new migration |

---

## Business Rules to Respect

- **Japanese text**: 20–200 Unicode characters (enforced in `JA_CHECK` config and `JaRewriteSchema`)
- **AI check rate limit**: 10 requests / 60 seconds per user
- **JWT**: Bearer token in `Authorization` header; expires per `JWT_EXPIRES_IN`
- **Mood tags**: `JOY | PROUD | GRATEFUL | RELIEVED | EXCITED | CALM | CONFIDENT | MOTIVATED | CONNECTED | HOPEFUL`
- **Issue severity**: `low | medium | high`; max 6 issues per check
