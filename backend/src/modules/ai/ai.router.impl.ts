import { Router } from "express";
import { authMiddleware } from "../../shared/http/auth.middleware";
import { rateLimitPerUser } from "../../shared/http/rateLimit.middleware";
import { validateBody } from "../../shared/http/validate.middleware";
import { chatAgentController } from "./chat/chat-agent.controller";
import { chatAgentSchema } from "./chat/chat-agent.schema";
import { feedbackAgentController } from "./feedback/feedback-agent.controller";

export const aiRouter = Router();

aiRouter.post(
  "/chat",
  authMiddleware,
  rateLimitPerUser({ limit: 20, windowMs: 60_000, key: "ai:chat" }),
  validateBody(chatAgentSchema),
  chatAgentController.reply,
);

aiRouter.post(
  "/feedback/logs/:id",
  authMiddleware,
  rateLimitPerUser({ limit: 10, windowMs: 60_000, key: "feedback:run" }),
  feedbackAgentController.runForLog,
);
