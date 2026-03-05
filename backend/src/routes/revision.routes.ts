import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { jaCheckController } from "../controllers/jaCheck.controller";

export const revisionRouter = Router();

revisionRouter.get(
  "/:revisionId",
  authMiddleware,
  jaCheckController.getRevisionDetail,
);
