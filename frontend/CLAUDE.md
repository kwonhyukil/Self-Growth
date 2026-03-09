# Frontend CLAUDE.md

## Overview

React 18 + TypeScript + Vite frontend for Self Growth Log.

## Directory Structure

```text
frontend/src/
  app/
    App.tsx
    main.tsx
  features/
    auth/
    growth/
    logs/
      ja-check/
      verbalization/
    stats/
  shared/
    api/
      client.impl.ts
    ui/
    layout/
    lib/
  styles/
  types/
```

## Key Paths

- App entry: `src/app/main.tsx`
- Root app composition: `src/app/App.tsx`
- Shared HTTP client: `src/shared/api/client.impl.ts`
- Shared contracts re-export: `src/types/index.ts`

## Conventions

- Feature implementation files use `*.impl.ts` or `*.impl.tsx`.
- Public feature entrypoints re-export from their local `*.impl` files.
- Shared UI and layout are imported from `@/shared/*`.
- Feature pages/components/hooks/api are imported from `@/features/*`.
- Do not recreate old `src/api`, `src/hooks`, or `src/pages` wrapper layers.
