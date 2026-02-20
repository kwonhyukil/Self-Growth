import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { statsController } from "../controllers/stats.controller";

export const statsRouter = Router();

statsRouter.get("/mood-count", authMiddleware, statsController.getMoodCount);

statsRouter.get(
  "/last-7days",
  authMiddleware,
  statsController.getLast7DaysCount,
);

statsRouter.get("/summary", authMiddleware, statsController.getSummary);

statsRouter.get(
  "/ja-improvement",
  authMiddleware,
  statsController.jaImprovement,
);
