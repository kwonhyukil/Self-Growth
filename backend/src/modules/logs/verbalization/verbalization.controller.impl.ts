import { Response, NextFunction } from "express";
import { AuthRequest } from "../../../shared/http/auth.middleware";
import { verbalizationService } from "./verbalization.service";
import { ok } from "../../../shared/http/response";

export const verbalizationController = {
  async startBrainstorm(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;
      const logId = Number(req.params.id);
      const { rawThoughts, thinkingDurationMs } = req.body as {
        rawThoughts: string;
        thinkingDurationMs?: number;
      };

      const result = await verbalizationService.startSession(
        userId,
        logId,
        rawThoughts,
        thinkingDurationMs
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

      const result = await verbalizationService.submitProbeAnswer(
        userId,
        logId,
        probingAnswer
      );
      return ok(res, { verbalization: result });
    } catch (err) {
      next(err);
    }
  },

  async getSession(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;
      const logId = Number(req.params.id);

      const session = await verbalizationService.getSession(userId, logId);
      return ok(res, { verbalization: session });
    } catch (err) {
      next(err);
    }
  },
};
