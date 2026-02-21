import { Request, Response, NextFunction } from "express";
import crypto from "crypto";

export function requestLogMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const requestId = crypto.randomUUID();
  const start = Date.now();

  (req as any).requestId = requestId;

  res.setHeader("X-Request-Id", requestId);

  res.on("finish", () => {
    const ms = Date.now() - start;
    const method = req.method;
    const path = req.originalUrl;
    const status = res.statusCode;

    console.log(`[${requestId}] ${method} ${path} -> ${status} (${ms}ms)`);
  });

  next();
}
