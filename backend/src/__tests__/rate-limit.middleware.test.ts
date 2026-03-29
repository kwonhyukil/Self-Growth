import express from "express";
import request from "supertest";
import {
  __resetRateLimitBucketsForTests,
  rateLimitPerUser,
} from "../shared/http/rateLimit.middleware";
import { errorMiddleware } from "../shared/http/error.middleware";

describe("rateLimitPerUser", () => {
  let now = 1_000;
  const originalDateNow = Date.now;

  beforeEach(() => {
    now = 1_000;
    __resetRateLimitBucketsForTests();
    jest.spyOn(Date, "now").mockImplementation(() => now);
  });

  afterEach(() => {
    __resetRateLimitBucketsForTests();
    jest.restoreAllMocks();
  });

  afterAll(() => {
    Date.now = originalDateNow;
  });

  function createApp() {
    const app = express();

    app.use((req: express.Request & { userId?: number }, _res, next) => {
      req.userId = 7;
      next();
    });

    app.post(
      "/feedback/logs/:id",
      rateLimitPerUser({ limit: 1, windowMs: 1_000, key: "feedback:run" }),
      (_req, res) => res.json({ ok: true }),
    );

    app.post(
      "/logs/:id/check-ja",
      rateLimitPerUser({ limit: 1, windowMs: 1_000, key: "feedback:run" }),
      (_req, res) => res.json({ ok: true }),
    );

    app.post(
      "/ai/chat",
      rateLimitPerUser({ limit: 2, windowMs: 1_000, key: "ai:chat" }),
      (_req, res) => res.json({ ok: true }),
    );

    app.use(errorMiddleware);

    return app;
  }

  it("shares quota across alias routes with the same key", async () => {
    const app = createApp();

    await request(app).post("/feedback/logs/1").expect(200);

    const res = await request(app).post("/logs/1/check-ja").expect(429);

    expect(res.body?.error?.code).toBe("RATE_LIMIT_EXCEEDED");
    expect(res.headers["retry-after"]).toBe("1");
  });

  it("does not mix quota across different keys for the same user", async () => {
    const app = createApp();

    await request(app).post("/feedback/logs/1").expect(200);
    await request(app).post("/ai/chat").expect(200);
    await request(app).post("/ai/chat").expect(200);
    await request(app).post("/ai/chat").expect(429);
  });

  it("resets the bucket after the configured window", async () => {
    const app = createApp();

    await request(app).post("/feedback/logs/1").expect(200);
    await request(app).post("/logs/1/check-ja").expect(429);

    now += 1_001;

    await request(app).post("/logs/1/check-ja").expect(200);
  });
});
