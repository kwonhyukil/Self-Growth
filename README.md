# Self Growth Log

Self Growth Log는 감정 기록, 일본어 자기표현 연습, AI 피드백, 자기 통찰을 하나의 루프로 묶은 개인 성장 기록 앱입니다.  
사용자는 한국어로 경험을 정리하고, 일본어 문장을 다듬고, AI 질문과 요약을 통해 생각을 더 또렷하게 언어화할 수 있습니다.

## 프로젝트 개요

- 감정 기록 앱과 언어 학습 앱 사이의 간극을 줄이는 것을 목표로 합니다.
- 기록은 단순 보관으로 끝나지 않고, `Feedback Agent`와 `Insight Agent`를 거쳐 다시 성장 지표로 연결됩니다.
- 프론트엔드는 React + Vite, 백엔드는 Express + Prisma, 공통 계약은 `packages/contracts`에서 관리합니다.

## 핵심 기능

| 영역 | 설명 |
| --- | --- |
| 인증 | 회원가입, 로그인, JWT 기반 사용자 인증, 현재 사용자 조회 |
| 로그 기록 | 날짜, 감정 태그, 감정 강도, 사건, 한국어 문장, 일본어 문장을 저장하고 수정/삭제 |
| JaCheck | 일본어 문장을 점검하고 점수, 이슈 목록, rewrite task를 생성 |
| Rewrite | 수정한 문장을 다시 검사하고 이전 결과와 비교 |
| Verbalization | 브레인스토밍, probing question, 답변, AI insight, 언어화 점수까지 이어지는 3단계 흐름 |
| 대시보드/통계 | 로그 수, 최근 7일 기록 수, 감정 분포, 교정 추세, 성장 스냅샷 제공 |
| AI 채팅 | 현재 상태를 바탕으로 다음 행동이나 화면 이동을 제안하는 코치형 채팅 |

## 기술 스택

| 구분 | 사용 기술 |
| --- | --- |
| Frontend | React 18, TypeScript, Vite, React Router, TanStack Query, Tailwind CSS |
| Backend | Node.js, Express, TypeScript, Prisma, Zod, JWT |
| Database | MySQL 8 |
| AI | OpenAI API |
| Workspace | npm Workspaces |
| Infra | Docker Compose, Nginx |

## 저장소 구조

```text
.
├─ backend/               # Express + Prisma API
│  ├─ prisma/             # Prisma schema
│  └─ src/
│     ├─ bootstrap/       # app/router/server 조립
│     ├─ modules/         # auth, logs, ai, stats, health
│     └─ shared/          # 미들웨어, 인프라, 에러 처리
├─ frontend/              # React + Vite 앱
│  └─ src/
│     ├─ app/             # 루트 앱 구성
│     ├─ features/        # auth, logs, growth, stats, ai
│     └─ shared/          # 공통 UI, API 클라이언트, 레이아웃
├─ packages/
│  └─ contracts/          # 프론트/백엔드 공용 타입 계약
└─ docs/                  # 보조 문서
```

## 환경 준비

### 요구 사항

- Node.js 20 이상
- npm 10 이상
- MySQL 8
- Docker Desktop 또는 Docker Engine
- OpenAI API 키

### 환경 파일

| 파일 | 용도 | 주요 값 |
| --- | --- | --- |
| `.env` | 루트 Docker Compose 변수 | `DB_ROOT_PASSWORD`, `DB_NAME` |
| `backend/.env` | 백엔드 런타임 변수 | `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `PORT`, `GPT_MODEL`, `GPT_API_KEY` |
| `backend/.env.test` | 백엔드 테스트 변수 | `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `PORT`, `GPT_MODEL` |

루트 `.env` 예시:

```env
DB_ROOT_PASSWORD=rootpassword
DB_NAME=self_growth_log
```

`backend/.env` 예시:

```env
DATABASE_URL=mysql://root:rootpassword@127.0.0.1:3306/self_growth_log?charset=utf8mb4
JWT_SECRET=change_me_in_production
JWT_EXPIRES_IN=3600
PORT=4000
GPT_MODEL=gpt-4o-mini
GPT_API_KEY=sk-...
```

## 실행 방법

### 1. 공통 준비

의존성 설치:

```bash
npm install
```

### 2. Docker로 실행

Docker 경로는 앱 전체를 한 번에 띄우는 방식입니다. Nginx가 단일 진입점을 제공하고, 내부에서 프론트엔드와 백엔드를 연결합니다.

구성 확인:

```bash
docker compose config
```

전체 서비스 실행:

```bash
docker compose up -d
```

접속 주소:

- 앱: `http://localhost/`
- API: `http://localhost/api/`

구성 요약:

- `db`: MySQL 8
- `backend`: Express + Prisma 개발 서버
- `frontend`: Vite 개발 서버
- `nginx`: 포트 `80`에서 프록시 제공

### 3. 로컬에서 실행

로컬 경로는 백엔드와 프론트엔드를 각각 별도 터미널에서 실행하는 방식입니다.  
이 경로에서는 MySQL이 먼저 준비되어 있어야 하고, `backend/.env`가 올바르게 설정되어 있어야 합니다.

터미널 A, 백엔드:

```bash
npm run dev --workspace @self-growth/api
```

터미널 B, 프론트엔드:

```bash
npm run dev --workspace @self-growth/web
```

접속 주소:

- 프론트엔드: `http://localhost:5174`
- 백엔드: `http://localhost:4000`
- Health check: `http://localhost:4000/api/health`

로컬 실행 메모:

- 프론트엔드 개발 서버는 `/api` 요청을 `http://localhost:4000`으로 프록시합니다.
- Docker 없이 로컬 실행만 할 때는 루트 `.env`보다 `backend/.env`가 더 중요합니다.

## 화면과 사용자 흐름

### 주요 라우트

| 경로 | 설명 |
| --- | --- |
| `/auth` | 로그인/회원가입 |
| `/` | 대시보드, 성장 위젯, AI Workspace, 최근 기록 |
| `/logs` | 로그 목록, 새 로그 작성 |
| `/logs/:id` | 로그 상세, 수정, JaCheck, Rewrite, Verbalization |
| `/stats` | 감정 분포, 교정 추세, 요약 통계 |

### 기본 흐름

```mermaid
flowchart TD
    A["로그 작성"] --> B["일본어 문장 입력 또는 초안 생성"]
    B --> C["JaCheck 실행"]
    C --> D["Rewrite로 문장 다듬기"]
    A --> E["Verbalization 시작"]
    E --> F["Brainstorm + Probing Question"]
    F --> G["답변 제출"]
    G --> H["AI Insight + 언어화 점수"]
    D --> I["Growth Snapshot 갱신"]
    H --> I
    I --> J["대시보드와 통계에 반영"]
```

## 시스템 구조

### 아키텍처 요약

```mermaid
flowchart LR
    U["User"] --> F["Frontend (React + Vite)"]
    F --> B["Backend (Express + Prisma)"]
    B --> D["MySQL"]
    B --> O["OpenAI API"]
    F -. 공통 타입 .-> C["packages/contracts"]
    B -. 공통 타입 .-> C
```

### 구현 포인트

- 백엔드는 `backend/src/bootstrap/app.ts`에서 `/api` 루트를 구성합니다.
- 루트 라우터는 `auth`, `health`, `logs`, `ai`, `stats`, `revisions` 모듈을 연결합니다.
- 프론트엔드는 `frontend/src/app/App.tsx`에서 인증 페이지와 보호된 라우트를 분리합니다.
- 공통 타입은 `packages/contracts/src/*`에 모여 있어 API 응답 형태와 도메인 타입을 프론트/백엔드가 함께 사용합니다.

## 데이터 모델

| 모델 | 역할 |
| --- | --- |
| `User` | 사용자 계정 |
| `GrowthLog` | 감정 기록, 사건, 한국어/일본어 문장 저장 |
| `JaCheckResult` | 일본어 점검 결과와 이슈 목록 저장 |
| `JaRevision` | rewrite 전후 비교 결과 저장 |
| `VerbalizationSession` | brainstorm, 질문, 답변, insight, 점수 저장 |
| `UserGrowthSnapshot` | 성장 지표와 반려견 상태 요약 |

성장 스냅샷은 다음 축을 기반으로 계산됩니다.

- `vocabulary`
- `grammarAccuracy`
- `consistency`
- `positivity`
- `revisionEffort`
- `verbalizationClarity`

## API 개요

모든 API는 `/api` 아래에 구성됩니다.

### Auth

| Method | Path | 설명 |
| --- | --- | --- |
| `POST` | `/api/auth/signup` | 회원가입 |
| `POST` | `/api/auth/login` | 로그인 |
| `GET` | `/api/auth/me` | 현재 사용자 조회 |

### Logs

| Method | Path | 설명 |
| --- | --- | --- |
| `POST` | `/api/logs` | 로그 생성 |
| `GET` | `/api/logs` | 로그 목록 조회 |
| `GET` | `/api/logs/:id` | 로그 상세 조회 |
| `PATCH` | `/api/logs/:id` | 로그 수정 |
| `DELETE` | `/api/logs/:id` | 로그 삭제 |
| `POST` | `/api/logs/:id/draft-ja` | 일본어 초안 생성 |

### JaCheck / Rewrite / Verbalization

| Method | Path | 설명 |
| --- | --- | --- |
| `POST` | `/api/logs/:id/check-ja` | JaCheck 실행 |
| `GET` | `/api/logs/:id/check-ja/latest` | 최신 JaCheck 결과 |
| `GET` | `/api/logs/:id/check-ja/results` | JaCheck 결과 목록 |
| `GET` | `/api/logs/check-ja/results/:resultId` | JaCheck 상세 |
| `GET` | `/api/logs/:id/revisions` | rewrite 이력 |
| `POST` | `/api/logs/:id/rewrite-ja` | 수정 문장 제출 후 재검사 |
| `GET` | `/api/logs/:id/verbalize` | 언어화 세션 조회 |
| `POST` | `/api/logs/:id/verbalize/brainstorm` | 브레인스토밍 시작 |
| `POST` | `/api/logs/:id/verbalize/probe-answer` | probing answer 제출 |

### AI / Stats

| Method | Path | 설명 |
| --- | --- | --- |
| `POST` | `/api/ai/chat` | 코치형 채팅 |
| `POST` | `/api/ai/feedback/logs/:id` | 로그 기반 피드백 실행 |
| `GET` | `/api/stats/summary` | 요약 통계 |
| `GET` | `/api/stats/dashboard` | 대시보드 데이터 |
| `GET` | `/api/stats/mood-count` | 감정 분포 |
| `GET` | `/api/stats/last-7days` | 최근 7일 기록 수 |
| `GET` | `/api/stats/ja-improvement` | JaCheck 개선 추세 |
| `GET` | `/api/stats/growth` | 성장 스냅샷 |
| `POST` | `/api/stats/growth/refresh` | 성장 스냅샷 강제 갱신 |

## 테스트와 검증

전체 빌드:

```bash
npm run build
```

백엔드 테스트:

```bash
npm test
```

테스트 메모:

- 루트 `npm test`는 `backend` 워크스페이스 테스트를 실행합니다.
- 테스트 스크립트는 `backend/.env.test`를 기준으로 테스트 DB를 만들고, Prisma reset 후 Jest를 실행합니다.
- 기본 테스트 DB 이름은 `self_growth_log_test`입니다.
- 테스트 전에 MySQL이 `127.0.0.1:3306`에서 실행 중이어야 합니다.
- Docker Desktop이 켜져 있다면 아래 명령으로 테스트용 MySQL을 먼저 띄울 수 있습니다.

```bash
docker compose -f backend/docker-compose.yml up -d mysql
```

## 운영 메모

- OpenAI API 키가 없으면 JaCheck, Insight, 채팅 계열 기능은 정상 동작하지 않습니다.
- 로컬 개발 경로에서는 MySQL 연결 문자열이 `backend/.env`의 `DATABASE_URL`과 일치해야 합니다.
- Docker 경로에서는 Nginx가 외부 진입점이고, 백엔드 `4000`, 프론트엔드 `5174` 포트는 컨테이너 내부에서 사용됩니다.
