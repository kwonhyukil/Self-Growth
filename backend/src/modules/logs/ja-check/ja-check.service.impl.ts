import { AppError } from "../../../shared/errors/AppError";
import { prisma } from "../../../shared/infra/prisma";
import { buildToolName } from "../../../shared/config/ja-check.config";
import { growthService } from "../../stats/growth/growth.service";
import { feedbackAgentService } from "../../ai/feedback/feedback-agent.service";

function normalizeText(s: string) {
  return s.trim().replace(/\s+/g, " ");
}

export const jaCheckService = {
  async check(userId: number, logId: number) {
    return feedbackAgentService.runForLog(userId, logId);
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
      throw new AppError(404, "RESULT_NOT_FOUND", "검사 결과를 찾을 수 없습니다.");
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
      const base = await feedbackAgentService.runByText(userId, logId, beforeText);
      beforeResultId = base.resultId;
      beforeScore = Math.round(base.overall.score);
      beforeIssueCount = base.issues.length;
    } else if (beforeLatest.issuesJson) {
      const json = beforeLatest.issuesJson as any;
      beforeScore =
        typeof json?.overall?.score === "number"
          ? Math.round(json.overall.score)
          : null;
    }

    const afterValidated = await feedbackAgentService.runByText(
      userId,
      logId,
      afterText,
    );

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
      throw new AppError(404, "REVISION_NOT_FOUND", "리비전 기록을 찾을 수 없습니다.");
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
      throw new AppError(500, "AFTER_RESULT_MISSING", "리비전의 after 결과가 없습니다.");
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
