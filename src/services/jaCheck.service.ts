import { AppError } from "../utils/AppError";
import { prisma } from "../utils/prisma";

export const jaCheckService = {
  async check(userId: number, logId: number) {
    const log = await prisma.growthLog.findFirst({
      where: { id: logId, userId },
      select: { id: true, praiseJa: true },
    });

    if (!log) {
      throw new AppError(404, "LOG_NOT_FOUND", "로그를 찾을 수 없습니다.");
    }

    const { issues, issueCount } = mockCheckJa(log.praiseJa);

    await prisma.jaCheckResult.create({
      data: {
        logId: log.id,
        toolName: "mock-checker",
        originalText: log.praiseJa,
        issuesJson: issues,
        issueCount,
      },
    });

    return {
      logId: log.id,
      issueCount,
      issues,
    };
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

function mockCheckJa(text: string) {
  const t = text.trim();
  const issues: Array<{
    message: string;
    severity: "info" | "warning" | "error";
    hint?: string;
  }> = [];

  // 1) 너무 짧음
  if (t.length < 15) {
    issues.push({
      message: "문장이 짧아서 뉘앙스가 부족할 수 있습니다.",
      severity: "warning",
      hint: "이유(なぜ) 또는 결과(どうなった) 한 문장을 추가해보세요.",
    });
  }

  // 2) 문장 끝 마침표 체크(일본어는 보통 。)
  if (t.length > 0 && !/[。！？!]$/.test(t)) {
    issues.push({
      message: "문장이 '。/！/？'로 끝나지 않습니다.",
      severity: "info",
      hint: "문장 끝을 '。'로 정리하면 자연스러워집니다.",
    });
  }

  // 3) 한글 포함 여부(일본어 칸에 한글이 섞이면 경고)
  if (/[ㄱ-ㅎㅏ-ㅣ가-힣]/.test(t)) {
    issues.push({
      message: "일본어 문장에 한글이 포함되어 있습니다.",
      severity: "warning",
      hint: "한글 표현을 일본어로 바꿔보세요.",
    });
  }

  // 4) 구두점/공백 반복(오타 감지)
  if (/ {2,}/.test(t) || /。。+/.test(t) || /、、+/.test(t)) {
    issues.push({
      message: "공백 또는 구두점이 반복됩니다(오타 가능).",
      severity: "info",
      hint: "연속된 공백/구두점을 정리해보세요.",
    });
  }

  // 5) です/ます 체 vs だ/である 체 혼용(아주 단순 버전)
  const hasDesuMasu = /(です|ます)/.test(t);
  const hasDaStyle = /(だ|である)$/.test(t);
  if (hasDesuMasu && hasDaStyle) {
    issues.push({
      message: "문체가 혼용될 수 있습니다(です/ます vs だ/である).",
      severity: "info",
      hint: "한 가지 문체로 통일하면 더 자연스럽습니다.",
    });
  }

  return { issues, issueCount: issues.length };
}
