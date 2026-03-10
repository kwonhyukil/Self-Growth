# Self Growth Log

Self Growth Log는 일본어 학습과 자기 성찰을 연결해, 기록 -> 언어화 -> 피드백 -> 교정 -> 성장의 루프를 만드는 개인 성장 지원 시스템입니다.

---

## 빠른 시작

### 실행 환경

- Node.js 20+
- npm 10+
- Docker Desktop 또는 로컬 MySQL 8

### 필수 환경 변수

백엔드는 `backend/.env`를 기준으로 동작합니다.

| Key              | 설명                             |
| ---------------- | -------------------------------- |
| `DATABASE_URL`   | MySQL 연결 문자열                |
| `JWT_SECRET`     | JWT 서명 키                      |
| `JWT_EXPIRES_IN` | JWT 만료 시간(초)                |
| `PORT`           | 백엔드 포트, 기본값 `4000`       |
| `GPT_MODEL`      | JaCheck / 언어화에 사용하는 모델 |
| `GPT_API_KEY`    | OpenAI API 키                    |

예시:

```env
DATABASE_URL=mysql://root:rootpassword@localhost:3306/self_growth_log?charset=utf8mb4
JWT_SECRET=dev_secret_change_later
JWT_EXPIRES_IN=3600
PORT=4000
GPT_MODEL=gpt-4.1-mini
GPT_API_KEY=your_api_key
```

### 개발 실행 순서

```bash
npm install
docker compose -f backend/docker-compose.yml up -d mysql
npm run dev --workspace @self-growth/api
npm run dev --workspace @self-growth/web
```

프론트 개발 서버는 `http://localhost:5174`, 백엔드는 `http://localhost:4000`에서 실행되며, 프론트의 `/api` 요청은 백엔드로 프록시됩니다.

---

## 기술 스택

### Frontend

<img alt="React" src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
<img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
<img alt="Vite" src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
<img alt="React Router" src="https://img.shields.io/badge/React%20Router-CA4245?style=for-the-badge&logo=reactrouter&logoColor=white" />
<img alt="TanStack Query" src="https://img.shields.io/badge/TanStack%20Query-FF4154?style=for-the-badge&logo=reactquery&logoColor=white" />
<img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind%20CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" />

### Backend

<img alt="Node.js" src="https://img.shields.io/badge/Node%20JS-5FA04E?style=for-the-badge&logo=nodedotjs&logoColor=white" />
<img alt="Express" src="https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white" />
<img alt="Prisma" src="https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white" />
<img alt="Jest" src="https://img.shields.io/badge/Jest-C21325?style=for-the-badge&logo=jest&logoColor=white" />
<img alt="Supertest" src="https://img.shields.io/badge/Supertest-222222?style=for-the-badge" />
<img alt="Zod" src="https://img.shields.io/badge/Zod-3E67B1?style=for-the-badge&logo=zod&logoColor=white" />
<img alt="JWT" src="https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white" />

### Database / Infra

<img alt="MySQL" src="https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white" />
<img alt="Docker Compose" src="https://img.shields.io/badge/Docker%20Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white" />
<img alt="npm Workspaces" src="https://img.shields.io/badge/npm%20Workspaces-CB3837?style=for-the-badge&logo=npm&logoColor=white" />

공통 타입 계약은 `packages/contracts`에서 관리합니다.

---

## 1. 프로젝트 한 줄 소개

감정과 경험을 단순히 남기는 데서 끝나지 않고, 그 경험을 일본어로 표현하고 다시 교정하는 과정을 통해 언어 실력과 자기 이해를 함께 키우는 성장형 기록 플랫폼입니다.

---

## 2. 문제 정의

### 기존 일기 앱 / 학습 앱의 한계

- 일반적인 일기 앱은 감정과 경험을 기록하는 데는 유용하지만, 기록을 해석하거나 표현 역량의 성장으로 연결해 주지 못합니다.
- 일반적인 언어 학습 앱은 단어, 문법, 문제 풀이 중심이라 실제 자기 경험을 외국어로 말하는 훈련이 부족합니다.
- 결국 "내 감정과 경험을 외국어로 정확하게 표현하는 능력"은 두 종류의 앱 사이 어디에서도 충분히 다뤄지지 않습니다.

### 왜 언어화가 필요한가

- 감정은 머릿속에 있을 때보다 언어로 정리될 때 더 분명해집니다.
- "무슨 일이 있었는가", "왜 그런 감정이 생겼는가", "어떻게 표현할 것인가"를 단계적으로 다루면 자기 인식의 깊이가 달라집니다.
- 언어화는 단순 기록이 아니라 자기 설명 능력, 표현 정확도, 회고 품질을 함께 끌어올리는 과정입니다.

### 왜 일본어 학습과 결합했는가

- 외국어로 자기 경험을 표현하는 순간, 단순 번역이 아니라 의미 구조화와 표현 선택이 동시에 요구됩니다.
- 일본어 학습자에게 중요한 것은 "문법을 안다"를 넘어서 "내 이야기를 일본어로 말할 수 있다"는 감각입니다.
- Self Growth Log는 자기 성찰의 밀도와 일본어 표현 훈련을 하나의 루프로 연결합니다.

---

## 3. 핵심 기능 요약

### 기록

- 날짜, 감정 태그, 감정 강도, 트리거, 구체적 사건, 한국어 자기 칭찬, 일본어 초안까지 구조적으로 저장합니다.
- 기록 생성 자체가 이후 분석과 성장 계산의 시작점이 됩니다.

### 3-Step 언어화

- Step 1: 사건과 감정 강도를 기록합니다.
- Step 2: 사용자가 자유롭게 생각을 풀어 쓰면, AI가 probing question을 생성합니다.
- Step 3: 답변을 바탕으로 AI가 일본어 통찰 문장, 한국어 요약, 언어화 점수를 생성합니다.

### JaCheck

- 일본어 문장을 AI가 분석해 점수, 이슈 목록, 다음 질문을 반환합니다.
- 각 이슈는 ruleTag, severity, rewriteTask, self-check question을 포함합니다.

### Rewrite

- 사용자는 피드백을 반영해 일본어 문장을 다시 작성합니다.
- 교정 전후 결과를 revision으로 저장하고, 점수와 이슈 수 변화를 비교합니다.

### Growth Snapshot

- 기록, JaCheck, Rewrite, 언어화 세션 결과를 종합해 성장 상태를 계산합니다.
- Dog level / emotion과 6축 레이더 점수로 사용자의 누적 성장을 시각화합니다.

---

## 4. 사용자 플로우

```mermaid
flowchart TD
    A[기록 생성] --> B[일본어 초안 입력 또는 AI 초안 생성]
    B --> C[JaCheck 실행]
    C --> D[Rewrite 교정]
    A --> E[3-Step 언어화 시작]
    E --> F[AI probing question]
    F --> G[사용자 응답]
    G --> H[AI insight + verbalization score]
    C --> I[Growth Snapshot 갱신]
    D --> I
    H --> I
    I --> J[대시보드 / 통계 / 성장 시각화]
```

### 플로우 설명

1. 사용자는 감정과 사건을 기록합니다.
2. 일본어 초안을 직접 쓰거나 AI 초안을 생성합니다.
3. JaCheck가 일본어 표현을 분석해 피드백을 제공합니다.
4. 필요하면 Rewrite로 교정합니다.
5. 별도로 3-Step 언어화 플로우를 통해 더 깊은 자기 설명을 진행합니다.
6. 모든 결과는 Growth Snapshot에 반영되어 성장 지표로 축적됩니다.

---

## 5. 주요 화면

현재 저장소에는 README에 직접 삽입할 실제 스크린샷 파일이 아직 없습니다. 아래 목록은 문서 기준으로 유지할 대표 화면과, 나중에 스크린샷을 추가할 때 사용할 권장 경로입니다.

### 권장 화면 목록

- 인증 화면: 로그인/회원가입 전환과 서비스 첫 인상
- 대시보드: 성장 펫, 레이더 차트, 주간 코치 메시지, 최근 기록
- 기록 목록: 로그 카드 리스트와 기록 생성 모달
- 기록 상세: JaCheck 피드백 탭, 언어화 탭, 수정 탭
- 통계 화면: JA improvement, 규칙별 분포, 분위기 분포

### 추천 스크린샷 경로

아래 경로는 "현재 존재하는 파일"이 아니라 "추가 시 사용할 권장 위치"입니다.

- `docs/screenshots/auth.png`
- `docs/screenshots/dashboard.png`
- `docs/screenshots/log-detail-feedback.png`
- `docs/screenshots/log-detail-verbalization.png`
- `docs/screenshots/stats.png`

---

## 6. 시스템 아키텍처

### 백엔드 / 프론트엔드 구조

```text
Self-Growth/
├── backend/
│   ├── src/
│   │   ├── bootstrap/       # app, server, root router
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   ├── health/
│   │   │   ├── logs/
│   │   │   │   ├── ja-check/
│   │   │   │   └── verbalization/
│   │   │   └── stats/
│   │   │       └── growth/
│   │   ├── shared/          # http, infra, errors, config
│   │   └── __tests__/
│   └── prisma/
├── frontend/
│   └── src/
│       ├── app/             # App entry, router composition
│       ├── features/
│       │   ├── auth/
│       │   ├── growth/
│       │   ├── logs/
│       │   │   ├── ja-check/
│       │   │   └── verbalization/
│       │   └── stats/
│       ├── shared/          # api, ui, layout, lib
│       ├── styles/
│       └── types/
└── packages/
    └── contracts/
```

### 데이터 흐름

- Frontend는 `app/App.tsx`에서 Router, QueryClient, AuthProvider를 조립합니다.
- 각 기능은 `api -> queries -> components/pages` 흐름을 따릅니다.
- Backend는 `bootstrap/router.ts`에서 각 module router를 연결합니다.
- 각 module은 `router -> controller -> service -> prisma/shared infra` 구조를 따릅니다.
- 공통 타입은 `packages/contracts`에서 관리하고, frontend는 `src/types/index.ts`를 통해 재수출합니다.

### 비동기 처리 포인트

- 로그 생성 후 일본어 초안이 있으면 JaCheck를 비동기적으로 실행합니다.
- 로그 생성/수정/삭제, JaCheck 완료, 언어화 완료 이후 Growth Snapshot 갱신이 후처리로 수행됩니다.
- Verbalization Step 3 완료 시 snapshot refresh가 비동기적으로 실행됩니다.

---

## 7. 기술적 포인트

### 왜 이 구조를 선택했는가

- 기능 단위 응집도를 높이기 위해 프론트는 `features`, 백엔드는 `modules` 중심 구조를 선택했습니다.
- 공통 인프라와 계약을 분리해, 과거의 레이어별 분산 구조에서 발생하던 계약 드리프트를 줄였습니다.
- `packages/contracts`를 도입해 프론트 타입과 백엔드 계약의 정합성을 유지하기 쉽게 만들었습니다.

### 직접 설계한 포인트

- 감정 기록과 일본어 학습을 하나의 사용자 플로우로 묶은 제품 구조
- JaCheck + Rewrite + Growth Snapshot을 연결하는 성장 루프
- 언어화 결과를 별도 세션으로 저장하고 성장 지표에 반영하는 설계
- Dog level / emotion + 6축 점수 조합으로 만든 성장 시각화 모델

---

## 8. DB 스키마 핵심만

사용자 경험 기준 핵심 모델은 아래 4개입니다.

- `User`: 사용자 계정
- `GrowthLog`: 감정/사건/자기표현 기록
- `VerbalizationSession`: 3-Step 언어화 세션
- `UserGrowthSnapshot`: 성장 요약 지표

구현 레벨에서는 여기에 `JaCheckResult`, `JaRevision`이 추가되어 교정 결과와 revision 히스토리를 저장합니다.

```mermaid
erDiagram
    User ||--o{ GrowthLog : writes
    User ||--o{ VerbalizationSession : owns
    User ||--|| UserGrowthSnapshot : has
    GrowthLog ||--o{ JaCheckResult : produces
    GrowthLog ||--o{ JaRevision : has
    GrowthLog ||--|| VerbalizationSession : links
```

### 핵심 필드 예시

- `GrowthLog`: `moodTag`, `moodIntensity`, `triggerKo`, `specificEvent`, `praiseKo`, `praiseJa`
- `VerbalizationSession`: `rawThoughts`, `probingQuestion`, `probingAnswer`, `aiInsightJa`, `verbalizationScore`
- `UserGrowthSnapshot`: `dogLevel`, `dogEmotion`, `vocabulary`, `grammarAccuracy`, `consistency`, `positivity`, `revisionEffort`, `verbalizationClarity`

---

## 9. API 예시

### 기록 생성

`POST /api/logs`

```json
{
  "happenedAt": "2026-03-08T10:00:00.000Z",
  "moodTag": "CONFIDENT",
  "moodIntensity": 4,
  "triggerKo": "발표 준비를 마쳤다.",
  "specificEvent": "마감 전에 초안을 정리했다.",
  "praiseKo": "끝까지 집중해서 준비를 마무리했다.",
  "praiseJa": "最後まで集中して準備をやり切れた。"
}
```

### JaCheck 실행

`POST /api/logs/:id/check-ja`

응답에는 mode, overall score, issues가 포함됩니다.

### Rewrite 제출

`POST /api/logs/:id/rewrite-ja`

```json
{
  "revisedText": "最後まで集中して準備をやり切ることができた。"
}
```

### 언어화 Step 3 완료

`POST /api/logs/:id/verbalize/probe-answer`

```json
{
  "probingAnswer": "긴장은 있었지만, 끝까지 준비를 이어간 덕분에 안심할 수 있었다."
}
```

---

## 10. 테스트 / 안정성

현재 코드베이스에는 아래 안정성 장치가 들어 있습니다.

- Validation: Zod 기반 request body 검증
- Auth: JWT Bearer 인증
- Error handling: `AppError` + 공통 에러 미들웨어
- Rate limiting: 사용자 기준 rate limit
- Shared response shape: `data` / `error` 구조 일관화
- E2E test: signup -> login -> log -> check -> rewrite -> revision -> stats 전체 플로우 검증

### 실행 예시

```bash
npm run build
docker compose -f backend/docker-compose.yml up -d mysql
npm test --workspace @self-growth/api
```

### 테스트 전제조건

- 테스트는 로컬 MySQL이 먼저 실행 중이어야 합니다.
- 백엔드 테스트는 DB reset을 수행하므로, 테스트 실행 전에 `backend/.env`의 `DATABASE_URL`이 실제 로컬 개발 DB와 맞아야 합니다.
- 현재 저장소에는 `backend/.env.test` 예제 파일이 포함되어 있지 않습니다. 테스트 DB를 분리하려면 별도 환경 파일과 스크립트 정리가 추가로 필요합니다.

---

## 11. 트러블슈팅 / 어려웠던 점

### GPT 응답 처리

- 자유 텍스트 대신 구조화된 결과가 필요해서 JSON schema 기반 응답 파싱을 사용했습니다.
- 오류 응답, 재시도, 출력 텍스트 추출을 공용 helper로 분리했습니다.

### 성장 지표 설계

- 단순 활동량이 아니라 기록, 문법 피드백, 교정 노력, 언어화 품질을 함께 반영해야 했습니다.
- 그래서 `vocabulary`, `grammarAccuracy`, `consistency`, `positivity`, `revisionEffort`, `verbalizationClarity`의 6축 구조를 설계했습니다.

### 비동기 후처리

- 기록 생성 직후 응답 속도를 유지하면서도 후속 JaCheck / Growth 계산을 이어가야 했습니다.
- 그래서 요청 응답과 후처리를 분리하고, snapshot refresh는 비동기적으로 수행되도록 구성했습니다.

---

## 12. 향후 개선

- 언어화 세션 히스토리 뷰
- 언어화 점수 추세 차트
- 주간 리포트 자동 생성
- PWA / 오프라인 드래프트
- 프론트 단위 테스트 및 시각적 회귀 테스트
- README용 실제 화면 스크린샷 추가

---

## 실행 가이드

### 1. 의존성 설치

```bash
npm install
```

### 2. MySQL 실행

```bash
docker compose -f backend/docker-compose.yml up -d mysql
```

### 3. 백엔드 개발 서버

```bash
npm run dev --workspace @self-growth/api
```

기본 포트는 `4000`입니다.

### 4. 프론트 개발 서버

```bash
npm run dev --workspace @self-growth/web
```

기본 포트는 `5174`이며 `/api`는 `http://localhost:4000`으로 프록시됩니다.

### 5. 전체 빌드

```bash
npm run build
```

### 6. 백엔드 테스트

```bash
npm test --workspace @self-growth/api
```
