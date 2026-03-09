# CLAUDE.md

## Project Overview

Self-Growth is a monorepo with backend, frontend, and shared TypeScript contracts.

### Workspace Structure

- `backend/` — Express + Prisma + MySQL API
- `frontend/` — React + Vite web app
- `packages/contracts/` — shared TypeScript contracts used by backend and frontend

---

## Non-Negotiable Rules

These rules must always be followed when generating or editing code in this repository.

1. All new implementation files must use the `.impl.ts` or `.impl.tsx` suffix.
2. Do not instantiate `PrismaClient` directly. Always import the shared `prisma` instance.
3. All API success responses must use `{ data: T }`.
4. All API failure responses must use `{ error: { code, message, details? } }`.
5. Controllers must stay thin. Business logic belongs in services.
6. Request validation must be defined with Zod schema files and chained as middleware.
7. If a shared contract already exists, do not redefine the type locally.
8. Frontend API calls must use the shared Axios client. Do not use raw `fetch`.
9. Expected business errors must use `AppError`. Do not throw raw `Error` for normal application cases.
10. Prefer existing shared utilities over creating new ad hoc helpers.

---

## File Naming Convention

### Backend

- `*.router.impl.ts` — Express router
- `*.controller.impl.ts` — thin HTTP handler
- `*.service.impl.ts` — business logic
- `*.schema.impl.ts` — Zod schema + inferred types

### Frontend

- `*.impl.tsx` — React component
- `*.impl.ts` — non-component module such as api, queries, lib, hooks, utils

Do not create implementation files without the `.impl.*` suffix.

---

## Backend Architecture Rules

### Router

Routers should:

- define routes
- chain validation middleware
- call controllers

Routers should not contain business logic.

### Controller

Controllers should:

- read params/body/query
- call service layer
- return standardized response with shared helpers

Controllers must remain thin.

### Service

Services should:

- contain business logic
- coordinate database access
- coordinate GPT calls
- throw `AppError` for expected failures

### Schema

Schema files should:

- define Zod request schemas
- export inferred request types when useful

All request body validation should be centralized in `*.schema.impl.ts`.

---

## Shared Utilities

### Backend Shared Utilities

#### `backend/src/shared/http/response.impl.ts`

Use these response helpers for all controllers:

- `ok(res, data, status?)` → success response as `{ data: T }`
- `fail(res, code, msg, status?, details?)` → failure response when `AppError` is not thrown

#### `backend/src/shared/errors/AppError.impl.ts`

Use:

- `throw new AppError(status, code, message, details?)`

Use `AppError` for expected domain/application errors.

#### `backend/src/shared/http/validate.middleware.impl.ts`

Use:

- `validateBody(zodSchema)`

Attach it in router chains for request body validation.

#### `backend/src/shared/infra/gpt.impl.ts`

Use:

- `callGptStructuredJson<T>({ model, prompt, schemaName, schema, maxOutputTokens })`

This is the standard GPT entry point.
It already handles:

- retry up to 3 times
- 25 second timeout
- JSON Schema based structured output

Do not create separate raw GPT call flows unless explicitly required.

#### `backend/src/shared/infra/prisma.impl.ts`

Use:

- `prisma`

Always import this shared client.
Never call `new PrismaClient()` inside feature modules.

---

### Frontend Shared Utilities

#### `frontend/src/shared/api/client.impl.ts`

Use:

- `api` — shared Axios instance
- `getToken()`
- `setToken(token)`
- `clearToken()`
- `AppError` — client-side normalized error shape

Responsibilities of `api`:

- automatic JWT attachment
- error mapping
- centralized interceptor behavior

Do not use raw `fetch` for normal frontend API access.

---

## API Response Format

### Success

```ts
{
  data: T;
}
```

---

## 8️⃣ Commit Convention

맨 아래쪽에 두는 게 가장 적절합니다.

```md
---

## Commit Convention

Use Conventional Commits for all commit messages.

Format:

- `type(scope): summary`

Examples:

- `feat(auth): add login endpoint`
- `fix(logs): handle empty growth log content`
- `refactor(shared): extract response helpers`
- `docs(root): update CLAUDE.md rules`
- `test(auth): add login e2e test`

### Allowed Types

- `feat`
- `fix`
- `refactor`
- `docs`
- `test`
- `chore`
- `style`
- `perf`
- `build`
- `ci`

### Scope Examples

- `auth`
- `logs`
- `ja-check`
- `growth`
- `revision`
- `verbalization`
- `shared`
- `frontend`
- `backend`
- `contracts`
- `root`

Rules:

1. Keep commit summaries short and specific.
2. Prefer English commit messages.
3. Do not use vague messages such as `update`, `fix`, or `changes`.
4. One commit should represent one logical change when possible.
```
