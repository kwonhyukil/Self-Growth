import { Response, NextFunction } from "express";
import { ok } from "../../../shared/http/response";
import { AuthRequest } from "../../../shared/http/auth.middleware";
import { chatAgentService } from "./chat-agent.service";
import type { ChatAgentInput } from "./chat-agent.schema";

export const chatAgentController = {
  async reply(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;
      const { message } = req.body as ChatAgentInput;
      const result = await chatAgentService.reply(userId, message);
      return ok(res, result, 200);
    } catch (err) {
      next(err);
    }
  },
};
