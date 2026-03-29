import { NextFunction, Response } from "express";
import { AppError } from "../errors/AppError";
import { AuthRequest } from "./auth.middleware";

type Bucket = { windowStart: number; count: number; windowMs: number };
const buckets = new Map<string, Bucket>();

function buildBucketKey(
  req: AuthRequest,
  userId: number,
  customKey?: string,
) {
  if (customKey) return `${userId}:${customKey}`;

  const routePath =
    typeof req.route?.path === "string" ? req.route.path : req.path;

  return `${userId}:${req.method}:${req.baseUrl}${routePath}`;
}

// Purge expired buckets every 5 minutes to prevent unbounded memory growth.
setInterval(() => {
  const now = Date.now();
  for (const [bucketKey, bucket] of buckets) {
    if (now - bucket.windowStart >= bucket.windowMs) {
      buckets.delete(bucketKey);
    }
  }
}, 5 * 60_000).unref();

export function __resetRateLimitBucketsForTests() {
  buckets.clear();
}

export function rateLimitPerUser(options: {
  limit: number;
  windowMs: number;
  key?: string;
}) {
  const { limit, windowMs, key } = options;

  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.userId;
    if (!userId) return next();

    const now = Date.now();
    const bucketKey = buildBucketKey(req, userId, key);
    const b = buckets.get(bucketKey);

    if (!b || now - b.windowStart >= windowMs) {
      buckets.set(bucketKey, { windowStart: now, count: 1, windowMs });
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
