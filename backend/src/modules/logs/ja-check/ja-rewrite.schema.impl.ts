import { z } from "zod";
import { JA_CHECK } from "../../../shared/config/ja-check.config";

export const JaRewriteSchema = z.object({
  revisedText: z
    .string()
    .trim()
    .min(
      JA_CHECK.MIN_LEN,
      `일본어 문장은 ${JA_CHECK.MIN_LEN}자 이상으로 작성해주세요`,
    )
    .max(
      JA_CHECK.MAX_LEN,
      `일본어 문장은 ${JA_CHECK.MAX_LEN}자 이하로 작성해주세요`,
    ),
});
