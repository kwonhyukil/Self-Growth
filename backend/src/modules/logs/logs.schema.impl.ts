import { z } from "zod";

export const createLogSchema = z.object({
  happenedAt: z.string().datetime(),
  moodTag: z.enum([
    "JOY",
    "PROUD",
    "GRATEFUL",
    "RELIEVED",
    "EXCITED",
    "CALM",
    "CONFIDENT",
    "MOTIVATED",
    "CONNECTED",
    "HOPEFUL",
  ]),
  moodIntensity: z.number().int().min(1).max(5).optional(),
  triggerKo: z.string().min(1).max(200),
  specificEvent: z.string().min(1).max(500).optional(),
  praiseKo: z.string().min(1),
  praiseJa: z.string().min(1).optional(), // AI 초안 기능으로 선택 입력
});

export const updateLogSchema = createLogSchema.partial();

export type CreateLogBody = z.infer<typeof createLogSchema>;
export type UpdateLogBody = z.infer<typeof updateLogSchema>;
