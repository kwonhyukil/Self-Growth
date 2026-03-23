import { Router } from "express";
import { authMiddleware } from "../../shared/http/auth.middleware";
import { rateLimitPerUser } from "../../shared/http/rateLimit.middleware";
import { validateBody } from "../../shared/http/validate.middleware";
import { chatAgentController } from "./chat/chat-agent.controller";
import { chatAgentSchema } from "./chat/chat-agent.schema";
import { brainstormSchema, probeAnswerSchema } from "../logs/verbalization/verbalization.schema";
import { feedbackAgentController } from "./feedback/feedback-agent.controller";
import { insightAgentController } from "./insight/insight-agent.controller";

export const aiRouter = Router();

aiRouter.post(
  "/chat",
  authMiddleware,
  rateLimitPerUser({ limit: 20, windowMs: 60_000 }),
  validateBody(chatAgentSchema),
  chatAgentController.reply,
);

aiRouter.post(
  "/feedback/logs/:id",
  authMiddleware,
  rateLimitPerUser({ limit: 10, windowMs: 60_000 }),
  feedbackAgentController.runForLog,
);

aiRouter.get(
  "/insight/logs/:id/session",
  authMiddleware,
  insightAgentController.getSession,
);

aiRouter.post(
  "/insight/logs/:id/brainstorm",
  authMiddleware,
  rateLimitPerUser({ limit: 5, windowMs: 60_000 }),
  validateBody(brainstormSchema),
  insightAgentController.startBrainstorm,
);

aiRouter.post(
  "/insight/logs/:id/answer",
  authMiddleware,
  rateLimitPerUser({ limit: 5, windowMs: 60_000 }),
  validateBody(probeAnswerSchema),
  insightAgentController.submitAnswer,
);

aiRouter.get("/insight/dashboard", authMiddleware, insightAgentController.dashboard);
