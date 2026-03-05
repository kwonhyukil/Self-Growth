import { Router } from "express";
import { authMiddleware, AuthRequest } from "../middlewares/auth.middleware";
import { validateBody } from "../middlewares/validate.middleware";
import { createLogSchema, updateLogSchema } from "../validators/logs.schema";
import {
  createLog,
  deleteLog,
  getLogById,
  listLogs,
  updateLog,
} from "../controllers/logs.controller";
import { jaCheckController } from "../controllers/jaCheck.controller";
import { rateLimitPerUser } from "../middlewares/rateLimit.middleware";
import { JaRewriteSchema } from "../validators/jaRewrite";

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
