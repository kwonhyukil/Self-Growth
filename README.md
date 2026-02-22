<div align="center">

  <h1>🌱 Self Growth Log API<br>(自己成長ログ API)</h1>

  <p>
    <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
    <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express.js" />
    <img src="https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma" />
    <img src="https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white" alt="MySQL" />
    <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
  </p>

  <h3>
    기록 → 피드백 → 수정 → 성장 루프를 만드는<br>
    일본어 학습 코칭 백엔드 시스템
  </h3>

  <p>
    <a href="README.md">🇰🇷 한국어</a> |
    <a href="README_ja.md">🇯🇵 日本語</a> |
    <a href="https://documenter.getpostman.com/view/50134492/2sBXcEkfui">📚 API 문서 (Postman)</a>
  </p>

</div>

<br>

## 📝 목차

- [프로젝트 소개](#-프로젝트-소개)
- [아키텍처 및 흐름](#-시스템-아키텍처-및-데이터-흐름)
- [주요 기능](#-주요-기능)
- [데이터베이스 설계](#-데이터베이스-설계)
- [API 명세](#-API-엔드포인트-명세-요약)
- [시작하기](#-시작하기)
- [테스트](#-테스트)

<hr>

## 📖 프로젝트 소개

**Self Growth Log API**는 단순한 문법 교정기가 아닌, 사용자 스스로 생각하고 고쳐 쓰도록 유도하는 **학습 코칭형 백엔드 시스템**입니다.
"기록 → 피드백 → 수정 → 성장"으로 이어지는 완전한 학습 루프를 구축하는 것을 목표로 설계되었습니다.

### 🤔 왜 만들었나?

일반적인 언어 학습 툴이나 번역기가 가진 한계는 사용자에게 **완성된 정답**만을 제공한다는 것입니다.
이 경우 사용자는 자신의 문장이 왜 틀렸는지 깊이 고민하지 않고 결과만 취하게 되어, 실질적인 작문 실력 향상으로 이어지기 어렵습니다.

이 프로젝트는 정답을 바로 내어주는 대신, **왜 어색한지, 무엇을 고치면 되는지, 다음에 무엇을 시도할지**를 질문과 과제 형태로 제시하여 사용자가 직접 문장을 수정(Rewrite)하도록 만듭니다.

### 💡 핵심 철학

1. **정답 대신 "학습 루프" 제공**
   - "이유 + 질문 + 과제" 기반의 피드백을 통해 수동적인 결과 수용이 아닌 자기주도적 성장을 이끕니다.
2. **유연한 확장성**
   - 피드백을 생성하는 검사 엔진(현재 OpenAI API 활용)의 결합도를 낮춰, 향후 다른 AI 모델이나 자체 로직으로 쉽게 교체할 수 있는 아키텍처를 지향합니다.
3. **데이터 기반의 성장 시각화**
   - 모든 검사 결과(`ja_check_results`)와 수정 과정(`ja_revisions`)을 데이터베이스에 기록하고 변화량(Delta)을 추적합니다. 이를 통해 사용자에게 명확한 통계 및 성장 지표 대시보드를 제공할 수 있는 기반을 마련했습니다.

## 🏗 시스템 아키텍처 및 데이터 흐름

본 프로젝트는 유지보수성과 테스트 용이성을 높이기 위해 **계층형 아키텍처**를 채택했습니다.
비즈니스 로직은 서비스(Service) 계층에 집중시키고, 컨트롤러(Controller)는 클라이언트의 요청과 응답 처리에만 집중하도록 얇게(Thin) 설계했습니다.

### 🔄 API 요청 처리 흐름

모든 클라이언트의 요청은 안전하고 일관된 처리를 위해 여러 단계의 방어적 미들웨어를 거친 후 비즈니스 로직으로 전달됩니다.

```mermaid
sequenceDiagram
    participant Client
    participant Route
    participant Middleware
    participant Controller
    participant Service
    participant Prisma
    participant DB

    Client->>Route: HTTP Request
    Route->>Middleware: 1. requestLog (추적용 X-Request-Id 부여)
    Middleware->>Middleware: 2. authMiddleware (JWT 검증 -> req.userId 주입)
    Middleware->>Middleware: 3. validateBody (Zod 기반 페이로드 검증)
    Middleware->>Middleware: 4. rateLimit (사용자별 요청 제한 / 남용 방지)
    Middleware->>Controller: 안전성이 검증된 요청 전달
    Controller->>Service: 비즈니스 로직 호출
    Service->>Prisma: 데이터 조회/저장 요청 (트랜잭션 포함)
    Prisma->>DB: Query 실행
    DB-->>Prisma: Result
    Prisma-->>Service: Data
    Service-->>Controller: 비즈니스 로직 처리 결과 반환
    Controller-->>Client: 통일된 JSON 포맷 응답 (AppError 기반 예외 처리 포함)
```

### 📂 프로젝트 폴더 구조

비즈니스 로직과 라우팅을 명확히 분리한 계층형 구조입니다.

- 📁 **`src/`**
  - ⚙️ **`app.ts`** : Express 애플리케이션 초기화 및 진입점
  - 🌐 **`routes/`** : URL 경로와 컨트롤러 매핑
  - 🎮 **`controllers/`** : HTTP 요청(req) 파싱 및 통일된 응답(res) 반환
  - 🧠 **`services/`** : 핵심 비즈니스 로직 (피드백 엔진 연동 등)
  - 🛡️ **`middlewares/`** : 공통 방어 로직 (Auth, Rate Limit, Zod 검증 등)
  - 🗄️ **`prisma/`** : DB 스키마 및 마이그레이션 파일
  - 🛠️ **`utils/`** : 커스텀 에러(AppError) 및 공통 로거
  - 🧪 **`tests/`** : E2E 및 유닛 테스트 코드

## 🗄 데이터베이스 설계

"기록 → 피드백 → 수정"으로 이어지는 성장 루프를 추적하고 통계를 도출하기 위해 관계형 데이터베이스(MySQL)를 설계했습니다.

| 테이블명               | 역할                        | 핵심 컬럼 및 특징                                                                  |
| :--------------------- | :-------------------------- | :--------------------------------------------------------------------------------- |
| **`users`**            | 사용자 정보                 | `id`, `email`(Unique), `passwordHash`                                              |
| **`growth_logs`**      | 사용자 작성 로그 메타데이터 | `userId`(FK), 감정 태그(`moodTag`), 한국어/일본어 텍스트                           |
| **`ja_check_results`** | 피드백 엔진 검사 결과       | `logId`(FK), `issuesJson`(JSON 형태 구조화 응답), `issueCount`                     |
| **`ja_revisions`**     | **성장 루프 추적 (핵심)**   | `logId`(FK), 수정 전/후 텍스트 비교, 피드백 ID 참조, **개선도(`deltaIssueCount`)** |

- **설계 포인트:** 피드백 결과(`issuesJson`)를 JSON 형태로 저장하여 향후 검사 엔진이 교체되거나 응답 포맷이 확장되더라도 DB 스키마 변경을 최소화하도록 설계했습니다.

---

## 🚀 주요 기능

### 1. 코칭형 일본어 피드백 엔진

단순한 문장 교정이 아닌, 사용자의 스스로 학습을 유도하는 백엔드 코어 기능입니다.

- **구조화된 피드백 (JSON Schema):** OpenAI API의 Responses API를 활용하여 단순 텍스트가 아닌 `이유(Why) - 질문(Question) - 과제(Task)` 형태의 구조화된 JSON 응답을 강제합니다.
- **문장 확장 유도 (Expand Mode):** 입력된 문장이 너무 짧을 경우, 문장을 더 길고 자연스럽게 쓰도록 유도하는 특수 코칭 모드를 제공합니다.
- **비용 최적화 (Caching):** 동일한 텍스트에 대한 중복 검사를 방지하기 위해 캐시 처리를 구현하여 외부 API 호출 비용을 절감합니다.

### 2. 수정 및 성장 이력 추적

- 사용자가 코칭을 바탕으로 문장을 수정(Rewrite)하여 제출하면, 새로운 검사 결과와 함께 **수정 전/후의 변화량**을 계산하여 `ja_revisions`에 기록합니다.
- Baseline이 없는 경우 자동 생성하여 Delta null 값을 최소화하고, 정량적인 성장을 증명합니다.

### 3. 통계 및 대시보드 지원

- **성장 지표 시각화 데이터 제공:** 7일/30일간의 개선 추이, 누적 개선량, 자주 틀리는 문법 태그(ruleTagTop) 등의 통계 데이터를 가공하여 프론트엔드에 원콜(1-call)로 제공합니다.

### 4. 인증 및 권한 보호

- **JWT 기반 인증:** 회원가입(비밀번호 해시화) 및 로그인 시 JWT를 발급합니다.
- **데이터 소유권 강제:** Bearer 인증 미들웨어를 통해 모든 API 엔드포인트에서 본인의 데이터에만 접근할 수 있도록 철저히 보호합니다.

### 5. 실서비스 대비 운영 안전장치

- **안정성 확보:** 사용자별 Rate Limit(분당 요청 제한) 및 페이로드 길이 제한을 적용하여 시스템 남용을 방지합니다.
- **에러 및 로깅 처리:** 외부 API 호출 시 Timeout 및 제한적 Retry 로직을 구현했습니다. 또한 표준화된 에러 응답(AppError) 매핑과 `X-Request-Id`를 통한 추적성 높은 로깅 시스템을 구축했습니다.

## 📡 API 엔드포인트 명세 요약

- **Base URL:** `http://localhost:4000/api`
- **인증 헤더:** `Authorization: Bearer <accessToken>`

| 도메인      | Method             | Endpoint                    | 역할                                                       |
| :---------- | :----------------- | :-------------------------- | :--------------------------------------------------------- |
| **Auth**    | `POST`             | `/auth/signup`              | 회원가입                                                   |
|             | `POST`             | `/auth/login`               | 로그인 (JWT 발급)                                          |
| **Logs**    | `GET/POST`         | `/logs`                     | 로그 목록 조회 및 생성                                     |
|             | `GET/PATCH/DELETE` | `/logs/:id`                 | 단일 로그 조회, 수정, 삭제                                 |
| **Check**   | `POST`             | `/logs/:id/check-ja`        | 일본어 검사 요청 (`mode`: `expand` \| `cached` \| `fresh`) |
|             | `GET`              | `/logs/:id/check-ja/latest` | 최신 검사 결과 조회                                        |
| **Rewrite** | `POST`             | `/logs/:id/rewrite-ja`      | 수정문 제출 (재검사, Revision 생성, Delta 반환)            |
|             | `GET`              | `/logs/:id/revisions`       | 수정 이력(Revision) 목록 조회                              |
| **Stats**   | `GET`              | `/stats/summary`            | 로그 요약 및 대시보드 통합 (Front-end 1-call 최적화)       |
|             | `GET`              | `/stats/ja-improvement`     | 기간별 개선 추이 및 심각도 분포 조회                       |

---

## 🛠 시작하기

### 1. 요구 사항

- Node.js (v18 이상 권장)
- Docker & Docker Compose (MySQL 컨테이너 실행용)

### 2. 환경 변수 설정

프로젝트 루트에 `.env` 및 `.env.test` 파일을 생성하고 아래와 같이 설정합니다.

```env
# .env (개발 환경)
PORT=4000
DATABASE_URL="mysql://root:password@localhost:3306/growth_log"
JWT_SECRET="your_secret_key"
OPENAI_API_KEY="sk-..."

# .env.test (테스트 환경)
DATABASE_URL="mysql://root:password@localhost:3306/growth_log_test"
```

### 3. 설치 및 실행

```
# 패키지 설치
npm install

# DB 컨테이너 실행
docker compose up -d

# Prisma 마이그레이션 (DB 스키마 동기화)
npx prisma migrate dev

# 로컬 서버 실행
npm run dev
```

### 🧪 테스트

본 프로젝트는 핵심 비즈니스 로직의 신뢰성을 보장하기 위해 E2E(End-to-End) 테스트를 구축했습니다. 회원가입 → 로그인 → 로그 생성 → 검사 요청 → 수정(Rewrite) → 통계 확인으로 이어지는 전체 흐름을 한 번에 검증합니다.

테스트 DB 분리: .env.test를 사용하여 운영 DB와 격리된 환경에서 테스트를 수행합니다.

자동화된 초기화: 테스트 실행 시 migrate reset이 자동으로 수행되어 매번 깨끗한 상태에서 회귀(Regression)를 방지합니다.

```

# E2E 전체 테스트 실행
npm test
```

## 🗺 향후 확장 계획

현재 핵심 루프(검사 → 수정 → 통계)와 운영 최소 세트는 완성되었으며, 지속적인 고도화를 위해 아래와 같은 기능 확장을 계획하고 있습니다.

- [ ] **코칭 고도화:** 사용자가 피드백을 더 쉽게 반영할 수 있도록 템플릿 제공 및 빈칸 채우기 방식의 인터랙티브 코칭 도입.
- [ ] **개인화 리포트:** 누적된 `ja_revisions` 데이터를 바탕으로 주간 리포트 자동 생성 및 자주 틀리는 문법에 대한 '약점 히트맵(Heatmap)' 제공.
- [ ] **프론트엔드 통합 연동:** 백엔드에서 제공하는 1-call 통계 API를 활용하여 성장 타임라인, 변화량 그래프, 코치 카드를 시각적으로 렌더링하는 UI 구현.

---

> **"지속적인 기록과 피드백만이 실질적인 성장을 만듭니다."**
