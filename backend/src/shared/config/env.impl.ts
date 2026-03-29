import { existsSync } from "fs";
import { resolve } from "path";
import { config as loadDotenv } from "dotenv";

let loaded = false;

function loadBackendEnv() {
  if (loaded) return;

  const explicitPath = process.env.DOTENV_CONFIG_PATH?.trim();
  const candidates = explicitPath ? [explicitPath, ".env"] : [".env"];

  for (const candidate of candidates) {
    const path = resolve(process.cwd(), candidate);
    if (!existsSync(path)) continue;
    loadDotenv({ path, override: false });
  }

  loaded = true;
}

function requireString(name: string) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`[env] ${name} is required.`);
  }
  return value;
}

function optionalString(name: string) {
  const value = process.env[name]?.trim();
  return value && value.length > 0 ? value : undefined;
}

function parsePositiveInt(name: string, fallback?: number) {
  const raw = optionalString(name);
  if (!raw) {
    if (fallback !== undefined) return fallback;
    throw new Error(`[env] ${name} is required.`);
  }

  const value = Number(raw);
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`[env] ${name} must be a positive integer.`);
  }

  return value;
}

loadBackendEnv();

export const env = {
  databaseUrl: requireString("DATABASE_URL"),
  jwtSecret: requireString("JWT_SECRET"),
  jwtExpiresIn: parsePositiveInt("JWT_EXPIRES_IN"),
  port: parsePositiveInt("PORT", 4000),
  gptModel: optionalString("GPT_MODEL") ?? "gpt-4o-mini",
  gptApiKey: optionalString("GPT_API_KEY"),
  gptEndpoint:
    optionalString("GPT_ENDPOINT") ?? "https://api.openai.com/v1/responses",
} as const;
