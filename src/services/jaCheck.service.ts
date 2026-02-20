import { AppError } from "../utils/AppError";
import { prisma } from "../utils/prisma";
import { callGptStructuredJson } from "../utils/gpt";
import { JA_CHECK, buildToolName } from "../utils/jaCheck.config";
import { JaCheckResultSchema, JaCheckResult } from "./jaCheck.schema";

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
あなたは日本語学習コーチです。目的は「学習者が自分で書き直して成長すること」です。

【重要ルール】
- いきなり完成文（正解）を提示しない。
- ただしexampleFixesは条件付きでOK：各issue最大${JA_CHECK.MAX_EXAMPLE_FIXES_PER_ISSUE}個、合計最大${JA_CHECK.MAX_EXAMPLE_FIXES_TOTAL}個。
- exampleFixesは「例」であり、正解は1つではないと必ず示す。
- 混合文体は原則OK。ただし同じ文脈で不自然に切り替わる場合のみ指摘する。
- 現地でよく使う自然な言い回し（コロケーション）を優先して提案する。
- 指摘は最大${JA_CHECK.MAX_ISSUES}件まで。軽微すぎる指摘は抑える。
- exampleFixes が不要なら必ず [] を入れてください（省略しない）。
- span が特定できない場合は必ず { "start": 0, "end": 0 } を入れてください（省略しない）。


【出力形式】必ずJSONのみ
{
  "overall": {
    "score": 0-100,
    "comment": "...",
    "nextStepQuestion": "...",
    "detectedStyle": "casual|polite|mixed",
    "recommendedStyle": "keep_mixed|unify_polite|unify_casual"
  },
  "issues": [
    {
      "issueId": "uuid-like-string",
      "ruleTag": "particle|politeness|word_choice|word_order|collocation|style_mix|naturalness|kanji_kana|other",
      "severity": "low|medium|high",
      "problem": "...",
      "why": "...",
      "selfCheckQuestion": "...",
      "rewriteTask": "...",
      "exampleFixes": ["...","..."],
      "span": { "start": 0, "end": 0 }
    }
  ]
}

【対象テキスト】
${inputJa}
`.trim();
}

function buildExpandModeResult(inputJa: string) {
  return {
    overall: {
      score: 55,
      comment:
        "문장이 짧아 문맥 기반 피드백이 어려워요. 상황/상대/의도를 조금만 더 넣으면 품질이 크게 올라갑니다.",
      nextStepQuestion:
        "누구에게, 어떤 상황에서, 무엇을 느꼈는지 1문장 더 붙여볼까요?",
      detectedStyle: "mixed" as const,
      recommendedStyle: "keep_mixed" as const,
    },
    issues: [
      {
        issueId: "expand-1",
        ruleTag: "other" as const,
        severity: "low" as const,
        problem: "문장 정보가 짧아 어색함의 원인을 특정하기 어려움",
        why: "일본어는 상대/상황에 따라 자연스러운 표현이 크게 달라져요.",
        selfCheckQuestion: "이 문장은 ‘누구에게/언제/왜’가 드러나나요?",
        rewriteTask:
          "현재 문장 뒤에 ‘상대 + 상황 + 결과’ 중 2개를 추가해서 20~60자로 늘려 다시 작성해보세요.",
        exampleFixes: [
          "（例）きょうは〇〇のおかげで助かった。すごくうれしかった。",
        ],
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

  if (total > JA_CHECK.MAX_EXAMPLE_FIXES_TOTAL) {
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
}

export const jaCheckService = {
  async check(userId: number, logId: number) {
    const toolName = buildToolName();

    const log = await prisma.growthLog.findFirst({
      where: { id: logId, userId },
      select: { id: true, praiseJa: true },
    });

    if (!log) {
      throw new AppError(404, "LOG_NOT_FOUND", "로그를 찾을 수 없습니다.");
    }
    

    const inputJa = normalizeText(log.praiseJa ?? "");
    const len = countChars(inputJa);

    if (len < 1)
      throw new AppError(422, "JA_TEXT_EMPTY", "일본어 문장이 비어 있습니다.");
    if (len > JA_CHECK.MAX_LEN) {
      throw new AppError(
        422,
        "JA_TEXT_TOO_LONG",
        `일본어 문장은 ${JA_CHECK.MAX_LEN}자 이하로 작성해주세요`,
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
      where: {
        toolName,
        originalText: inputJa,
        log: { userId },
      },
      orderBy: { createdAt: "desc" },
    });

    if (cached?.issuesJson) {
      return {
        mode: "cached" as const,
        resultId: cached.id,
        ...(cached.issuesJson as any),
      };
    }

    let lastErr: unknown = null;

    const prompt = buildPrompt(inputJa);

    for (let attempt = 0; attempt <= JA_CHECK.MAX_RETRIES; attempt++) {
      try {
        const raw = await callGptStructuredJson({
          model: JA_CHECK.MODEL,
          prompt,
          schemaName: "ja_feedback_v1",
          schema: responseSchema,
        });

        const validated: JaCheckResult = JaCheckResultSchema.parse(raw);

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
        console.error("JA CHECK: ", err);
        lastErr = err;
        if (attempt < JA_CHECK.MAX_RETRIES) continue;
      }
    }

    throw new AppError(
      502,
      "JA_CHECK_PARSE_FAILED",
      "검사 결과를 처리하지 못했습니다. 잠시 후 다시 시도해주세요.",
    );
  },
  async latest(userId: number, logId: number) {
    const log = await prisma.growthLog.findFirst({
      where: { id: logId, userId },
      select: { id: true },
    });

    if (!log) {
      throw new AppError(404, "LOG_NOT_FOUND", "로그를 찾을 수 없습니다.");
    }

    const latest = await prisma.jaCheckResult.findFirst({
      where: { logId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        toolName: true,
        originalText: true,
        issuesJson: true,
        issueCount: true,
        createdAt: true,
      },
    });

    return { result: latest };
  },

  async listResults(userId: number, logId: number, take: number = 20) {
    const log = await prisma.growthLog.findFirst({
      where: { id: logId, userId },
      select: { id: true },
    });

    if (!log) {
      throw new AppError(404, "LOG_NOT_FOUND", "로그를 찾을 수 없습니다.");
    }

    const results = await prisma.jaCheckResult.findMany({
      where: { logId },
      orderBy: { createdAt: "desc" },
      take,
      select: {
        id: true,
        toolName: true,
        issueCount: true,
        createdAt: true,
      },
    });

    return { results };
  },

  async getResultDetail(userId: number, resultId: number) {
    const result = await prisma.jaCheckResult.findUnique({
      where: { id: resultId },
      select: {
        id: true,
        logId: true,
        toolName: true,
        originalText: true,
        issuesJson: true,
        issueCount: true,
        createdAt: true,
      },
    });

    if (!result) {
      throw new AppError(
        404,
        "RESULT_NOT_FOUND",
        "검사 결과를 찾을 수 없습니다.",
      );
    }

    const owner = await prisma.growthLog.findFirst({
      where: { id: result.logId, userId },
      select: { id: true },
    });

    if (!owner) {
      throw new AppError(404, "LOG_NOT_FOUND", "로그를 찾을 수 없습니다.");
    }
    return { result };
  },
};

// function mockCheckJa(text: string) {
//   const t = text.trim();
//   const issues: Array<{
//     message: string;
//     severity: "info" | "warning" | "error";
//     hint?: string;
//   }> = [];

//   // 1) 너무 짧음
//   if (t.length < 15) {
//     issues.push({
//       message: "문장이 짧아서 뉘앙스가 부족할 수 있습니다.",
//       severity: "warning",
//       hint: "이유(なぜ) 또는 결과(どうなった) 한 문장을 추가해보세요.",
//     });
//   }

//   // 2) 문장 끝 마침표 체크(일본어는 보통 。)
//   if (t.length > 0 && !/[。！？!]$/.test(t)) {
//     issues.push({
//       message: "문장이 '。/！/？'로 끝나지 않습니다.",
//       severity: "info",
//       hint: "문장 끝을 '。'로 정리하면 자연스러워집니다.",
//     });
//   }

//   // 3) 한글 포함 여부(일본어 칸에 한글이 섞이면 경고)
//   if (/[ㄱ-ㅎㅏ-ㅣ가-힣]/.test(t)) {
//     issues.push({
//       message: "일본어 문장에 한글이 포함되어 있습니다.",
//       severity: "warning",
//       hint: "한글 표현을 일본어로 바꿔보세요.",
//     });
//   }

//   // 4) 구두점/공백 반복(오타 감지)
//   if (/ {2,}/.test(t) || /。。+/.test(t) || /、、+/.test(t)) {
//     issues.push({
//       message: "공백 또는 구두점이 반복됩니다(오타 가능).",
//       severity: "info",
//       hint: "연속된 공백/구두점을 정리해보세요.",
//     });
//   }

//   // 5) です/ます 체 vs だ/である 체 혼용(아주 단순 버전)
//   const hasDesuMasu = /(です|ます)/.test(t);
//   const hasDaStyle = /(だ|である)$/.test(t);
//   if (hasDesuMasu && hasDaStyle) {
//     issues.push({
//       message: "문체가 혼용될 수 있습니다(です/ます vs だ/である).",
//       severity: "info",
//       hint: "한 가지 문체로 통일하면 더 자연스럽습니다.",
//     });
//   }

//   return { issues, issueCount: issues.length };
// }
