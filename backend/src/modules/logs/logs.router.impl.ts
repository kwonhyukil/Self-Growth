import { Router } from "express";
import { authMiddleware, AuthRequest } from "../../shared/http/auth.middleware";
import { validateBody } from "../../shared/http/validate.middleware";
import { createLogSchema, updateLogSchema } from "./logs.schema";
import {
  createLog,
  deleteLog,
  getLogById,
  listLogs,
  updateLog,
  draftJa,
} from "./logs.controller";
import { jaCheckController } from "./ja-check/ja-check.controller";
import { verbalizationController } from "./verbalization/verbalization.controller";
import { rateLimitPerUser } from "../../shared/http/rateLimit.middleware";
import { JaRewriteSchema } from "./ja-check/ja-rewrite.schema";
import { brainstormSchema, probeAnswerSchema } from "./verbalization/verbalization.schema";

export const logsRouter = Router();

logsRouter.get("/me", authMiddleware, (req: AuthRequest, res: any) => {
  return res.json({
    data: {
      message: "인증성공",
      userId: req.userId,
    },
  });
});

logsRouter.post("/", authMiddleware, validateBody(createLogSchema), createLog);

logsRouter.get("/", authMiddleware, listLogs);

logsRouter.get("/:id", authMiddleware, getLogById);

logsRouter.patch(
  "/:id",
  authMiddleware,
  validateBody(updateLogSchema),
  updateLog,
);

logsRouter.delete("/:id", authMiddleware, deleteLog);
logsRouter.post(
  "/:id/check-ja",
  authMiddleware,
  rateLimitPerUser({ limit: 10, windowMs: 60_000 }),
  jaCheckController.checkJa,
);
logsRouter.get(
  "/:id/check-ja/latest",
  authMiddleware,
  jaCheckController.getJaLatest,
);
logsRouter.get(
  "/:id/check-ja/results",
  authMiddleware,
  jaCheckController.listjaResults,
);
logsRouter.get(
  "/check-ja/results/:resultId",
  authMiddleware,
  jaCheckController.getJaResultDetail,
);

logsRouter.get(
  "/:id/revisions",
  authMiddleware,
  jaCheckController.listRevisions,
);

logsRouter.post(
  "/:id/rewrite-ja",
  authMiddleware,
  validateBody(JaRewriteSchema),
  jaCheckController.rewriteJa,
);

// ── AI 일본어 초안 생성 ──────────────────────────────────────
logsRouter.post(
  "/:id/draft-ja",
  authMiddleware,
  rateLimitPerUser({ limit: 5, windowMs: 60_000 }),
  draftJa,
);

// ── 언어화 프로세스 (3-Step Verbalization) ───────────────────
logsRouter.get(
  "/:id/verbalize",
  authMiddleware,
  verbalizationController.getSession,
);
logsRouter.post(
  "/:id/verbalize/brainstorm",
  authMiddleware,
  rateLimitPerUser({ limit: 5, windowMs: 60_000 }),
  validateBody(brainstormSchema),
  verbalizationController.startBrainstorm,
);
logsRouter.post(
  "/:id/verbalize/probe-answer",
  authMiddleware,
  rateLimitPerUser({ limit: 5, windowMs: 60_000 }),
  validateBody(probeAnswerSchema),
  verbalizationController.submitAnswer,
);
