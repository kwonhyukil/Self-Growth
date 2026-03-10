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
        ruleTag: "particle",
        severity: "medium",
        problem: "mock particle problem",
        why: "mock why",
        selfCheckQuestion: "mock self check",
        rewriteTask: "mock rewrite task",
        exampleFixes: [],
        span: { start: 0, end: 2 },
      },
      {
        issueId: "mock-2",
        ruleTag: "naturalness",
        severity: "low",
        problem: "mock naturalness problem",
        why: "mock why",
        selfCheckQuestion: "mock self check",
        rewriteTask: "mock rewrite task",
        exampleFixes: [],
        span: { start: 3, end: 5 },
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

describe("E2E Flow: auth, logs, ja-check, growth", () => {
  it("keeps auth user info and refreshes growth-derived data", async () => {
    const email = randEmail();
    const password = "Passw0rd!123";
    const name = "e2e-user";

    await request(app)
      .post("/api/auth/signup")
      .send({ email, password, name })
      .expect(201);

    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ email, password })
      .expect(200);

    const token = loginRes.body?.data?.accessToken;
    expect(typeof token).toBe("string");

    const auth = { Authorization: `Bearer ${token}` };

    const meRes = await request(app).get("/api/auth/me").set(auth).expect(200);
    expect(meRes.body?.data?.user).toMatchObject({ email, name });

    const createRes = await request(app)
      .post("/api/logs")
      .set(auth)
      .send({
        happenedAt: new Date().toISOString(),
        moodTag: "CONFIDENT",
        triggerKo: "발표 준비를 마쳤다.",
        praiseKo: "끝까지 집중해서 준비를 마무리했다.",
        praiseJa: "最後まで集中して準備をやり切ったので、発表にも自信を持てた。",
      })
      .expect(201);

    const logId = createRes.body?.data?.log?.id;
    expect(typeof logId).toBe("number");

    const updateRes = await request(app)
      .patch(`/api/logs/${logId}`)
      .set(auth)
      .send({ moodTag: "CALM" })
      .expect(200);
    expect(updateRes.body?.data?.log?.moodTag).toBe("CALM");

    const growthAfterUpdate = await request(app)
      .get("/api/stats/growth")
      .set(auth)
      .expect(200);

    expect(growthAfterUpdate.body?.data?.growth?.positivity).toBe(50);

    const checkRes = await request(app)
      .post(`/api/logs/${logId}/check-ja`)
      .set(auth)
      .send({})
      .expect(200);

    expect(checkRes.body?.data?.mode).toBeDefined();

    const growthAfterCheck = await request(app)
      .get("/api/stats/growth")
      .set(auth)
      .expect(200);

    expect(growthAfterCheck.body?.data?.growth?.grammarAccuracy).toBe(75);

    const rewriteRes = await request(app)
      .post(`/api/logs/${logId}/rewrite-ja`)
      .set(auth)
      .send({
        revisedText: "最後まで集中して準備をやり切れたので自信がついた。",
      })
      .expect(200);

    const revisionId = rewriteRes.body?.data?.revisionId;
    expect(typeof revisionId).toBe("number");

    const revDetailRes = await request(app)
      .get(`/api/revisions/${revisionId}`)
      .set(auth)
      .expect(200);

    expect(revDetailRes.body?.data?.revision).toBeDefined();
    expect(revDetailRes.body?.data?.revision?.after?.feedback).toBeDefined();

    const growthAfterRewrite = await request(app)
      .get("/api/stats/growth")
      .set(auth)
      .expect(200);

    expect(growthAfterRewrite.body?.data?.growth?.revisionEffort).toBeGreaterThan(0);

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
