import { prisma } from "../../../shared/infra/prisma";
import { AppError } from "../../../shared/errors/AppError";
import { callGptStructuredJson } from "../../../shared/infra/gpt";

interface ProbingResult {
  probingQuestion: string;
}

interface InsightResult {
  aiInsightJa: string;
  aiInsightKo: string;
  verbalizationScore: number;
  scoringReason: string;
}

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
    aiInsightJa: { type: "string" },
    aiInsightKo: { type: "string" },
    verbalizationScore: { type: "number" },
    scoringReason: { type: "string" },
  },
  required: ["aiInsightJa", "aiInsightKo", "verbalizationScore", "scoringReason"],
  additionalProperties: false,
};

export const insightAgentService = {
  async startVerbalizationSession(
    userId: number,
    logId: number,
    rawThoughts: string,
    thinkingDurationMs?: number,
  ) {
    const log = await prisma.growthLog.findFirst({
      where: { id: logId, userId },
      select: { id: true, triggerKo: true, praiseKo: true, specificEvent: true, moodTag: true },
    });

    if (!log) {
      throw new AppError(404, "LOG_NOT_FOUND", "로그를 찾을 수 없습니다.");
    }

    const prompt = `
당신은 자기 성장 코치입니다. 사용자가 자유롭게 적은 생각을 읽고,
내면을 더 깊이 탐구할 수 있는 한국어 질문 1개만 생성하세요.

[상황]
${log.specificEvent ?? log.triggerKo}

[감정]
${log.moodTag}

[생각 메모]
${rawThoughts}

규칙:
- 질문은 1개만 생성
- 따뜻하고 비판하지 않는 톤
- 50자 이내
`.trim();

    const result = await callGptStructuredJson<ProbingResult>({
      model: "gpt-4o-mini",
      prompt,
      schemaName: "insight_agent_question",
      schema: PROBING_SCHEMA,
      maxOutputTokens: 200,
    });

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

  async submitVerbalizationAnswer(userId: number, logId: number, probingAnswer: string) {
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
      throw new AppError(404, "SESSION_NOT_FOUND", "먼저 브레인스토밍을 시작해주세요.");
    }
    if (!session.probingQuestion) {
      throw new AppError(400, "SESSION_INCOMPLETE", "탐구 질문이 아직 없습니다.");
    }

    const prompt = `
당신은 일본어 표현 코치입니다. 사용자의 감정과 통찰을 바탕으로
핵심을 담은 일본어 자기표현 문장과 한국어 요약을 생성하세요.

[상황]
${session.log.specificEvent ?? session.log.triggerKo}

[원초적 사고]
${session.rawThoughts}

[탐구 질문]
${session.probingQuestion}

[사용자 답변]
${probingAnswer}

규칙:
- aiInsightJa: 20~80자의 자연스러운 일본어 문장
- aiInsightKo: 1~2문장 한국어 요약
- verbalizationScore: 0~100점
- scoringReason: 점수 이유
`.trim();

    const result = await callGptStructuredJson<InsightResult>({
      model: "gpt-4o-mini",
      prompt,
      schemaName: "insight_agent_result",
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

    return {
      sessionId: updated.id,
      aiInsightJa: updated.aiInsightJa!,
      aiInsightKo: updated.aiInsightKo!,
      verbalizationScore: updated.verbalizationScore!,
    };
  },

  async getVerbalizationSession(userId: number, logId: number) {
    return prisma.verbalizationSession.findFirst({
      where: { logId, userId },
    });
  },
};
