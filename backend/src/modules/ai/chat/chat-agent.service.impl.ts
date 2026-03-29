import { prisma } from "../../../shared/infra/prisma";
import { AppError } from "../../../shared/errors/AppError";
import { callGptStructuredJson } from "../../../shared/infra/gpt";
import { env } from "../../../shared/config/env";

interface ChatAgentModelResult {
  reply: string;
  intent: "chat" | "feedback" | "insight";
  route: "chat" | "feedback" | "insight";
  suggestedActions: string[];
}

const CHAT_SCHEMA = {
  type: "object",
  properties: {
    reply: { type: "string" },
    intent: { type: "string", enum: ["chat", "feedback", "insight"] },
    route: { type: "string", enum: ["chat", "feedback", "insight"] },
    suggestedActions: {
      type: "array",
      items: { type: "string" },
      maxItems: 3,
    },
  },
  required: ["reply", "intent", "route", "suggestedActions"],
  additionalProperties: false,
};

function summarizeLogs(
  logs: Array<{
    moodTag: string;
    triggerKo: string;
    praiseKo: string;
    praiseJa: string | null;
  }>,
) {
  if (logs.length === 0) return "No logs yet.";

  return logs
    .map(
      (log, index) =>
        `${index + 1}. mood=${log.moodTag}; trigger=${log.triggerKo}; ko=${log.praiseKo}; ja=${log.praiseJa ?? "none"}`,
    )
    .join("\n");
}

export const chatAgentService = {
  async reply(userId: number, message: string) {
    const trimmed = message.trim();
    if (!trimmed) {
      throw new AppError(400, "CHAT_MESSAGE_REQUIRED", "메시지를 입력해주세요.");
    }

    const [recentLogs, totalLogs] = await Promise.all([
      prisma.growthLog.findMany({
        where: { userId },
        orderBy: { happenedAt: "desc" },
        take: 5,
        select: {
          moodTag: true,
          triggerKo: true,
          praiseKo: true,
          praiseJa: true,
        },
      }),
      prisma.growthLog.count({ where: { userId } }),
    ]);

    const prompt = `
당신은 Self Growth Log의 AI 코치입니다.
사용자에게 짧고 친절하게 답하세요.

역할 규칙:
- 사용자가 일본어 문장 점검이나 교정을 원하면 intent/route를 feedback으로 설정
- 사용자가 기록 패턴, 성장 해석, 요약을 원하면 intent/route를 insight로 설정
- 그 외에는 chat으로 설정
- suggestedActions는 짧은 다음 행동 1~3개
- reply는 3문장 이내

사용자 정보:
- totalLogs: ${totalLogs}
- recentLogs:
${summarizeLogs(recentLogs)}

사용자 메시지:
${trimmed}
    `.trim();

    const result = await callGptStructuredJson<ChatAgentModelResult>({
      model: env.gptModel,
      prompt,
      schemaName: "chat_agent_v1",
      schema: CHAT_SCHEMA,
      maxOutputTokens: 300,
    });

    return {
      agent: "chat" as const,
      reply: result.reply,
      intent: result.intent,
      route: result.route,
      suggestedActions: result.suggestedActions,
    };
  },
};
