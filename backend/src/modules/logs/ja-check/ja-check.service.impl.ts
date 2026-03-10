import { AppError } from "../../../shared/errors/AppError";
import { prisma } from "../../../shared/infra/prisma";
import { callGptStructuredJson } from "../../../shared/infra/gpt";
import { JA_CHECK, buildToolName } from "../../../shared/config/ja-check.config";
import { JaCheckResultSchema, JaCheckResult } from "./ja-check.schema";
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

async function checkByText(userId: number, logId: number, inputJaRaw: string) {
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
      if (attempt < JA_CHECK.MAX_RETRIES) continue;
    }
  }

  throw new AppError(
    502,
    "JA_CHECK_PARSE_FAILED",
    "검사 결과를 처리하지 못했습니다. 잠시 후 다시 시도해주세요.",
  );
}

export const jaCheckService = {
  async check(userId: number, logId: number) {
    const log = await prisma.growthLog.findFirst({
      where: { id: logId, userId },
      select: { id: true, praiseJa: true },
    });

    if (!log) {
      throw new AppError(404, "LOG_NOT_FOUND", "로그를 찾을 수 없습니다.");
    }

    const result = await checkByText(userId, logId, log.praiseJa ?? "");
    await growthService.refreshSnapshot(userId);
    return result;
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

  async rewriteAndRecheck(userId: number, logId: number, revisedText: string) {
    const toolName = buildToolName();

    const log = await prisma.growthLog.findFirst({
      where: { id: logId, userId },
      select: { id: true, praiseJa: true },
    });

    if (!log) {
      throw new AppError(404, "LOG_NOT_FOUND", "로그를 찾을 수 없습니다.");
    }

    const beforeText = normalizeText(log.praiseJa ?? "");
    const afterText = normalizeText(revisedText);

    const beforeLatest = await prisma.jaCheckResult.findFirst({
      where: { logId },
      orderBy: { createdAt: "desc" },
      select: { id: true, issuesJson: true, issueCount: true },
    });

    let beforeResultId: number | null = beforeLatest?.id ?? null;
    let beforeScore: number | null = null;
    let beforeIssueCount: number | null = beforeLatest?.issueCount ?? null;

    if (!beforeLatest) {
      const base = await checkByText(userId, logId, beforeText);
      beforeResultId = base.resultId;
      beforeScore = Math.round(base.overall.score);
      beforeIssueCount = base.issues.length;
    } else if (beforeLatest?.issuesJson) {
      const json = beforeLatest.issuesJson as any;
      beforeScore =
        typeof json?.overall?.score === "number"
          ? Math.round(json.overall.score)
          : null;
    }

    if (beforeLatest?.issuesJson) {
      const json = beforeLatest.issuesJson as any;
      beforeScore =
        typeof json?.overall?.score === "number"
          ? Math.round(json.overall.score)
          : null;
    }

    const afterValidated = await checkByText(userId, logId, afterText);

    const afterResultId = afterValidated.resultId;
    const afterScore = Math.round(afterValidated.overall.score);
    const afterIssueCount = afterValidated.issues.length;

    const deltaIssueCount =
      typeof beforeIssueCount === "number"
        ? afterIssueCount - beforeIssueCount
        : null;
    const deltaScore =
      typeof beforeScore === "number" ? afterScore - beforeScore : null;

    const revision = await prisma.jaRevision.create({
      data: {
        logId,
        toolName,
        beforeText,
        afterText,
        beforeResultId: beforeResultId ?? undefined,
        afterResultId,
        beforeScore: beforeScore ?? undefined,
        afterScore,
        beforeIssueCount: beforeIssueCount ?? undefined,
        afterIssueCount,
        deltaIssueCount: deltaIssueCount ?? undefined,
      },
      select: { id: true },
    });

    await prisma.growthLog.update({
      where: { id: logId },
      data: { praiseJa: afterText },
    });

    await growthService.refreshSnapshot(userId);

    return {
      revisionId: revision.id,
      logId,
      before: {
        resultId: beforeResultId,
        score: beforeScore,
        issueCount: beforeIssueCount,
      },
      after: {
        resultId: afterResultId,
        score: afterScore,
        issueCount: afterIssueCount,
      },
      delta: {
        issueCount: deltaIssueCount,
        score: deltaScore,
      },
    };
  },

  async listRevisions(userId: number, logId: number, take: number = 20) {
    const owned = await prisma.growthLog.findFirst({
      where: { id: logId, userId },
      select: { id: true },
    });

    if (!owned) {
      throw new AppError(404, "LOG_NOT_FOUND", "로그를 찾을 수 없습니다.");
    }

    const revisions = await prisma.jaRevision.findMany({
      where: { logId },
      orderBy: { createdAt: "desc" },
      take,
      select: {
        id: true,
        createdAt: true,
        toolName: true,
        beforeResultId: true,
        afterResultId: true,
        beforeScore: true,
        afterScore: true,
        beforeIssueCount: true,
        afterIssueCount: true,
        deltaIssueCount: true,
      },
    });

    return { revisions };
  },

  async getRevisionDetail(userId: number, revisionId: number) {
    const rev = await prisma.jaRevision.findUnique({
      where: { id: revisionId },
      select: {
        id: true,
        logId: true,
        createdAt: true,
        toolName: true,
        beforeText: true,
        afterText: true,
        beforeResultId: true,
        afterResultId: true,
        beforeScore: true,
        afterScore: true,
        beforeIssueCount: true,
        afterIssueCount: true,
        deltaIssueCount: true,
      },
    });

    if (!rev) {
      throw new AppError(
        404,
        "REVISION_NOT_FOUND",
        "리비전 기록을 찾을 수 없습니다.",
      );
    }

    const owner = await prisma.growthLog.findFirst({
      where: { id: rev.logId, userId },
      select: { id: true },
    });

    if (!owner) {
      throw new AppError(404, "LOG_NOT_FOUND", "로그를 찾을 수 없습니다.");
    }

    const [beforeResult, afterResult] = await Promise.all([
      rev.beforeResultId
        ? prisma.jaCheckResult.findUnique({
            where: { id: rev.beforeResultId },
            select: {
              id: true,
              issuesJson: true,
              issueCount: true,
              toolName: true,
              createdAt: true,
            },
          })
        : Promise.resolve(null),

      rev.afterResultId
        ? prisma.jaCheckResult.findUnique({
            where: { id: rev.afterResultId },
            select: {
              id: true,
              issuesJson: true,
              issueCount: true,
              toolName: true,
              createdAt: true,
            },
          })
        : Promise.resolve(null),
    ]);

    if (!afterResult) {
      throw new AppError(
        500,
        "AFTER_RESULT_MISSING",
        "리비전의 after 결과가 없습니다.",
      );
    }

    const beforeScore =
      typeof (beforeResult?.issuesJson as any)?.overall?.score === "number"
        ? Math.round((beforeResult!.issuesJson as any).overall.score)
        : (rev.beforeScore ?? null);

    const afterScore =
      typeof (afterResult?.issuesJson as any)?.overall?.score === "number"
        ? Math.round((afterResult!.issuesJson as any).overall.score)
        : (rev.afterScore ?? null);

    const deltaScore =
      typeof beforeScore === "number" && typeof afterScore === "number"
        ? afterScore - beforeScore
        : null;

    function getIssues(feedback: any) {
      const issues = Array.isArray(feedback?.issues) ? feedback.issues : [];
      return issues.map((i: any) => ({
        issueId: i.issueId ?? null,
        ruleTag: i.ruleTag ?? "other",
        severity: i.severity ?? "low",
        problem: i.problem ?? "",
        why: i.why ?? "",
        selfCheckQuestion: i.selfCheckQuestion ?? "",
        rewriteTask: i.rewriteTask ?? "",
        span: i.span ?? { start: 0, end: 0 },
      }));
    }

    function issueKey(i: any) {
      return `${i.ruleTag}::${i.problem}`.trim();
    }

    const beforeFeedback = (beforeResult?.issuesJson as any) ?? null;
    const afterFeedback = (afterResult?.issuesJson as any) ?? null;

    const beforeIssues = getIssues(beforeFeedback);
    const afterIssues = getIssues(afterFeedback);

    const beforeMap = new Map(beforeIssues.map((i: any) => [issueKey(i), i]));
    const afterMap = new Map(afterIssues.map((i: any) => [issueKey(i), i]));

    const resolvedIssues = beforeIssues.filter(
      (i: any) => !afterMap.has(issueKey(i)),
    );
    const remainingIssues = afterIssues.filter((i: any) =>
      beforeMap.has(issueKey(i)),
    );
    const newIssues = afterIssues.filter(
      (i: any) => !beforeMap.has(issueKey(i)),
    );

    return {
      revision: {
        ...rev,
        before: {
          resultId: beforeResult?.id ?? null,
          score: beforeScore,
          issueCount: beforeResult?.issueCount ?? rev.beforeIssueCount ?? null,
          feedback: (beforeResult?.issuesJson as any) ?? null,
        },
        after: {
          resultId: afterResult?.id ?? null,
          score: afterScore,
          issueCount: afterResult?.issueCount ?? rev.afterIssueCount ?? null,
          feedback: (afterResult?.issuesJson as any) ?? null,
        },
        delta: {
          issueCount: rev.deltaIssueCount ?? null,
          score: deltaScore,
        },
        compare: {
          resolvedIssues,
          remainingIssues,
          newIssues,
        },
      },
    };
  },
};
