import { AppError } from "../../shared/errors/AppError";
import { prisma } from "../../shared/infra/prisma";
import { CreateLogBody, UpdateLogBody } from "./logs.schema";
import { callGptStructuredJson } from "../../shared/infra/gpt";
import { growthService } from "../stats/growth/growth.service";

// ── 백그라운드 JaCheck 자동 실행 ─────────────────────────────
// 순환 의존 방지: jaCheck.service를 setImmediate + dynamic import로 로드
function scheduleAutoJaCheck(logId: number, userId: number) {
  setImmediate(async () => {
    try {
      // dynamic import로 순환 의존 방지
      const mod = await import("./ja-check/ja-check.service");
      const { jaCheckService } = mod;
      await jaCheckService.check(userId, logId);
      // JaCheck 완료 후 성장 스냅샷 갱신
      await growthService.refreshSnapshot(userId);
    } catch (err) {
      console.error("[AUTO-JA-CHECK] logId=%d error:", logId, err);
    }
  });
}

export const logsService = {
  // ── 생성 ──────────────────────────────────────────────────
  async create(userId: number, body: CreateLogBody) {
    const log = await prisma.growthLog.create({
      data: {
        userId,
        happenedAt: new Date(body.happenedAt),
        moodTag: body.moodTag,
        moodIntensity: body.moodIntensity ?? null,
        triggerKo: body.triggerKo,
        specificEvent: body.specificEvent ?? null,
        praiseKo: body.praiseKo,
        praiseJa: body.praiseJa ?? null,  // optional
      },
      select: {
        id: true,
        userId: true,
        happenedAt: true,
        moodTag: true,
        moodIntensity: true,
        triggerKo: true,
        specificEvent: true,
        praiseKo: true,
        praiseJa: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // praiseJa가 있으면 백그라운드에서 AI 분석 자동 시작
    if (log.praiseJa) {
      scheduleAutoJaCheck(log.id, userId);
    } else {
      // praiseJa 없어도 성장 스냅샷(consistency/positivity)은 갱신
      setImmediate(() => growthService.refreshSnapshot(userId).catch(() => {}));
    }

    return { log };
  },

  // ── 목록 조회 ──────────────────────────────────────────────
  async list(userId: number) {
    const logs = await prisma.growthLog.findMany({
      where: { userId },
      orderBy: { happenedAt: "desc" },
      select: {
        id: true,
        happenedAt: true,
        moodTag: true,
        moodIntensity: true,
        triggerKo: true,
        specificEvent: true,
        praiseKo: true,
        praiseJa: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return { logs };
  },

  // ── 단건 조회 ──────────────────────────────────────────────
  async getById(userId: number, id: number) {
    const log = await prisma.growthLog.findFirst({
      where: { id, userId },
      select: {
        id: true,
        happenedAt: true,
        moodTag: true,
        moodIntensity: true,
        triggerKo: true,
        specificEvent: true,
        praiseKo: true,
        praiseJa: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!log) {
      throw new AppError(404, "LOG_NOT_FOUND", "로그를 찾을 수 없습니다.");
    }

    return { log };
  },

  // ── 수정 ──────────────────────────────────────────────────
  async update(userId: number, id: number, body: UpdateLogBody) {
    const exists = await prisma.growthLog.findFirst({
      where: { id, userId },
      select: { id: true },
    });

    if (!exists) {
      throw new AppError(404, "LOG_NOT_FOUND", "로그를 찾을 수 없습니다.");
    }

    const log = await prisma.growthLog.update({
      where: { id },
      data: {
        ...(body.happenedAt && { happenedAt: new Date(body.happenedAt) }),
        ...(body.moodTag && { moodTag: body.moodTag }),
        ...(body.moodIntensity !== undefined && { moodIntensity: body.moodIntensity }),
        ...(body.triggerKo && { triggerKo: body.triggerKo }),
        ...(body.specificEvent !== undefined && { specificEvent: body.specificEvent }),
        ...(body.praiseKo && { praiseKo: body.praiseKo }),
        ...(body.praiseJa !== undefined && { praiseJa: body.praiseJa }),
      },
      select: {
        id: true,
        userId: true,
        happenedAt: true,
        moodTag: true,
        moodIntensity: true,
        triggerKo: true,
        specificEvent: true,
        praiseKo: true,
        praiseJa: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // praiseJa가 새로 추가/변경됐으면 재분석
    if (body.praiseJa && log.praiseJa) {
      scheduleAutoJaCheck(id, userId);
    }

    return { log };
  },

  // ── 삭제 ──────────────────────────────────────────────────
  async remove(userId: number, id: number) {
    const exists = await prisma.growthLog.findFirst({
      where: { id, userId },
      select: { id: true },
    });
    if (!exists) {
      throw new AppError(404, "LOG_NOT_FOUND", "로그를 찾을 수 없습니다.");
    }

    await prisma.growthLog.delete({ where: { id } });
    // 삭제 후 성장 스냅샷 갱신
    setImmediate(() => growthService.refreshSnapshot(userId).catch(() => {}));
    return { deleted: true };
  },

  // ── AI 일본어 초안 생성 ───────────────────────────────────
  async generateDraftJa(userId: number, logId: number) {
    const log = await prisma.growthLog.findFirst({
      where: { id: logId, userId },
      select: { praiseKo: true },
    });

    if (!log) {
      throw new AppError(404, "LOG_NOT_FOUND", "로그를 찾을 수 없습니다.");
    }

    const result = await callGptStructuredJson<{ draftJa: string }>({
      model: process.env.GPT_MODEL ?? "gpt-4.1-mini",
      prompt: [
        "다음 한국어 자기 칭찬 문장을 자연스러운 일본어로 번역해주세요.",
        "반말(친근한 말투)과 존댓말(です/ます)을 섞지 말고 하나를 일관되게 사용하세요.",
        "20자~200자 사이의 일본어 문장으로 작성해주세요.",
        "",
        `한국어: ${log.praiseKo}`,
      ].join("\n"),
      schemaName: "draft_ja_result",
      schema: {
        type: "object",
        properties: {
          draftJa: {
            type: "string",
            description: "자연스러운 일본어 번역 결과 (20~200자)",
          },
        },
        required: ["draftJa"],
        additionalProperties: false,
      },
      maxOutputTokens: 300,
    });

    return { draftJa: result.draftJa };
  },
};
