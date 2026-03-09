jest.mock("../shared/infra/gpt", () => ({
  callGptStructuredJson: async () => ({
    overall: {
      score: 85,
      comment: "mock feedback",
      nextStepQuestion: "mock question",
      detectedStyle: "mixed",
      recommendedStyle: "keep_mixed",
    },
    issues: [
      {
        issueId: "mock-1",
        ruleTag: "naturalness",
        severity: "low",
        problem: "mock problem",
        why: "mock why",
        selfCheckQuestion: "mock self check",
        rewriteTask: "mock rewrite task",
        exampleFixes: [],
        span: { start: 0, end: 0 },
      },
    ],
  }),
}));

jest.setTimeout(30000);

import request from "supertest";
import { app } from "../app";
import { prisma } from "../shared/infra/prisma";

function randEmail() {
  return `test_${Date.now()}_${Math.floor(Math.random() * 1000)}@example.com`;
}

describe("E2E Flow: signup -> login -> log -> check -> rewrite -> revision -> stats", () => {
  it("should run the whole flow", async () => {
    // 1) signup
    const email = randEmail();
    const password = "Passw0rd!123";
    const name = "e2e-user";

    await request(app)
      .post("/api/auth/signup")
      .send({ email, password, name })
      .expect(201);

    // 2) login
    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ email, password })
      .expect(200);

    const token = loginRes.body?.data?.accessToken;
    expect(typeof token).toBe("string");

    const auth = { Authorization: `Bearer ${token}` };

    // 3) create log
    const createRes = await request(app)
      .post("/api/logs")
      .set(auth)
      .send({
        happenedAt: new Date().toISOString(),
        moodTag: "CONFIDENT",
        triggerKo: "발표 준비",
        praiseKo: "자료를 끝까지 정리해서 뿌듯했다.",
        praiseJa:
          "きょうは発表資料を最後まで整理して、練習もしたので自信がついた。",
      })
      .expect(201);

    const logId = createRes.body?.data?.log?.id;
    expect(typeof logId).toBe("number");

    // 4) check-ja
    const checkRes = await request(app)
      .post(`/api/logs/${logId}/check-ja`)
      .set(auth)
      .send({})
      .expect(200);

    expect(checkRes.body?.data?.mode).toBeDefined();

    // 5) rewrite-ja (수정 + 재검사 + revision 생성)
    const rewriteRes = await request(app)
      .post(`/api/logs/${logId}/rewrite-ja`)
      .set(auth)
      .send({
        revisedText:
          "きょうは発表資料を最後まで整理し、発表練習もしたので、少し自信がつきました。",
      })
      .expect(200);

    const revisionId = rewriteRes.body?.data?.revisionId;
    expect(typeof revisionId).toBe("number");

    // 6) revision detail
    const revDetailRes = await request(app)
      .get(`/api/revisions/${revisionId}`)
      .set(auth)
      .expect(200);

    expect(revDetailRes.body?.data?.revision).toBeDefined();
    expect(revDetailRes.body?.data?.revision?.after?.feedback).toBeDefined();

    // 7) stats ja improvement
    const statsRes = await request(app)
      .get("/api/stats/ja-improvement?days=30")
      .set(auth)
      .expect(200);

    expect(statsRes.body?.data).toBeDefined();
  });
});
afterAll(async () => {
  await prisma.$disconnect();
});
