import { growthService } from "../../stats/growth/growth.service";
import { insightAgentService } from "../../ai/insight/insight-agent.service";

export const verbalizationService = {
  async startSession(
    userId: number,
    logId: number,
    rawThoughts: string,
    thinkingDurationMs?: number,
  ) {
    return insightAgentService.startVerbalizationSession(
      userId,
      logId,
      rawThoughts,
      thinkingDurationMs,
    );
  },

  async submitProbeAnswer(userId: number, logId: number, probingAnswer: string) {
    const result = await insightAgentService.submitVerbalizationAnswer(
      userId,
      logId,
      probingAnswer,
    );
    await growthService.refreshSnapshot(userId);
    return result;
  },

  async getSession(userId: number, logId: number) {
    return insightAgentService.getVerbalizationSession(userId, logId);
  },
};
