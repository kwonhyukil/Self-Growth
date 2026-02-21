import { AppError } from "./AppError";

type JsonSchema = Record<string, any>;

function extractOutputText(responseJson: any): string {
  const output = responseJson?.output;
  if (!Array.isArray(output)) return "";

  let text = "";
  for (const item of output) {
    const content = item?.content;
    if (!Array.isArray(content)) continue;

    for (const part of content) {
      if (part?.type === "output_text" && typeof part?.text === "string") {
        text += part.text;
      }
    }
  }
  return text.trim();
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function safeReadErrorBody(res: Response): Promise<any> {
  const ct = res.headers.get("content-type") || "";

  try {
    if (ct.includes("application/json")) {
      const j = await res.json();
      const msg =
        j?.error?.message || j?.message || JSON.stringify(j).slice(0, 600);
      return String(msg).slice(0, 600);
    }
  } catch {}
  try {
    return (await res.text()).slice(0, 600);
  } catch {
    return "";
  }
}

function mapUpstreamError(status: number, bodyMsg: string) {
  if (status === 401) {
    return new AppError(
      502,
      "UPSTREAM_AUTH_FAILED",
      "검사 엔진 인증 설정(키/권한)에 문제가 있습니다.",
    );
  }

  if (status === 429) {
    return new AppError(
      429,
      "UPSTREAM_QUOTA",
      "요청이 많거나 크레딧이 부족합니다. 잠시 후 다시 시도해주세요.",
    );
  }

  if (status === 400 && bodyMsg.includes("invalid_json_schema")) {
    return new AppError(
      500,
      "UPSTREAM_SCHEMA_INVALID",
      "서버의 응답 스키마 설정이 올바르지 않습니다.",
      { upstreamStatus: status },
    );
  }

  if (status >= 500 && status < 600) {
    return new AppError(
      502,
      "UPSTREAM_TEMPORARY_FAILED",
      "검사 엔진이 일시적으로 불안정합니다. 잠시 후 다시 시도해주세요.",
      { upstreamStatus: status },
    );
  }

  return new AppError(
    502,
    "JA_CHECK_UPSTREAM_FAILED",
    `검사 요청에 실패했습니다.(${status})`,
    { upstreamStatus: status, upstreamMessage: bodyMsg },
  );
}

export async function callGptStructuredJson<T = any>(params: {
  model: string;
  prompt: string;
  schemaName: string;
  schema: JsonSchema;
  maxOutputTokens?: number;
  timeoutMs?: number;
  retries?: number;
}): Promise<T> {
  // const { model, prompt } = params;

  const endpoint =
    process.env.GPT_ENDPOINT || "https://api.openai.com/v1/responses";
  const apiKey = process.env.GPT_API_KEY;

  if (!apiKey) {
    throw new AppError(
      500,
      "GPT_CONFIG_MISSING",
      "GPT_API_KEY가 설정되어 있지 않습니다.",
    );
  }

  const max_output_tokens = params.maxOutputTokens ?? 800;
  const timeoutMs = params.timeoutMs ?? 2000;
  const retries = params.retries ?? 1;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const ac = new AbortController();
    const timer = setTimeout(() => ac.abort(), timeoutMs);

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: params.model,
          input: params.prompt,
          max_output_tokens,

          text: {
            format: {
              type: "json_schema",
              name: params.schemaName,
              strict: true,
              schema: params.schema,
            },
          },
        }),
        signal: ac.signal,
      });

      clearTimeout(timer);

      if (res.status === 429)
        throw new AppError(
          429,
          "UPSTREAM_QUOTA",
          "현재 검사 사용량/크레딧이 부족합니다.",
        );

      if (!res.ok) {
        const bodyMsg = await safeReadErrorBody(res);
        const status = res.status;

        const retryable = status === 429 || (status > 500 && status < 600);

        if (attempt < retries && retryable) {
          await sleep(300 * (attempt + 1));
          continue;
        }

        throw mapUpstreamError(status, bodyMsg);
      }

      const json = await res.json();

      const outText = extractOutputText(json);

      if (!outText) {
        throw new AppError(
          502,
          "JA_CHECK_BAD_UPSTREAM",
          "검사 읍답에서 텍스트를 추출하지 못했습니다.",
        );
      }

      try {
        return JSON.parse(outText) as T;
      } catch {
        throw new AppError(
          502,
          "JA_CHECK_PARSE_FAILED",
          "검사 응답 JSON 파싱에 실패했습니다.",
        );
      }
    } catch (err: any) {
      clearTimeout(timer);

      const isAbort = err?.name === "AbortError";
      if (isAbort) {
        if (attempt < retries) {
          await sleep(300 * (attempt + 1));
          continue;
        }
        throw new AppError(
          504,
          "UPSTREAM_TIMEOUT",
          "검사 요청 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.",
        );
      }

      if (err instanceof AppError) throw err;

      if (attempt < retries) {
        await sleep(300 * (attempt + 1));
        continue;
      }

      throw new AppError(
        502,
        "UPSTREAM_NETWORK_FAILED",
        "검사 엔진 연결에 실패했습니다. 잠시 후 다시 시도해주세요.",
      );
    }
  }

  throw new AppError(
    502,
    "JA_CHECK_UPSTREAM_FAILED",
    "검사 요청에 실패했습니다.",
  );
}
