import { Response, NextFunction } from "express";
import { ok } from "../../../shared/http/response";
import { AuthRequest } from "../../../shared/http/auth.middleware";
import { insightAgentService } from "./insight-agent.service";
import { statsService } from "../../stats/stats.service";

export const insightAgentController = {
  async getSession(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;
      const logId = Number(req.params.id);
      const result = await insightAgentService.getVerbalizationSession(userId, logId);
      return ok(res, { verbalization: result });
    } catch (err) {
      next(err);
    }
  },

  async startBrainstorm(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;
      const logId = Number(req.params.id);
      const { rawThoughts, thinkingDurationMs } = req.body as {
        rawThoughts: string;
        thinkingDurationMs?: number;
      };
      const result = await insightAgentService.startVerbalizationSession(
        userId,
        logId,
        rawThoughts,
        thinkingDurationMs,
      );
      return ok(res, { verbalization: result });
    } catch (err) {
      next(err);
    }
  },

  async submitAnswer(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;
      const logId = Number(req.params.id);
      const { probingAnswer } = req.body as { probingAnswer: string };
      const result = await insightAgentService.submitVerbalizationAnswer(
        userId,
        logId,
        probingAnswer,
      );
      return ok(res, { verbalization: result });
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
