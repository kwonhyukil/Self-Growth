import { prisma } from "../utils/prisma";

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

    const [totalLogs, last7DaysCount, grouped, recentLogs, streakResult] =
      await Promise.all([
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
      ]);

    const moodCount: Record<string, number> = {};
    for (const item of grouped) moodCount[item.moodTag] = item._count.moodTag;

    return {
      totalLogs,
      last7DaysCount,
      moodCount,
      recentLogs,
      streak: streakResult.streak,
    };
  },
  async streak(userId: number) {
    const logs = await prisma.growthLog.findMany({
      where: { userId },
      select: { happenedAt: true },
      orderBy: { happenedAt: "desc" },
    });

    if (logs.length === 0) return { streak: 0 };

    const dates = [
      ...new Set(logs.map((log) => log.happenedAt.toISOString().split("T")[0])),
    ];

    let streak = 0;
    let current = new Date();
    current.setHours(0, 0, 0, 0);

    for (let i = 0; i < dates.length; i++) {
      const dateStr = current.toISOString().split("T")[0];

      if (dates.includes(dateStr)) {
        streak++;
        current.setDate(current.getDate() - 1);
      } else {
        break;
      }
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
      },
    });

    const totalRevisions = revisions.length;
    const totalDeltaIssueCount = revisions.reduce(
      (acc, r) => acc + (r.deltaIssueCount ?? 0),
      0,
    );

    const avgDeltaIssueCount =
      totalRevisions > 0 ? totalDeltaIssueCount / totalRevisions : 0;

    const map = new Map<
      string,
      { deltaIssueCount: number; revisions: number }
    >();

    for (const r of revisions) {
      const d = r.createdAt.toISOString().slice(0, 10);
      const cur = map.get(d) ?? { deltaIssueCount: 0, revisions: 0 };
      cur.deltaIssueCount += r.deltaIssueCount ?? 0;
      cur.revisions += 1;
      map.set(d, cur);
    }

    const trend = [...map.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, v]) => ({ date, ...v }));

    return {
      days,
      totalRevisions,
      totalDeltaIssueCount,
      avgDeltaIssueCount,
      trend,
    };
  },
};
