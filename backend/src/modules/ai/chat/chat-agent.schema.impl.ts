import { z } from "zod";

export const chatAgentSchema = z.object({
  message: z.string().min(1).max(500),
});

export type ChatAgentInput = z.infer<typeof chatAgentSchema>;
