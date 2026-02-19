import { Response, NextFunction } from "express";
import { ok } from "../utils/response";
import { statsService } from "../services/stats.service";
import { authMiddleware, AuthRequest } from "../middlewares/auth.middleware";

export async function getMoodCount(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.userId!;
    const result = await statsService.moodCount(userId);
    return ok(res, result, 200);
  } catch (err) {
    next(err);
  }
}

export async function getLast7DaysCount(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.userId!;
    const result = await statsService.last7DaysCount(userId);
    return ok(res, result, 200);
  } catch (err) {
    next(err);
  }
}

export async function getSummary(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.userId!;
    const result = await statsService.summary(userId);
    return ok(res, result, 200);
  } catch (err) {
    next(err);
  }
}
