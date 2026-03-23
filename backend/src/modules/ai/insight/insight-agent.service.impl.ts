import { prisma } from "../../../shared/infra/prisma";
import { AppError } from "../../../shared/errors/AppError";
import { callGptStructuredJson } from "../../../shared/infra/gpt";
interface JaImprovementStats {
  days: number;
  totalRevisions: number;
  totalDeltaIssueCount: number;
  avgDeltaIssueCount: number;
  severityDistribution: { low: number; medium: number; high: number };
  ruleTagTop: Array<{ ruleTag: string; count: number }>;
  trend: Array<{
    date: string;
    deltaIssueCount: number;
    revisions: number;
    cumulativeDeltaIssueCount: number;
  }>;
}

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

function focusMessage(ruleTag: string) {
  const map: Record<string, { message: string; action: string }> = {
    particle: {
      message: "조사 선택이 자주 흔들립니다. 문장 구조를 먼저 나눠 보면 정리하기 쉬워집니다.",
      action: "주어/목적어 역할을 먼저 확인하고 조사 한 가지만 바꿔 보세요.",
    },
    naturalness: {
      message: "어색한 표현이 반복됩니다. 더 자주 쓰는 말로 바꿔 보면 문장이 부드러워집니다.",
      action: "어색했던 표현 1개만 골라 더 자연스러운 말로 바꿔 보세요.",
    },
    collocation: {
      message: "단어 조합이 어색한 경우가 보입니다. 함께 자주 쓰는 표현을 익히는 게 좋습니다.",
      action: "동사와 목적어 조합 1개를 더 자연스러운 조합으로 바꿔 보세요.",
    },
    kanji_kana: {
      message: "한자/가나 표기가 흔들립니다. 표기를 통일하면 안정감이 높아집니다.",
      action: "같은 단어의 표기를 한자 또는 가나 중 하나로 통일해 보세요.",
    },
    word_choice: {
      message: "단어 선택이 자주 막힙니다. 더 익숙하고 기본적인 어휘부터 쓰는 게 좋습니다.",
      action: "의미는 같지만 더 자주 쓰는 단어로 1개만 교체해 보세요.",
    },
    style_mix: {
      message: "문체가 섞여 보입니다. 한 문장 안에서는 톤을 맞추는 편이 자연스럽습니다.",
      action: "한 문장만 골라 반말 또는 정중체로 통일해 보세요.",
    },
    other: {
      message: "전반적으로 더 구체적으로 쓰면 피드백 품질이 좋아집니다.",
      action: "상대, 상황, 결과 중 2가지를 더 붙여 보세요.",
    },
  };
  return map[ruleTag] ?? map.other;
}

function coachQuestion(ruleTag: string) {
  const map: Record<string, string> = {
    particle: "이 문장에서 주어와 목적어의 역할을 먼저 나눠 보면 어떨까요?",
    naturalness: "어색했던 표현 하나만 골라 더 자주 쓰는 말로 바꿔볼까요?",
    collocation: "동사와 목적어 조합 하나만 더 자연스럽게 바꿔볼까요?",
    kanji_kana: "표기가 흔들리는 단어 하나만 골라 통일해볼까요?",
    word_choice: "더 쉽고 자주 쓰는 단어로 바꿀 수 있는 부분이 있을까요?",
    style_mix: "이 문장만이라도 한 문체로 통일해볼까요?",
    other: "상황이나 결과를 한 문장 더 붙여서 구체화해볼까요?",
  };
  return map[ruleTag] ?? map.other;
}

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

  buildDashboardInsight(d7: JaImprovementStats, d30: JaImprovementStats, qualityRows: Array<{ deltaIssueCount: number | null }>) {
    const totalRevisions30d = qualityRows.length;
    const nullDeltaCount30d = qualityRows.filter((r) => r.deltaIssueCount == null).length;
    const zeroDeltaCount30d = qualityRows.filter((r) => r.deltaIssueCount === 0).length;

    const weekTop1 = d7.ruleTagTop?.[0]?.ruleTag ?? null;
    const monthTop1 = d30.ruleTagTop?.[0]?.ruleTag ?? null;
    const monthTop2 = d30.ruleTagTop?.[1]?.ruleTag ?? null;

    const weekRuleTag = weekTop1 ?? monthTop1 ?? "other";
    let monthRuleTag = monthTop1 ?? "other";

    if (monthRuleTag === weekRuleTag && monthTop2) {
      monthRuleTag = monthTop2;
    }

    const weekFocus = focusMessage(weekRuleTag);
    const monthFocus = focusMessage(monthRuleTag);

    const nextTargets = (d30.ruleTagTop ?? [])
      .map((x: { ruleTag: string }) => x.ruleTag)
      .filter((tag: string) => tag !== weekRuleTag && tag !== monthRuleTag)
      .slice(0, 2)
      .map((tag: string) => ({
        ruleTag: tag,
        message: focusMessage(tag).message,
      }));

    return {
      ja: { d7, d30 },
      insights: {
        weekTopFocus: { ruleTag: weekRuleTag, ...weekFocus },
        monthTopFocus: { ruleTag: monthRuleTag, ...monthFocus },
        nextTargets,
      },
      coach: {
        week: {
          focusRuleTag: weekRuleTag,
          why: d7.ruleTagTop?.length
            ? "최근 7일 기준으로 가장 자주 흔들린 항목입니다."
            : "최근 7일 데이터가 부족해 30일 기준으로 추천합니다.",
          oneAction: weekFocus.action,
          nextQuestion: coachQuestion(weekRuleTag),
        },
        month: {
          focusRuleTag: monthRuleTag,
          why: "최근 30일 기준으로 가장 자주 흔들린 항목입니다.",
          oneAction: monthFocus.action,
          nextQuestion: coachQuestion(monthRuleTag),
        },
      },
      dataQuality: {
        totalRevisions30d,
        nullDeltaCount30d,
        zeroDeltaCount30d,
      },
    };
  },
};
