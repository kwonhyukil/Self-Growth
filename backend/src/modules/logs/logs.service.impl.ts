import { AppError } from "../../shared/errors/AppError";
import { prisma } from "../../shared/infra/prisma";
import { CreateLogBody, UpdateLogBody } from "./logs.schema";
import { callGptStructuredJson } from "../../shared/infra/gpt";
import { growthService } from "../stats/growth/growth.service";

function scheduleAutoJaCheck(logId: number, userId: number) {
  setImmediate(async () => {
    try {
      const mod = await import("./ja-check/ja-check.service");
      const { jaCheckService } = mod;
      await jaCheckService.check(userId, logId);
    } catch (err) {
      console.error("[AUTO-JA-CHECK] logId=%d error:", logId, err);
    }
  });
}

async function refreshGrowthSnapshot(userId: number) {
  await growthService.refreshSnapshot(userId);
}

export const logsService = {
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
        praiseJa: body.praiseJa ?? null,
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

    await refreshGrowthSnapshot(userId);

    if (log.praiseJa) {
      scheduleAutoJaCheck(log.id, userId);
    }

    return { log };
  },

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
        ...(body.moodIntensity !== undefined && {
          moodIntensity: body.moodIntensity,
        }),
        ...(body.triggerKo && { triggerKo: body.triggerKo }),
        ...(body.specificEvent !== undefined && {
          specificEvent: body.specificEvent,
        }),
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

    await refreshGrowthSnapshot(userId);

    if (body.praiseJa && log.praiseJa) {
      scheduleAutoJaCheck(id, userId);
    }

    return { log };
  },

  async remove(userId: number, id: number) {
    const exists = await prisma.growthLog.findFirst({
      where: { id, userId },
      select: { id: true },
    });

    if (!exists) {
      throw new AppError(404, "LOG_NOT_FOUND", "로그를 찾을 수 없습니다.");
    }

    await prisma.growthLog.delete({ where: { id } });
    await refreshGrowthSnapshot(userId);
    return { deleted: true };
  },

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
        "Translate the following Korean self-praise text into natural Japanese.",
        "Use a consistent style and keep the result between 20 and 200 characters.",
        "",
        `Korean: ${log.praiseKo}`,
      ].join("\n"),
      schemaName: "draft_ja_result",
      schema: {
        type: "object",
        properties: {
          draftJa: {
            type: "string",
            description: "Natural Japanese translation result.",
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
