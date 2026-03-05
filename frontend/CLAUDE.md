# Frontend — Self Growth Log

> React 18 + TypeScript + Vite + Tailwind CSS coaching dashboard.

---

## Monorepo Location

```
<project-root>/
├── backend/
└── frontend/  ← you are here
```

---

## Quick Start

```bash
# From frontend/
npm install
npm run dev     # Vite dev server → http://localhost:3000
                # /api requests are proxied to http://localhost:4000
```

> The backend must be running on port 4000 for API calls to work.
> See `../backend/CLAUDE.md` for backend setup.

---

## Directory Structure

```
frontend/
├── src/
│   ├── App.tsx                 Root component, React Router, QueryClient
│   ├── main.tsx                Entry point
│   ├── index.css               Tailwind base + custom scrollbar
│   ├── types/
│   │   └── index.ts            TypeScript types (mirrors Prisma schema + Zod validators)
│   ├── api/
│   │   ├── client.ts           Axios instance (JWT interceptor, AppError mapping)
│   │   ├── auth.ts             /auth endpoints
│   │   ├── logs.ts             /logs CRUD
│   │   ├── jaCheck.ts          /check-ja, /rewrite-ja, /revisions
│   │   └── stats.ts            /stats summary, dashboard, ja-improvement
│   ├── hooks/
│   │   ├── useAuth.ts          TanStack Query auth hooks
│   │   ├── useLogs.ts          TanStack Query log hooks
│   │   ├── useJaCheck.ts       TanStack Query AI feedback hooks
│   │   └── useStats.ts         TanStack Query stats hooks
│   ├── contexts/
│   │   └── AuthContext.tsx     JWT persistence, login/signup/logout
│   ├── components/
│   │   ├── layout/             Layout, Header, Sidebar
│   │   ├── ui/                 Button, Input, Textarea, Badge, Modal, Spinner
│   │   ├── logs/               LogCard, LogForm
│   │   ├── jaCheck/            JaCheckPanel, IssueCard, ScoreBadge
│   │   ├── revision/           RewritePanel, RevisionHistory
│   │   └── stats/              SummaryCards, MoodDistribution, TrendChart
│   ├── pages/
│   │   ├── AuthPage.tsx        Login / Signup
│   │   ├── DashboardPage.tsx   Overview + coach insights
│   │   ├── LogsPage.tsx        Growth log timeline
│   │   ├── LogDetailPage.tsx   Record → Feedback → Rewrite loop
│   │   └── StatsPage.tsx       Stats + JA improvement charts
│   └── utils/
│       ├── constants.ts        Mood/severity/rule-tag labels & colours
│       └── formatters.ts       dayjs date helpers, score colours
├── index.html
├── vite.config.ts              Dev proxy: /api → localhost:4000
├── tailwind.config.js
├── tsconfig.app.json
└── package.json
```

---

## Tech Stack

| Concern | Library |
|---------|---------|
| Build | Vite 6 |
| UI | React 18 + TypeScript |
| Styling | Tailwind CSS 3 |
| Server state | TanStack Query (React Query) v5 |
| HTTP client | Axios (centralized in `src/api/client.ts`) |
| Routing | React Router v6 |
| Date formatting | dayjs |

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Vite dev server with HMR on port 3000 |
| `npm run build` | TypeScript check + Vite production build → `dist/` |
| `npm run preview` | Preview the production build locally |

---

## Key Conventions

- **JWT**: stored in `localStorage` under key `sg_access_token`; attached via Axios request interceptor
- **Error handling**: API errors are mapped to `AppError` (typed `{code, status, message}`) in the response interceptor; cleared token on 401
- **Type sync**: all types in `src/types/index.ts` must stay in sync with backend Prisma schema and Zod validators
- **JA text constraints**: 20–200 characters enforced client-side in `LogForm` and `RewritePanel`
- **Cache keys**: query keys are defined alongside their hooks; mutations invalidate related keys

---

## TODO / Future Guidance

- [ ] Add ESLint + Prettier config
- [ ] Add unit tests (Vitest + React Testing Library)
- [ ] Add loading skeletons for timeline view
- [ ] Internationalisation (i18n) for Korean/Japanese UI labels
- [ ] PWA support (offline log drafts)
