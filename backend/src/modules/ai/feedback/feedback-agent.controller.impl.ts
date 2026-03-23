import { Response, NextFunction } from "express";
import { ok } from "../../../shared/http/response";
import { AuthRequest } from "../../../shared/http/auth.middleware";
import { feedbackAgentService } from "./feedback-agent.service";

export const feedbackAgentController = {
  async runForLog(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;
      const logId = Number(req.params.id);
      const result = await feedbackAgentService.runForLog(userId, logId);
      return ok(res, result, 200);
    } catch (err) {
      next(err);
    }
  },
};
