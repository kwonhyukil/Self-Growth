import { z } from "zod";

const RuleTag = z.enum([
  "particle",
  "politeness",
  "word_choice",
  "word_order",
  "collocation",
  "style_mix",
  "naturalness",
  "kanji_kana",
  "other",
]);

const Severity = z.enum(["low", "medium", "high"]);
const Style = z.enum(["casual", "polite", "mixed"]);
const RecStyle = z.enum(["keep_mixed", "unify_polite", "unify_casual"]);

export const JaCheckResultSchema = z.object({
  overall: z.object({
    score: z.number().min(0).max(100),
    comment: z.string().min(1),
    nextStepQuestion: z.string().min(1),
    detectedStyle: Style,
    recommendedStyle: RecStyle,
  }),
  issues: z.array(
    z.object({
      issueId: z.string().min(3),
      ruleTag: RuleTag,
      severity: Severity,
      problem: z.string().min(1),
      why: z.string().min(1),
      selfCheckQuestion: z.string().min(1),
      rewriteTask: z.string().min(1),
      exampleFixes: z.array(z.string().min(1)).max(2).optional(),
      span: z
        .object({
          start: z.number().int().min(0),
          end: z.number().int().min(0),
        })
        .optional(),
    }),
  ),
});

export type JaCheckResult = z.infer<typeof JaCheckResultSchema>;
