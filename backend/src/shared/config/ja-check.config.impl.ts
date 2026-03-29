import { env } from "./env";

export const JA_CHECK = {
  PROMPT_VERSION: "v1",
  MODEL: env.gptModel,

  MIN_LEN: 20,
  MAX_LEN: 200,

  MAX_ISSUES: 6,
  MAX_EXAMPLE_FIXES_PER_ISSUE: 2,
  MAX_EXAMPLE_FIXES_TOTAL: 4,

  MAX_RETRIES: 2,
} as const;

export function buildToolName() {
  return `gpt:${JA_CHECK.MODEL}:${JA_CHECK.PROMPT_VERSION}`;
}
