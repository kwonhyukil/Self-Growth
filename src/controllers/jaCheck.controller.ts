import { Response, NextFunction } from "express";
import { ok } from "../utils/response";
import { jaCheckService } from "../services/jaCheck.service";
import { AuthRequest } from "../middlewares/auth.middleware";
import { prisma } from "../utils/prisma";

export async function checkJa(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.userId!;
    const logId = Number(req.params.id);

    const result = await jaCheckService.check(userId, logId);

    return ok(res, result, 200);
  } catch (err) {
    next(err);
  }
}

export async function getJaLatest(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.userId!;
    const logId = Number(req.params.id);

    const result = await jaCheckService.latest(userId, logId);

    return ok(res, result, 200);
  } catch (err) {
    next(err);
  }
}

export async function listjaResults(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.userId!;
    const logId = Number(req.params.id);
    const take = req.query.take ? Number(req.query.take) : 20;

    const result = await jaCheckService.listResults(userId, logId, take);
    return ok(res, result, 200);
  } catch (err) {
    next(err);
  }
}

export async function getJaResultDetail(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.userId!;
    const resultId = Number(req.params.resultId);

    const result = await jaCheckService.getResultDetail(userId, resultId);
    return ok(res, result, 200);
  } catch (err) {
    next(err);
  }
}
