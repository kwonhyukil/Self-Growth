import { AppError } from "../../../shared/errors/AppError";
import { prisma } from "../../../shared/infra/prisma";
import { callGptStructuredJson } from "../../../shared/infra/gpt";
import { JA_CHECK, buildToolName } from "../../../shared/config/ja-check.config";
import { JaCheckResultSchema, JaCheckResult } from "../../logs/ja-check/ja-check.schema";
import { growthService } from "../../stats/growth/growth.service";

const responseSchema = {
  type: "object",
  additionalProperties: false,
  required: ["overall", "issues"],
  properties: {
    overall: {
      type: "object",
      additionalProperties: false,
      required: [
        "score",
        "comment",
        "nextStepQuestion",
        "detectedStyle",
        "recommendedStyle",
      ],
      properties: {
        score: { type: "number" },
        comment: { type: "string" },
        nextStepQuestion: { type: "string" },
        detectedStyle: { type: "string", enum: ["casual", "polite", "mixed"] },
        recommendedStyle: {
          type: "string",
          enum: ["keep_mixed", "unify_polite", "unify_casual"],
        },
      },
    },
    issues: {
      type: "array",
      maxItems: JA_CHECK.MAX_ISSUES,
      items: {
        type: "object",
        additionalProperties: false,
        required: [
          "issueId",
          "ruleTag",
          "severity",
          "problem",
          "why",
          "selfCheckQuestion",
          "rewriteTask",
          "exampleFixes",
          "span",
        ],
        properties: {
          issueId: { type: "string" },
          ruleTag: { type: "string" },
          severity: { type: "string" },
          problem: { type: "string" },
          why: { type: "string" },
          selfCheckQuestion: { type: "string" },
          rewriteTask: { type: "string" },
          exampleFixes: {
            type: "array",
            items: { type: "string" },
            maxItems: 2,
          },
          span: {
            type: "object",
            additionalProperties: false,
            required: ["start", "end"],
            properties: {
              start: { type: "integer" },
              end: { type: "integer" },
            },
          },
        },
      },
    },
  },
};

function normalizeText(s: string) {
  return s.trim().replace(/\s+/g, " ");
}

function countChars(s: string) {
  return [...s].length;
}

function buildPrompt(inputJa: string) {
  return `
당신은 일본어 자기표현 코치입니다. 사용자가 작성한 일본어 문장을 읽고, 학습자가 스스로 고칠 수 있도록 구조화된 피드백을 JSON으로 반환하세요.

출력 규칙:
- exampleFixes는 최대 2개, 전체 issue를 합쳐 최대 ${JA_CHECK.MAX_EXAMPLE_FIXES_TOTAL}개
- exampleFixes는 짧은 예시 문장만 넣고 설명은 넣지 않습니다
- span을 알 수 없으면 { "start": 0, "end": 0 }으로 반환합니다
- issues는 최대 ${JA_CHECK.MAX_ISSUES}개까지만 반환합니다

반환 JSON:
{
  "overall": {
    "score": 0,
    "comment": "...",
    "nextStepQuestion": "...",
    "detectedStyle": "casual|polite|mixed",
    "recommendedStyle": "keep_mixed|unify_polite|unify_casual"
  },
  "issues": [
    {
      "issueId": "string",
      "ruleTag": "particle|politeness|word_choice|word_order|collocation|style_mix|naturalness|kanji_kana|other",
      "severity": "low|medium|high",
      "problem": "...",
      "why": "...",
      "selfCheckQuestion": "...",
      "rewriteTask": "...",
      "exampleFixes": ["..."],
      "span": { "start": 0, "end": 0 }
    }
  ]
}

검토할 문장:
${inputJa}
`.trim();
}

function buildExpandModeResult(inputJa: string) {
  return {
    overall: {
      score: 55,
      comment:
        "문장이 너무 짧아 문맥 기반 피드백이 어려워요. 상황이나 감정을 조금 더 붙이면 더 정확한 피드백이 가능해집니다.",
      nextStepQuestion:
        "누가, 언제, 어떤 상황에서 한 말인지 한 문장만 덧붙여볼까요?",
      detectedStyle: "mixed" as const,
      recommendedStyle: "keep_mixed" as const,
    },
    issues: [
      {
        issueId: "expand-1",
        ruleTag: "other" as const,
        severity: "low" as const,
        problem: "문장 정보가 짧아 표현의 맥락을 판단하기 어려워요.",
        why: "상황이나 상대가 보이면 일본어 표현의 자연스러움을 더 정확히 볼 수 있어요.",
        selfCheckQuestion: "이 문장만 읽었을 때 누가 어떤 상황인지 드러나나요?",
        rewriteTask:
          "현재 문장 뒤에 상황이나 감정을 한 문장 덧붙여 20~60자 정도로 확장해 보세요.",
        exampleFixes: [
          `${inputJa}。今日は発表のあとに自分へかけた言葉です。`,
        ],
        span: { start: 0, end: 0 },
      },
    ],
  };
}

function enforceExampleLimits(validated: JaCheckResult) {
  let total = 0;

  for (const issue of validated.issues) {
    if (!issue.exampleFixes?.length) continue;
    if (issue.exampleFixes.length > JA_CHECK.MAX_EXAMPLE_FIXES_PER_ISSUE) {
      issue.exampleFixes = issue.exampleFixes.slice(
        0,
        JA_CHECK.MAX_EXAMPLE_FIXES_PER_ISSUE,
      );
    }
    total += issue.exampleFixes.length;
  }

  if (total <= JA_CHECK.MAX_EXAMPLE_FIXES_TOTAL) return;

  let remain = JA_CHECK.MAX_EXAMPLE_FIXES_TOTAL;
  for (const issue of validated.issues) {
    if (!issue.exampleFixes?.length) continue;

    if (remain <= 0) {
      issue.exampleFixes = [];
      continue;
    }

    if (issue.exampleFixes.length > remain) {
      issue.exampleFixes = issue.exampleFixes.slice(0, remain);
    }
    remain -= issue.exampleFixes.length;
  }
}

export const feedbackAgentService = {
  async runByText(userId: number, logId: number, inputJaRaw: string) {
    const toolName = buildToolName();
    const inputJa = normalizeText(inputJaRaw ?? "");
    const len = countChars(inputJa);

    if (len < 1) {
      throw new AppError(422, "JA_TEXT_EMPTY", "일본어 문장이 비어 있습니다.");
    }
    if (len > JA_CHECK.MAX_LEN) {
      throw new AppError(
        422,
        "JA_TEXT_TOO_LONG",
        `일본어 문장은 ${JA_CHECK.MAX_LEN}자 이하로 작성해주세요.`,
      );
    }

    if (len < JA_CHECK.MIN_LEN) {
      const expand = buildExpandModeResult(inputJa);
      const saved = await prisma.jaCheckResult.create({
        data: {
          logId,
          toolName: `coach:expand:${JA_CHECK.PROMPT_VERSION}`,
          originalText: inputJa,
          issuesJson: expand as any,
          issueCount: expand.issues.length,
        },
      });
      return { mode: "expand" as const, resultId: saved.id, ...expand };
    }

    const cached = await prisma.jaCheckResult.findFirst({
      where: { toolName, originalText: inputJa, log: { userId } },
      orderBy: { createdAt: "desc" },
    });

    if (cached?.issuesJson) {
      return {
        mode: "cached" as const,
        resultId: cached.id,
        ...(cached.issuesJson as any),
      };
    }

    const prompt = buildPrompt(inputJa);

    for (let attempt = 0; attempt <= JA_CHECK.MAX_RETRIES; attempt++) {
      try {
        const raw = await callGptStructuredJson<JaCheckResult>({
          model: JA_CHECK.MODEL,
          prompt,
          schemaName: "feedback_agent_v1",
          schema: responseSchema,
        });

        const validated = JaCheckResultSchema.parse(raw);
        enforceExampleLimits(validated);

        const saved = await prisma.jaCheckResult.create({
          data: {
            logId,
            toolName,
            originalText: inputJa,
            issuesJson: validated as any,
            issueCount: validated.issues.length,
          },
        });

        return { mode: "fresh" as const, resultId: saved.id, ...validated };
      } catch (err) {
        console.error("FEEDBACK AGENT:", err);
        if (attempt < JA_CHECK.MAX_RETRIES) continue;
      }
    }

    throw new AppError(
      502,
      "FEEDBACK_AGENT_FAILED",
      "피드백 결과를 처리하지 못했습니다. 잠시 후 다시 시도해주세요.",
    );
  },

  async runForLog(userId: number, logId: number) {
    const log = await prisma.growthLog.findFirst({
      where: { id: logId, userId },
      select: { id: true, praiseJa: true },
    });

    if (!log) {
      throw new AppError(404, "LOG_NOT_FOUND", "로그를 찾을 수 없습니다.");
    }

    const result = await this.runByText(userId, logId, log.praiseJa ?? "");
    await growthService.refreshSnapshot(userId);
    return {
      agent: "feedback" as const,
      ...result,
    };
  },
};
