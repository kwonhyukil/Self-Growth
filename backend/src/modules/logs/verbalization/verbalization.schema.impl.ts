import { z } from "zod";

export const brainstormSchema = z.object({
  rawThoughts: z
    .string()
    .min(10, "최소 10자 이상 입력해주세요")
    .max(2000, "최대 2000자까지 입력 가능합니다"),
  thinkingDurationMs: z.number().int().positive().optional(),
});

export const probeAnswerSchema = z.object({
  probingAnswer: z
    .string()
    .min(5, "최소 5자 이상 입력해주세요")
    .max(1000, "최대 1000자까지 입력 가능합니다"),
});
