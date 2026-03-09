import { Response, NextFunction } from "express";
import { AuthRequest } from "../../../shared/http/auth.middleware";
import { growthService } from "./growth.service";
import { ok } from "../../../shared/http/response";

export const growthController = {
  /** GET /stats/growth — 현재 유저의 성장 스냅샷 반환 */
  async getGrowth(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;
      const snapshot = await growthService.getSnapshot(userId);
      return ok(res, { growth: snapshot });
    } catch (err) {
      next(err);
    }
  },

  /** POST /stats/growth/refresh — 강제 재계산 (테스트/디버깅용) */
  async refreshGrowth(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;
      const snapshot = await growthService.refreshSnapshot(userId);
      return ok(res, { growth: snapshot });
    } catch (err) {
      next(err);
    }
  },
};
