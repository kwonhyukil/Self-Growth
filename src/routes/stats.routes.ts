import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import {
  getLast7DaysCount,
  getMoodCount,
  getSummary,
} from "../controllers/stats.controller";

export const statsRouter = Router();

statsRouter.get("/mood-count", authMiddleware, getMoodCount);

statsRouter.get("/last-7days", authMiddleware, getLast7DaysCount);

statsRouter.get("/summary", authMiddleware, getSummary);
