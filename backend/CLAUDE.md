# Backend CLAUDE.md

## Overview

Express + TypeScript + Prisma backend for Self Growth Log.

## Directory Structure

```text
backend/src/
  bootstrap/
    app.ts
    router.ts
    server.ts
  modules/
    auth/
    health/
    logs/
      ja-check/
      verbalization/
    stats/
      growth/
  shared/
    http/
    infra/
    errors/
    config/
  __tests__/
```

## Key Paths

- App bootstrap: `src/bootstrap/app.ts`
- Root router: `src/bootstrap/router.ts`
- Shared middleware: `src/shared/http/*.ts`
- Shared infra: `src/shared/infra/*.ts`
- Module implementations: `src/modules/**/**/*.impl.ts`

## Conventions

- Keep route/controller/service boundaries inside each module.
- Import Prisma through `src/shared/infra/prisma.ts`.
- Import JWT helper through `src/shared/infra/jwt.ts`.
- Import OpenAI helper through `src/shared/infra/gpt.ts`.
- Use `src/shared/http/response.ts` for success responses.
- Use `src/shared/errors/AppError.ts` for known application errors.
- Do not recreate old `src/controllers`, `src/routes`, `src/services`, `src/validators`, `src/middlewares`, or `src/utils` layers.

## Testing

```bash
docker compose -f backend/docker-compose.yml up -d mysql
npm test
```

- Tests use `backend/.env.test`.
- `npm test` prepares `self_growth_log_test`, resets Prisma migrations, then runs Jest.
