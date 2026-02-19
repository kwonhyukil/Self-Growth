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
};
