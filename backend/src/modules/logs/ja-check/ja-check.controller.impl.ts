import { Response, NextFunction } from "express";
import { ok } from "../../../shared/http/response";
import { jaCheckService } from "./ja-check.service";
import { AuthRequest } from "../../../shared/http/auth.middleware";

export const jaCheckController = {
  async checkJa(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;
      const logId = Number(req.params.id);

      const result = await jaCheckService.check(userId, logId);
      return ok(res, result, 200);
    } catch (err) {
      next(err);
    }
  },

  async getJaLatest(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;
      const logId = Number(req.params.id);

      const result = await jaCheckService.latest(userId, logId);

      return ok(res, result, 200);
    } catch (err) {
      next(err);
    }
  },

  async listjaResults(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;
      const logId = Number(req.params.id);
      const take = req.query.take ? Number(req.query.take) : 20;

      const result = await jaCheckService.listResults(userId, logId, take);
      return ok(res, result, 200);
    } catch (err) {
      next(err);
    }
  },

  async getJaResultDetail(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;
      const resultId = Number(req.params.resultId);

      const result = await jaCheckService.getResultDetail(userId, resultId);
      return ok(res, result, 200);
    } catch (err) {
      next(err);
    }
  },
  async rewriteJa(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;
      const logId = Number(req.params.id);
      const { revisedText } = req.body;

      const result = await jaCheckService.rewriteAndRecheck(
        userId,
        logId,
        revisedText,
      );
      return ok(res, result, 200);
    } catch (err) {
      next(err);
    }
  },
  async listRevisions(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;
      const logId = Number(req.params.id);
      const take = req.query.take ? Number(req.query.take) : 20;

      const result = await jaCheckService.listRevisions(userId, logId, take);
      return ok(res, result);
    } catch (err) {
      next(err);
    }
  },

  async getRevisionDetail(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;
      const revisionId = Number(req.params.revisionId);

      const result = await jaCheckService.getRevisionDetail(userId, revisionId);
      return ok(res, result);
    } catch (err) {
      next(err);
    }
  },
};
