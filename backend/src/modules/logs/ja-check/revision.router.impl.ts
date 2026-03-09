import { Router } from "express";
import { authMiddleware } from "../../../shared/http/auth.middleware";
import { jaCheckController } from "./ja-check.controller";

export const revisionRouter = Router();

revisionRouter.get(
  "/:revisionId",
  authMiddleware,
  jaCheckController.getRevisionDetail,
);
