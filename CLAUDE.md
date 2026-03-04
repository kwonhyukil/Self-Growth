# CLAUDE.md

## Project Overview

Self Growth Log API — a coaching-style backend for Japanese language practice.
Implements a "Record → Feedback → Rewrite → Growth" learning loop using OpenAI for feedback generation.

## Tech Stack

- **Runtime:** Node.js + TypeScript (ES2019 → CommonJS, compiled to `./dist`)
- **Framework:** Express.js
- **ORM:** Prisma (MySQL via Docker)
- **Auth:** JWT + bcrypt
- **Validation:** Zod
- **AI:** OpenAI API (via axios in `src/utils/gpt.ts`)
- **Testing:** Jest + ts-jest + Supertest (E2E only)

## Development

### Start dev server

```bash
docker-compose up        # Start MySQL + API with hot reload
```

### Run without Docker

```bash
npm run dev              # ts-node-dev (requires a running MySQL instance)
```

### Build

```bash
npm run build            # tsc → ./dist
npm start                # Run compiled output
```

### Testing

```bash
npm test                 # Resets test DB then runs jest
npm run prisma:test:reset  # Reset test DB only
```

## Architecture

```
src/
├── server.ts            # Entry point
├── app.ts               # Express app setup, middleware registration
├── routes/              # Route definitions (auth, logs, stats, health, revision)
├── controllers/         # Thin HTTP handlers — delegate to services
├── services/            # Business logic (auth, jaCheck, logs, stats + Zod schemas)
├── middlewares/         # auth, error, rateLimit, requestLog, validate
├── validators/          # Zod input schemas (logs, rewrite)
└── utils/               # AppError, jwt, gpt (OpenAI), prisma client, response helpers
prisma/
├── schema.prisma        # DB schema: users, growth_logs, ja_check_results, ja_revisions
└── migrations/          # 3 migrations (init, add_user_name, add_ja_revision)
```

## Key Conventions

- **Layered architecture:** Routes → Controllers → Services → Prisma. Controllers stay thin.
- **Error handling:** Throw `AppError` (from `src/utils/errors.ts`) for all known errors; the error middleware catches them.
- **Responses:** Use the standardized response helpers in `src/utils/response.ts`.
- **Validation:** Zod schemas live in `src/validators/` and `src/services/*Schema.ts`; applied via the `validate` middleware.
- **Auth:** `authMiddleware` in `src/middlewares/auth.ts` attaches `req.user` (JWT payload).
- **Database:** All DB access goes through the shared Prisma client in `src/utils/prisma.ts`.

## Environment Variables

Required in `.env` (not committed):

- `DATABASE_URL` — MySQL connection string
- `JWT_SECRET` — JWT signing secret
- `OPENAI_API_KEY` — OpenAI API key
- `PORT` — Server port (default 3000)

## Main API Endpoints

| Method   | Path                   | Description                |
| -------- | ---------------------- | -------------------------- |
| POST     | `/auth/signup`         | Register user              |
| POST     | `/auth/login`          | Login, receive JWT         |
| GET/POST | `/logs`                | Read/create growth logs    |
| POST     | `/logs/:id/check-ja`   | AI Japanese coaching check |
| POST     | `/logs/:id/rewrite-ja` | Submit rewrite             |
| GET      | `/stats/summary`       | Dashboard stats            |
| GET      | `/health`              | Health check               |

## Collaboration Guidelines

- **Intent Clarification:** If a request is ambiguous, ask for clarification before generating code.
- **Code Style:** Always follow the defined layered architecture. Do not skip the Service layer for DB access.
- **Language:** For Japanese language-related logic, ensure the feedback (GPT) follows the "Record → Feedback → Rewrite" flow.
- **Self-Correction:** After providing an answer, evaluate the user's input and provide a summary (as requested by the user).
