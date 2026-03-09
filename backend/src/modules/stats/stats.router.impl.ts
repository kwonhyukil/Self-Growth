import { Router } from "express";
import { authMiddleware } from "../../shared/http/auth.middleware";
import { statsController } from "./stats.controller";
import { growthController } from "./growth/growth.controller";

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

statsRouter.get("/dashboard", authMiddleware, statsController.dashboard);

// ── Growth System ──────────────────────────────────────────
statsRouter.get("/growth", authMiddleware, growthController.getGrowth);
statsRouter.post(
  "/growth/refresh",
  authMiddleware,
  growthController.refreshGrowth
);
