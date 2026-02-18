import { Response } from "express";

export function ok(res: Response, data: unknown, status: number = 200) {
  return res.status(status).json({
    data,
  });
}

export function fail(
  res: Response,
  status: number,
  code: string,
  message: string,
  details?: unknown,
) {
  return res.status(status).json({
    error: {
      code,
      message,
      ...(details ? { details } : {}),
    },
  });
}
