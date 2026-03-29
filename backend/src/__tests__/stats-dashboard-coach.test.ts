import { buildDashboardCoach } from "../modules/stats/dashboard-coach";

describe("buildDashboardCoach", () => {
  it("shares the top monthly fallback when 7-day data is empty", () => {
    const result = buildDashboardCoach(
      { ruleTagTop: [] },
      {
        ruleTagTop: [
          { ruleTag: "particle", count: 4 },
          { ruleTag: "naturalness", count: 2 },
          { ruleTag: "style_mix", count: 1 },
        ],
      },
      [{ deltaIssueCount: -1 }, { deltaIssueCount: 0 }, { deltaIssueCount: null }],
    );

    expect(result.coach.week.focusRuleTag).toBe("particle");
    expect(result.coach.month.focusRuleTag).toBe("naturalness");
    expect(result.insights.nextTargets).toEqual([
      { ruleTag: "style_mix", message: expect.any(String) },
    ]);
    expect(result.dataQuality).toEqual({
      totalRevisions30d: 3,
      nullDeltaCount30d: 1,
      zeroDeltaCount30d: 1,
    });
  });

  it("keeps distinct weekly and monthly focuses when both exist", () => {
    const result = buildDashboardCoach(
      {
        ruleTagTop: [
          { ruleTag: "word_choice", count: 3 },
          { ruleTag: "collocation", count: 2 },
        ],
      },
      {
        ruleTagTop: [
          { ruleTag: "naturalness", count: 5 },
          { ruleTag: "style_mix", count: 3 },
          { ruleTag: "kanji_kana", count: 1 },
        ],
      },
      [],
    );

    expect(result.coach.week.focusRuleTag).toBe("word_choice");
    expect(result.coach.month.focusRuleTag).toBe("naturalness");
    expect(result.insights.nextTargets).toEqual([
      { ruleTag: "style_mix", message: expect.any(String) },
      { ruleTag: "kanji_kana", message: expect.any(String) },
    ]);
  });
});
