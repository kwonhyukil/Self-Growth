import { prisma } from "../utils/prisma";
import { CreateLogBody, UpdateLogBody } from "../validators/logs.schema";

export const logsService = {
  // 생성
  async create(userId: number, body: CreateLogBody) {
    const log = await prisma.growthLog.create({
      data: {
        userId,
        happenedAt: new Date(body.happenedAt),
        moodTag: body.moodTag,
        triggerKo: body.triggerKo,
        praiseKo: body.praiseKo,
        praiseJa: body.praiseJa,
      },

      select: {
        id: true,
        userId: true,
        happenedAt: true,
        moodTag: true,
        triggerKo: true,
        praiseKo: true,
        praiseJa: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return { log };
  },
  // 조회
  async list(userId: number) {
    const logs = await prisma.growthLog.findMany({
      where: { userId },
      orderBy: { happenedAt: "desc" },
      select: {
        id: true,
        happenedAt: true,
        moodTag: true,
        triggerKo: true,
        praiseKo: true,
        praiseJa: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return { logs };
  },
  // 본인 로그 조회
  async getById(userId: number, id: number) {
    const log = await prisma.growthLog.findFirst({
      where: { id, userId },
      select: {
        id: true,
        happenedAt: true,
        moodTag: true,
        triggerKo: true,
        praiseKo: true,
        praiseJa: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!log) {
      const e: any = new Error("로그를 찾을 수 없습니다.");
      e.status = 404;
      e.code = "LOG_NOT_FOUND";
      throw e;
    }

    return { log };
  },

  async update(userId: number, id: number, body: UpdateLogBody) {
    const exists = await prisma.growthLog.findFirst({
      where: { id, userId },
      select: { id: true },
    });

    if (!exists) {
      const e: any = new Error("로그를 찾을 수 없습니다.");
      e.status = 404;
      e.code = "LOG_NOT_FOUND";
      throw e;
    }

    const log = await prisma.growthLog.update({
      where: { id },
      data: {
        ...(body.happenedAt && {
          happenedAt: new Date(body.happenedAt),
        }),
        ...(body.moodTag && { moodTag: body.moodTag }),
        ...(body.triggerKo && { triggerKo: body.triggerKo }),
        ...(body.praiseKo && { praiseKo: body.praiseKo }),
        ...(body.praiseJa && { praiseJa: body.praiseJa }),
      },
      select: {
        id: true,
        userId: true,
        happenedAt: true,
        moodTag: true,
        triggerKo: true,
        praiseKo: true,
        praiseJa: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return { log };
  },
  async remove(userId: number, id: number) {
    const exists = await prisma.growthLog.findFirst({
      where: { id, userId },
      select: {
        id: true,
      },
    });
    if (!exists) {
      const e: any = new Error("로그를 찾을 수 없습니다.");
      e.status = 404;
      e.code = "LOG_NOT_FOUND";
      throw e;
    }

    await prisma.growthLog.delete({ where: { id } });
    return { deleted: true };
  },
};
