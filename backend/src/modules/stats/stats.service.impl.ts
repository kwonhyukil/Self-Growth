import { prisma } from "../../shared/infra/prisma";

type Severity = "low" | "medium" | "high";

function safeIssues(feedback: any): any[] {
  const arr = feedback?.issues;
  return Array.isArray(arr) ? arr : [];
}

function focusMessage(ruleTag: string) {
  const map: Record<string, { message: string; action: string }> = {
    particle: {
      message:
        "조사(は/が/を/に) 선택이 자주 지적됩니다. 문장 내 역할을 먼저 분리해보세요.",
      action:
        "주어/목적어/목적지 표시가 필요한지 체크하고 조사만 바꿔서 1회 재작성",
    },
    naturalness: {
      message:
        "자연스러움(표현의 어색함)이 자주 나옵니다. 현지에서 흔한 표현으로 바꿔보세요.",
      action: "어색한 구절 1개만 골라 더 자연스러운 말로 치환",
    },
    collocation: {
      message:
        "연어(자주 함께 쓰는 표현)가 약점입니다. 더 흔한 조합을 우선해보세요.",
      action: "동사+목적어 조합을 1개 바꿔서 다시 작성",
    },
    kanji_kana: {
      message:
        "한자/가나 표기 흔들림이 보입니다. 표기를 통일하면 안정감이 올라갑니다.",
      action: "같은 단어는 한자 또는 히라가나 중 하나로 통일",
    },
    word_choice: {
      message:
        "단어 선택이 자주 지적됩니다. 의미는 유지하고 더 일반적인 단어로 바꿔보세요.",
      action: "동의어 후보 중 더 흔한 단어로 1개 교체",
    },
    style_mix: {
      message:
        "문체 혼용이 보일 수 있습니다. 한 문장 안에서만이라도 톤을 맞춰보세요.",
      action: "です/ます 또는 だ/です 둘 중 하나로 1문장만 통일",
    },
    other: {
      message:
        "전반적으로 개선 여지가 있습니다. 먼저 문장을 1~2문장 더 구체화해보세요.",
      action: "상대/상황/결과 중 2개를 추가",
    },
  };
  return map[ruleTag] ?? map.other;
}

function coachQuestion(ruleTag: string) {
  const map: Record<string, string> = {
    particle:
      "이 문장에서 주어/목적어/장소를 표시하는 조사를 각각 하나씩 확인해볼까요?",
    naturalness:
      "어색하다고 느끼는 구절 1개를 골라 더 자연스러운 말로 바꿔볼까요?",
    collocation: "동사+목적어 조합 중 하나를 더 흔한 조합으로 바꿔볼까요?",
    kanji_kana:
      "표기가 흔들린 단어 1개를 골라 한자/히라가나 중 하나로 통일해볼까요?",
    word_choice:
      "의미는 같지만 더 자주 쓰는 단어로 바꿀 수 있는 부분이 있을까요?",
    style_mix: "한 문장 안에서 です/ます 또는 だ 체 중 하나로 통일해볼까요?",
    other: "상대/상황/결과 중 2가지를 추가해서 문장을 더 구체화해볼까요?",
  };
  return map[ruleTag] ?? map.other;
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

    const trendBase = [...map.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, v]) => ({ date, ...v }));

    let running = 0;
    const trend = trendBase.map((t) => {
      running += t.deltaIssueCount;
      return { ...t, cumulativeDeltaIssueCount: running };
    });

    const afterIds = Array.from(
      new Set(
        revisions
          .map((r) => r.afterResultId)
          .filter((v): v is number => typeof v === "number"),
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
        select: { id: true, issuesJson: true },
      });

      for (const r of results) {
        const feedback = r.issuesJson as any;
        const issues = safeIssues(feedback);

        for (const issue of issues) {
          const tag =
            typeof issue?.ruleTag === "string" ? issue.ruleTag : "other";
          const sev = issue?.severity as Severity;

          ruleTagCount.set(tag, (ruleTagCount.get(tag) ?? 0) + 1);

          if (sev === "low" || sev === "medium" || sev === "high") {
            severityDistribution[sev] += 1;
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

    const totalRevisions30d = qualityRows.length;
    const nullDeltaCount30d = qualityRows.filter(
      (r) => r.deltaIssueCount == null,
    ).length;
    const zeroDeltaCount30d = qualityRows.filter(
      (r) => r.deltaIssueCount === 0,
    ).length;

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
      .map((x: any) => x.ruleTag)
      .filter((tag: string) => tag !== weekRuleTag && tag !== monthRuleTag)
      .slice(0, 2)
      .map((tag: string) => ({
        ruleTag: tag,
        message: focusMessage(tag).message,
      }));

    const coach = {
      week: {
        focusRuleTag: weekRuleTag,
        why: d7.ruleTagTop?.length
          ? "최근 7일 기준 가장 자주 지적된 유형입니다."
          : "최근 7일 데이터가 부족하여 30일 기준으로 추천합니다.",
        oneAction: weekFocus.action,
        nextQuestion: coachQuestion(weekRuleTag),
      },
      month: {
        focusRuleTag: monthRuleTag,
        why: "최근 30일 기준 가장 자주 지적된 유형입니다.",
        oneAction: monthFocus.action,
        nextQuestion: coachQuestion(monthRuleTag),
      },
    };

    return {
      ja: { d7, d30 },
      insights: {
        weekTopFocus: { ruleTag: weekRuleTag, ...weekFocus },
        monthTopFocus: { ruleTag: monthRuleTag, ...monthFocus },
        nextTargets,
      },
      coach,
      dataQuality: {
        totalRevisions30d,
        nullDeltaCount30d,
        zeroDeltaCount30d,
      },
    };
  },
};
