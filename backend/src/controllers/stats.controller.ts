import { Response, NextFunction } from "express";
import { ok } from "../utils/response";
import { statsService } from "../services/stats.service";
import { AuthRequest } from "../middlewares/auth.middleware";

export const statsController = {
  async getMoodCount(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;
      const result = await statsService.moodCount(userId);
      return ok(res, result, 200);
    } catch (err) {
      next(err);
    }
  },

  async getLast7DaysCount(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;
      const result = await statsService.last7DaysCount(userId);
      return ok(res, result, 200);
    } catch (err) {
      next(err);
    }
  },

  async getSummary(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;
      const result = await statsService.summary(userId);
      return ok(res, result, 200);
    } catch (err) {
      next(err);
    }
  },

  async jaImprovement(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;
      const days = req.query.days ? Number(req.query.days) : 30;

      const result = await statsService.jaImprovement(userId, days);
      return ok(res, result);
    } catch (err) {
      next(err);
    }
  },
  async dashboard(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;
      const result = await statsService.dashboard(userId);
      return ok(res, result);
    } catch (err) {
      next(err);
    }
  },
};
