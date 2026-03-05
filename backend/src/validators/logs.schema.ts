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
  triggerKo: z.string().min(1).max(200),
  praiseKo: z.string().min(1),
  praiseJa: z.string().min(1),
});

export const updateLogSchema = createLogSchema.partial();

export type CreateLogBody = z.infer<typeof createLogSchema>;
export type UpdateLogBody = z.infer<typeof updateLogSchema>;
