import type { JaCheckPayload, JaCheckResponse } from "./ja-check";
import type {
  BrainstormResult,
  InsightResult as VerbalizationInsightResult,
  VerbalizationSession,
} from "./verbalization";
import type { DashboardStats } from "./stats";

export type AIAgentKind = "chat" | "feedback" | "insight";

export interface FeedbackAgentRunInput {
  logId: number;
  praiseJa: string;
}

export type FeedbackAgentPayload = JaCheckPayload;

export interface FeedbackAgentResponse extends JaCheckResponse {
  agent: "feedback";
}

export interface InsightAgentBrainstormInput {
  logId: number;
  rawThoughts: string;
  thinkingDurationMs?: number;
}

export interface InsightAgentAnswerInput {
  logId: number;
  probingAnswer: string;
}

export type InsightAgentSession = VerbalizationSession;
export type InsightAgentBrainstormResult = BrainstormResult;
export type InsightAgentResult = VerbalizationInsightResult;
export type InsightAgentDashboard = DashboardStats;
