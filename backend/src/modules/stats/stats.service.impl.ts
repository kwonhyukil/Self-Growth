import { prisma } from "../../shared/infra/prisma";
import { buildDashboardCoach } from "./dashboard-coach";

type Severity = "low" | "medium" | "high";

function safeIssues(feedback: unknown): any[] {
  const arr = (feedback as { issues?: unknown[] } | null)?.issues;
  return Array.isArray(arr) ? arr : [];
}

export const statsService = {
  async moodCount(userId: number) {
    const grouped = await prisma.growthLog.groupBy({
      by: ["moodTag"],
      where: { userId },
      _count: {
        moodTag: true,
      },
    });

    const result: Record<string, number> = {};

    for (const item of grouped) {
      result[item.moodTag] = item._count.moodTag;
    }

    return { stats: result };
  },

  async last7DaysCount(userId: number) {
    const from = new Date();
    from.setDate(from.getDate() - 7);

    const count = await prisma.growthLog.count({
      where: {
        userId,
        happenedAt: { gte: from },
      },
    });

    return { count };
  },

  async summary(userId: number) {
    const from = new Date();
    from.setDate(from.getDate() - 7);

    const [
      totalLogs,
      last7DaysCount,
      grouped,
      recentLogs,
      streakResult,
      dashboardResult,
    ] = await Promise.all([
      prisma.growthLog.count({ where: { userId } }),
      prisma.growthLog.count({
        where: { userId, happenedAt: { gte: from } },
      }),
      prisma.growthLog.groupBy({
        by: ["moodTag"],
        where: { userId },
        _count: { moodTag: true },
      }),
      prisma.growthLog.findMany({
        where: { userId },
        orderBy: { happenedAt: "desc" },
        take: 5,
        select: {
          id: true,
          happenedAt: true,
          moodTag: true,
          triggerKo: true,
          createdAt: true,
        },
      }),
      this.streak(userId),
      this.dashboard(userId),
    ]);

    const moodCount: Record<string, number> = {};
    for (const item of grouped) moodCount[item.moodTag] = item._count.moodTag;

    return {
      totalLogs,
      last7DaysCount,
      moodCount,
      recentLogs,
      streak: streakResult.streak,
      dashboard: dashboardResult,
    };
  },

  async streak(userId: number) {
    const logs = await prisma.growthLog.findMany({
      where: { userId },
      select: { happenedAt: true },
      orderBy: { happenedAt: "desc" },
    });

    if (logs.length === 0) return { streak: 0 };

    const dateSet = new Set(
      logs.map((log) => log.happenedAt.toISOString().split("T")[0]),
    );

    let streak = 0;
    let current = new Date();
    current.setHours(0, 0, 0, 0);

    while (true) {
      const dateStr = current.toISOString().split("T")[0];
      if (!dateSet.has(dateStr)) break;
      streak++;
      current.setDate(current.getDate() - 1);
    }

    return { streak };
  },

  async jaImprovement(userId: number, days: number = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const revisions = await prisma.jaRevision.findMany({
      where: {
        createdAt: { gte: since },
        log: { userId },
      },
      select: {
        createdAt: true,
        deltaIssueCount: true,
        afterResultId: true,
      },
    });

    const totalRevisions = revisions.length;
    const totalDeltaIssueCount = revisions.reduce(
      (acc, r) => acc + (r.deltaIssueCount ?? 0),
      0,
    );

    const avgDeltaIssueCount =
      totalRevisions > 0 ? totalDeltaIssueCount / totalRevisions : 0;

    const groupedByDate = new Map<
      string,
      { deltaIssueCount: number; revisions: number }
    >();

    for (const revision of revisions) {
      const date = revision.createdAt.toISOString().slice(0, 10);
      const current = groupedByDate.get(date) ?? {
        deltaIssueCount: 0,
        revisions: 0,
      };

      current.deltaIssueCount += revision.deltaIssueCount ?? 0;
      current.revisions += 1;
      groupedByDate.set(date, current);
    }

    const trendBase = [...groupedByDate.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, value]) => ({ date, ...value }));

    let running = 0;
    const trend = trendBase.map((entry) => {
      running += entry.deltaIssueCount;
      return { ...entry, cumulativeDeltaIssueCount: running };
    });

    const afterIds = Array.from(
      new Set(
        revisions
          .map((revision) => revision.afterResultId)
          .filter((value): value is number => typeof value === "number"),
      ),
    );

    const severityDistribution: Record<Severity, number> = {
      low: 0,
      medium: 0,
      high: 0,
    };
    const ruleTagCount = new Map<string, number>();

    if (afterIds.length > 0) {
      const results = await prisma.jaCheckResult.findMany({
        where: { id: { in: afterIds } },
        select: { issuesJson: true },
      });

      for (const result of results) {
        const issues = safeIssues(result.issuesJson);

        for (const issue of issues) {
          const tag =
            typeof issue?.ruleTag === "string" ? issue.ruleTag : "other";
          const severity = issue?.severity as Severity;

          ruleTagCount.set(tag, (ruleTagCount.get(tag) ?? 0) + 1);

          if (severity === "low" || severity === "medium" || severity === "high") {
            severityDistribution[severity] += 1;
          } else {
            severityDistribution.low += 1;
          }
        }
      }
    }

    const ruleTagTop = [...ruleTagCount.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([ruleTag, count]) => ({ ruleTag, count }));

    return {
      days,
      totalRevisions,
      totalDeltaIssueCount,
      avgDeltaIssueCount,
      severityDistribution,
      ruleTagTop,
      trend,
    };
  },

  async dashboard(userId: number) {
    const [d7, d30] = await Promise.all([
      this.jaImprovement(userId, 7),
      this.jaImprovement(userId, 30),
    ]);

    const since30 = new Date();
    since30.setDate(since30.getDate() - 30);

    const qualityRows = await prisma.jaRevision.findMany({
      where: { createdAt: { gte: since30 }, log: { userId } },
      select: { deltaIssueCount: true },
    });

    return buildDashboardCoach(d7, d30, qualityRows);
  },
};
