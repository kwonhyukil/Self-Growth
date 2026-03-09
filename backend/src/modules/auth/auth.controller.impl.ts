import { Request, Response, NextFunction } from "express";
import { ok } from "../../shared/http/response";
import { authService } from "./auth.service";

export async function signup(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await authService.signup(req.body);
    return ok(res, result, 201);
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await authService.login(req.body);
    return ok(res, result, 200);
  } catch (err) {
    next(err);
  }
}
