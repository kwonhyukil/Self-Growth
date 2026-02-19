import { Response, NextFunction } from "express";
import { ok } from "../utils/response";
import { logsService } from "../services/logs.service";
import { AuthRequest } from "../middlewares/auth.middleware";
import { UpdateLogBody } from "../validators/logs.schema";

export async function createLog(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.userId!;
    const result = await logsService.create(userId, req.body);
    return ok(res, result, 201);
  } catch (err) {
    next(err);
  }
}

export async function listLogs(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.userId!;
    const result = await logsService.list(userId);
    return ok(res, result, 200);
  } catch (err) {
    next(err);
  }
}

export async function getLogById(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.userId!;
    const id = Number(req.params.id);
    const result = await logsService.getById(userId, id);
    return ok(res, result, 200);
  } catch (err) {
    next(err);
  }
}

export async function updateLog(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.userId!;
    const id = Number(req.params.id);
    const result = await logsService.update(
      userId,
      id,
      req.body as UpdateLogBody,
    );
    return ok(res, result, 200);
  } catch (err) {
    next(err);
  }
}

export async function deleteLog(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.userId!;
    const id = Number(req.params.id);
    const result = await logsService.remove(userId, id);
    return ok(res, result, 200);
  } catch (err) {
    next(err);
  }
}
