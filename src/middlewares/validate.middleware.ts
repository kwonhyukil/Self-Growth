import { z } from "zod";
import { Request, Response, NextFunction } from "express";

export function validateBody(schema: z.ZodTypeAny<any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: {
          code: "VALIDATION_ERROR",
          message: "요청 바디가 올바르지 않습니다.",
          details: result.error.flatten(),
        },
      });
    }
    req.body = result.data;
    next();
  };
}
