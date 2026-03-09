/**
 * growth.service.ts
 * ─────────────────────────────────────────────────────────────
 * Growth System: Dog 레벨 + 레이더 차트 5축 계산 및 캐싱
 *
 * 레이더 5축 정의:
 *   vocabulary      — JaCheck issueCount 기반 어휘 다양성
 *   grammarAccuracy — 문법/조사 관련 이슈 빈도의 역수
 *   consistency     — 연속 기록 일수(streak) + 최근 활동량
 *   positivity      — 긍정적 Mood 비율
 *   revisionEffort  — 교정(rewrite) 횟수와 개선 델타
 *
 * Dog 레벨 기준:
 *   BABY   — 총 로그 < 5
 *   JUNIOR — 총 로그 >= 5, streak < 7
 *   SENIOR — 총 로그 >= 5, streak >= 7, radarAvg < 70
 *   MASTER — 총 로그 >= 5, streak >= 7, radarAvg >= 70
 *
 * Dog 감정 기준:
 *   HAPPY   — 오늘 로그 있음
 *   NEUTRAL — 어제 로그 있음
 *   SAD     — 2일 이상 공백
 */

import { DogLevel, DogEmotion } from "@prisma/client";
import { prisma } from "../../../shared/infra/prisma";

// ── 상수 ────────────────────────────────────────────────────

const POSITIVE_MOODS = new Set([
  "JOY",
  "PROUD",
  "GRATEFUL",
  "EXCITED",
  "CONFIDENT",
  "HOPEFUL",
  "CONNECTED",
  "MOTIVATED",
]);
const NEUTRAL_MOODS = new Set(["CALM", "RELIEVED"]);

// 문법/조사 관련 rule tag
const GRAMMAR_TAGS = new Set([
  "particle",
  "grammar",
  "conjugation",
  "tense",
  "politeness",
]);

// ── 헬퍼 함수 ────────────────────────────────────────────────

function computeStreak(dates: Date[]): number {
  if (dates.length === 0) return 0;

  const sorted = [...dates]
    .map((d) => {
      const dt = new Date(d);
      dt.setHours(0, 0, 0, 0);
      return dt.getTime();
    })
    .filter((v, i, a) => a.indexOf(v) === i) // 중복 날짜 제거
    .sort((a, b) => b - a); // 최신순

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayMs = today.getTime();
  const dayMs = 86400000;

  // 오늘 또는 어제부터 시작해야 streak 유효
  if (sorted[0] < todayMs - dayMs) return 0;

  let streak = 1;
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i - 1] - sorted[i] === dayMs) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

function computeDogLevel(
  totalLogs: number,
  streak: number,
  radarAvg: number
): DogLevel {
  if (totalLogs < 5) return DogLevel.BABY;
  if (streak >= 7 && radarAvg >= 70) return DogLevel.MASTER;
  if (streak >= 7) return DogLevel.SENIOR;
  return DogLevel.JUNIOR;
}

function computeDogEmotion(lastLogDate: Date | null): DogEmotion {
  if (!lastLogDate) return DogEmotion.SAD;
  const now = new Date();
  const last = new Date(lastLogDate);
  // 날짜 기준 (시간 무시)
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const lastStart = new Date(
    last.getFullYear(),
    last.getMonth(),
    last.getDate()
  );
  const diffDays = Math.round(
    (todayStart.getTime() - lastStart.getTime()) / 86400000
  );

  if (diffDays === 0) return DogEmotion.HAPPY;
  if (diffDays === 1) return DogEmotion.NEUTRAL;
  return DogEmotion.SAD;
}

// ── 점수 계산 (각 0-100) ─────────────────────────────────────

function calcVocabulary(avgIssueCount: number): number {
  // 평균 이슈 수가 낮을수록 어휘/표현 능숙도 높음
  // 0 이슈 → 100점, 5개 이슈 → 0점 (선형)
  return Math.max(0, Math.round(100 - avgIssueCount * 20));
}

function calcGrammarAccuracy(avgGrammarIssues: number): number {
  // 문법 이슈 수 기준
  // 0 → 100, 5개 → 0점
  return Math.max(0, Math.round(100 - avgGrammarIssues * 25));
}

function calcConsistency(streak: number, logsLast30: number): number {
  // streak × 7 (최대 49) + 최근30일 활동 × 1.7 (최대 51)
  const streakScore = Math.min(49, streak * 7);
  const activityScore = Math.min(51, Math.round(logsLast30 * 1.7));
  return streakScore + activityScore;
}

function calcPositivity(
  positiveLogs: number,
  neutralLogs: number,
  totalLogs: number
): number {
  if (totalLogs === 0) return 0;
  // 긍정 × 1.0 + 중립 × 0.5
  const weighted = positiveLogs + neutralLogs * 0.5;
  return Math.min(100, Math.round((weighted / totalLogs) * 100));
}

function calcRevisionEffort(
  totalRevisions: number,
  positiveDeltas: number
): number {
  // 교정 횟수 × 15 (최대 60) + 개선 성공 × 10 (최대 40)
  const revScore = Math.min(60, totalRevisions * 15);
  const deltaScore = Math.min(40, positiveDeltas * 10);
  return revScore + deltaScore;
}

function calcVerbalizationClarity(
  completedSessions: number,
  avgScore: number
): number {
  // 완료된 세션 수 × 10 (최대 50) + 평균 점수 × 0.5 (최대 50)
  const sessionScore = Math.min(50, completedSessions * 10);
  const qualityScore = Math.min(50, Math.round(avgScore * 0.5));
  return sessionScore + qualityScore;
}

// ── 메인 서비스 ──────────────────────────────────────────────

export const growthService = {
  /** 캐시된 스냅샷 반환 (없으면 즉시 계산 후 저장) */
  async getSnapshot(userId: number) {
    const existing = await prisma.userGrowthSnapshot.findUnique({
      where: { userId },
    });
    if (existing) return existing;
    return this.refreshSnapshot(userId);
  },

  /** DB 데이터로부터 재계산 후 upsert */
  async refreshSnapshot(userId: number) {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000);

    // ── 병렬로 데이터 수집 ──
    const [logs, allChecks, revisions, verbSessions] = await Promise.all([
      prisma.growthLog.findMany({
        where: { userId },
        select: { moodTag: true, happenedAt: true },
        orderBy: { happenedAt: "desc" },
      }),
      prisma.jaCheckResult.findMany({
        where: { log: { userId } },
        select: { issueCount: true, issuesJson: true },
      }),
      prisma.jaRevision.findMany({
        where: { log: { userId } },
        select: { deltaIssueCount: true },
      }),
      prisma.verbalizationSession.findMany({
        where: { userId, completedSteps: 3 },
        select: { verbalizationScore: true },
      }),
    ]);

    const totalLogs = logs.length;
    const lastLogDate = logs[0]?.happenedAt ?? null;

    // ── streak & 최근 30일 ──
    const streak = computeStreak(logs.map((l) => l.happenedAt));
    const logsLast30 = logs.filter(
      (l) => new Date(l.happenedAt) >= thirtyDaysAgo
    ).length;

    // ── JaCheck 통계 ──
    const totalChecks = allChecks.length;
    const totalIssues = allChecks.reduce((s, c) => s + c.issueCount, 0);
    const avgIssueCount = totalChecks > 0 ? totalIssues / totalChecks : 0;

    // 문법 이슈만 필터 (issuesJson이 배열인 경우)
    let totalGrammarIssues = 0;
    for (const check of allChecks) {
      const issues = check.issuesJson as Array<{ ruleTag?: string }>;
      if (!Array.isArray(issues)) continue;
      totalGrammarIssues += issues.filter(
        (i) => i?.ruleTag && GRAMMAR_TAGS.has(i.ruleTag)
      ).length;
    }
    const avgGrammarIssues =
      totalChecks > 0 ? totalGrammarIssues / totalChecks : 0;

    // ── Mood 통계 ──
    let positiveLogs = 0;
    let neutralLogs = 0;
    for (const log of logs) {
      if (POSITIVE_MOODS.has(log.moodTag)) positiveLogs++;
      else if (NEUTRAL_MOODS.has(log.moodTag)) neutralLogs++;
    }

    // ── Revision 통계 ──
    const totalRevisions = revisions.length;
    const positiveDeltas = revisions.filter(
      (r) => (r.deltaIssueCount ?? 0) < 0 // 이슈 감소 = 개선
    ).length;

    // ── 언어화 세션 통계 ──
    const completedVerbSessions = verbSessions.length;
    const avgVerbScore =
      completedVerbSessions > 0
        ? verbSessions.reduce((s, v) => s + (v.verbalizationScore ?? 0), 0) /
          completedVerbSessions
        : 0;

    // ── 6축 계산 ──
    const vocabulary = totalChecks > 0 ? calcVocabulary(avgIssueCount) : 0;
    const grammarAccuracy =
      totalChecks > 0 ? calcGrammarAccuracy(avgGrammarIssues) : 0;
    const consistency = calcConsistency(streak, logsLast30);
    const positivity = calcPositivity(positiveLogs, neutralLogs, totalLogs);
    const revisionEffort = calcRevisionEffort(totalRevisions, positiveDeltas);
    const verbalizationClarity = calcVerbalizationClarity(
      completedVerbSessions,
      avgVerbScore
    );

    const radarAvgScore =
      (vocabulary +
        grammarAccuracy +
        consistency +
        positivity +
        revisionEffort +
        verbalizationClarity) /
      6;

    // ── Dog 상태 ──
    const dogLevel = computeDogLevel(totalLogs, streak, radarAvgScore);
    const dogEmotion = computeDogEmotion(lastLogDate);

    // ── Upsert ──
    return prisma.userGrowthSnapshot.upsert({
      where: { userId },
      create: {
        userId,
        dogLevel,
        dogEmotion,
        vocabulary,
        grammarAccuracy,
        consistency,
        positivity,
        revisionEffort,
        verbalizationClarity,
        radarAvgScore,
        computedAt: now,
      },
      update: {
        dogLevel,
        dogEmotion,
        vocabulary,
        grammarAccuracy,
        consistency,
        positivity,
        revisionEffort,
        verbalizationClarity,
        radarAvgScore,
        computedAt: now,
      },
    });
  },
};
