import { Router } from "express";
import { healthRouter } from "./health.routes";
import { authRouter } from "./auth.routes";
import { logsRouter } from "./logs.routes";
import { statsRouter } from "./stats.routes";

export const router = Router();

router.use("/health", healthRouter);
router.use("/auth", authRouter);
router.use("/logs", logsRouter);
router.use("/stats", statsRouter);

