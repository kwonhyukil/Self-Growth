import { Router } from "express";
import { aiRouter } from "../modules/ai/ai.router";
import { authRouter } from "../modules/auth/auth.router";
import { healthRouter } from "../modules/health/health.router";
import { logsRouter } from "../modules/logs/logs.router";
import { revisionRouter } from "../modules/logs/ja-check/revision.router";
import { statsRouter } from "../modules/stats/stats.router";

export const router = Router();

router.use("/health", healthRouter);
router.use("/auth", authRouter);
router.use("/ai", aiRouter);
router.use("/logs", logsRouter);
router.use("/revisions", revisionRouter);
router.use("/stats", statsRouter);
