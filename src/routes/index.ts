import { Router } from "express";
import { healthRouter } from "./health.routes";
import { authRouter } from "./auth.routes";
import { logsRouter } from "./logs.routes";
import { statsRouter } from "./stats.routes";
import { revisionRouter } from "./revision.routes";

export const router = Router();

router.use("/health", healthRouter);
router.use("/auth", authRouter);
router.use("/logs", logsRouter);
router.use("/revisions", revisionRouter);
router.use("/stats", statsRouter);
