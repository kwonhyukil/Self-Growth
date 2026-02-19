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
