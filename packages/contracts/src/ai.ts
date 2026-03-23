import type { JaCheckPayload, JaCheckResponse } from "./ja-check";

export type AIAgentKind = "chat" | "feedback" | "insight";

export interface FeedbackAgentRunInput {
  logId: number;
  praiseJa: string;
}

export type FeedbackAgentPayload = JaCheckPayload;

export interface FeedbackAgentResponse extends JaCheckResponse {
  agent: "feedback";
}
