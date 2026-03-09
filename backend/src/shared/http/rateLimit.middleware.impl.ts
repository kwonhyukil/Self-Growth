import { NextFunction, Response } from "express";
import { AppError } from "../errors/AppError";
import { AuthRequest } from "./auth.middleware";

type Bucket = { windowStart: number; count: number };
const buckets = new Map<number, Bucket>();

// Purge expired buckets every 5 minutes to prevent unbounded memory growth.
setInterval(() => {
  const now = Date.now();
  for (const [userId, bucket] of buckets) {
    if (now - bucket.windowStart >= 60_000) {
      buckets.delete(userId);
    }
  }
}, 5 * 60_000).unref();

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
      const retryAfterMs = windowMs - (now - b.windowStart);
      res.setHeader("Retry-After", String(Math.ceil(retryAfterMs / 1000)));
      return next(
        new AppError(
          429,
          "RATE_LIMIT_EXCEEDED",
          `요청이 많습니다. ${Math.ceil(retryAfterMs / 1000)}초 후 다시 시도해주세요.`,
        ),
      );
    }

    return next();
  };
}
