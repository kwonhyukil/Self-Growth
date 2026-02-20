import { NextFunction, Response } from "express";
import { AppError } from "../utils/AppError";
import { AuthRequest } from "./auth.middleware";

type Bucket = { windowStart: number; count: number };
const buckets = new Map<number, Bucket>();

export function rateLimitPerUser(options: { limit: number; windowMs: number }) {
  const { limit, windowMs } = options;

  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.userId;
    if (!userId) return next();

    const now = Date.now();
    const b = buckets.get(userId);

    if (!b || now - b.windowStart >= windowMs) {
      buckets.set(userId, { windowStart: now, count: 1 });
      return next();
    }

    b.count += 1;
    if (b.count > limit) {
      throw new AppError(
        429,
        "RATE_LIMIT_EXCEEDED",
        "요청이 많습니다. 잠시 후 다시 시도해주세요",
      );
    }

    next();
  };
}
