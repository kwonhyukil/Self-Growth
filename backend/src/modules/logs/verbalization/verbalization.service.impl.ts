/**
 * verbalization.service.ts
 * ─────────────────────────────────────────────────────────────
 * 3-Step 언어화 프로세스 서비스
 *
 * Step 1 (LogForm): 구체적 사건 + 감정 강도 수집 (schema 필드)
 * Step 2 (Brainstorm): 3분 원초적 사고 덤프 → AI 탐구 질문 생성
 * Step 3 (Insight): 사용자 탐구 답변 → AI가 일본어 핵심 문장 + 점수 산출
 */

import { prisma } from "../../../shared/infra/prisma";
import { AppError } from "../../../shared/errors/AppError";
import { callGptStructuredJson } from "../../../shared/infra/gpt";

// ── GPT 응답 타입 ────────────────────────────────────────────

interface ProbingResult {
  probingQuestion: string; // 사용자 내면을 탐구하는 한국어 질문
}

interface InsightResult {
  aiInsightJa: string;        // 정제된 일본어 핵심 문장 (20-100자)
  aiInsightKo: string;        // 한국어 요약 (1-2문장)
  verbalizationScore: number; // 0-100 언어화 품질 점수
  scoringReason: string;      // 점수 근거 (내부 참조용)
}

// ── GPT JSON Schema ──────────────────────────────────────────

const PROBING_SCHEMA = {
  type: "object",
  properties: {
    probingQuestion: { type: "string" },
  },
  required: ["probingQuestion"],
  additionalProperties: false,
};

const INSIGHT_SCHEMA = {
  type: "object",
  properties: {
    aiInsightJa:          { type: "string" },
    aiInsightKo:          { type: "string" },
    verbalizationScore:   { type: "number" },
    scoringReason:        { type: "string" },
  },
  required: ["aiInsightJa", "aiInsightKo", "verbalizationScore", "scoringReason"],
  additionalProperties: false,
};

// ── 서비스 ───────────────────────────────────────────────────

export const verbalizationService = {
  /**
   * Step 2: 브레인스토밍 원고 저장 + AI 탐구 질문 생성
   */
  async startSession(
    userId: number,
    logId: number,
    rawThoughts: string,
    thinkingDurationMs?: number
  ) {
    // 로그 소유권 확인
    const log = await prisma.growthLog.findFirst({
      where: { id: logId, userId },
      select: { id: true, triggerKo: true, praiseKo: true, specificEvent: true, moodTag: true },
    });
    if (!log) {
      throw new AppError(404, "LOG_NOT_FOUND", "로그를 찾을 수 없습니다.");
    }

    // AI 탐구 질문 생성
    const prompt = `
당신은 자기 성장 코치입니다. 사용자가 3분 동안 자신의 감정과 경험에 대해 자유롭게 쏟아낸 원초적 사고를 읽고,
사용자가 자신의 내면을 더 깊이 탐구할 수 있도록 돕는 단 하나의 핵심 질문을 한국어로 생성하세요.

[오늘의 사건/상황]
${log.specificEvent ?? log.triggerKo}

[감정]
${log.moodTag}

[사용자의 원초적 사고 덤프]
${rawThoughts}

규칙:
- 질문은 1개만 생성합니다
- "왜"로 시작하거나 감정의 근원을 탐구하는 질문
- 판단하지 않고, 호기심 어린 따뜻한 톤
- 50자 이내의 간결한 질문
`.trim();

    const result = await callGptStructuredJson<ProbingResult>({
      model: "gpt-4o-mini",
      prompt,
      schemaName: "probing_question",
      schema: PROBING_SCHEMA,
      maxOutputTokens: 200,
    });

    // 세션 upsert (logId unique)
    const session = await prisma.verbalizationSession.upsert({
      where: { logId },
      create: {
        logId,
        userId,
        rawThoughts,
        thinkingDurationMs,
        probingQuestion: result.probingQuestion,
        completedSteps: 1,
      },
      update: {
        rawThoughts,
        thinkingDurationMs,
        probingQuestion: result.probingQuestion,
        probingAnswer: null,
        aiInsightJa: null,
        aiInsightKo: null,
        verbalizationScore: null,
        completedSteps: 1,
      },
    });

    return {
      sessionId: session.id,
      probingQuestion: result.probingQuestion,
    };
  },

  /**
   * Step 3: 탐구 답변 저장 + AI 인사이트 + 일본어 핵심 문장 생성
   */
  async submitProbeAnswer(
    userId: number,
    logId: number,
    probingAnswer: string
  ) {
    const session = await prisma.verbalizationSession.findFirst({
      where: { logId, userId },
      include: {
        log: {
          select: {
            triggerKo: true,
            specificEvent: true,
            praiseKo: true,
            moodTag: true,
          },
        },
      },
    });
    if (!session) {
      throw new AppError(
        404,
        "SESSION_NOT_FOUND",
        "먼저 브레인스토밍을 시작해주세요."
      );
    }
    if (!session.probingQuestion) {
      throw new AppError(400, "SESSION_INCOMPLETE", "탐구 질문이 아직 없습니다.");
    }

    const log = session.log;

    const prompt = `
당신은 일본어 표현 코치입니다. 사용자의 자기 성장 경험을 바탕으로,
핵심 감정과 통찰을 담은 자연스러운 일본어 자기 선언 문장(自己表現)을 생성하고,
언어화의 깊이와 품질을 0-100점으로 평가해주세요.

[상황]
${log.specificEvent ?? log.triggerKo}

[원초적 사고]
${session.rawThoughts}

[탐구 질문]
${session.probingQuestion}

[사용자의 탐구 답변]
${probingAnswer}

생성 규칙:
- aiInsightJa: 20-80자의 자연스러운 일본어 자기 표현 문장. 구체적이고 감정이 담긴 표현 사용
- aiInsightKo: 1-2문장의 한국어 요약. 사용자가 이번에 발견한 것을 정리
- verbalizationScore: 0-100점. 구체성(30점) + 감정 깊이(30점) + 자기 이해(40점)로 평가
- scoringReason: 점수 이유를 간단히 설명 (내부 참고용)
`.trim();

    const result = await callGptStructuredJson<InsightResult>({
      model: "gpt-4o-mini",
      prompt,
      schemaName: "verbalization_insight",
      schema: INSIGHT_SCHEMA,
      maxOutputTokens: 500,
    });

    const updated = await prisma.verbalizationSession.update({
      where: { id: session.id },
      data: {
        probingAnswer,
        aiInsightJa: result.aiInsightJa,
        aiInsightKo: result.aiInsightKo,
        verbalizationScore: Math.round(result.verbalizationScore),
        completedSteps: 3,
      },
    });

    // growth snapshot 비동기 갱신
    const { growthService } = await import("../../stats/growth/growth.service");
    await growthService.refreshSnapshot(userId);

    return {
      sessionId: updated.id,
      aiInsightJa: updated.aiInsightJa!,
      aiInsightKo: updated.aiInsightKo!,
      verbalizationScore: updated.verbalizationScore!,
    };
  },

  /**
   * 현재 세션 상태 조회
   */
  async getSession(userId: number, logId: number) {
    const session = await prisma.verbalizationSession.findFirst({
      where: { logId, userId },
    });
    return session;
  },
};
