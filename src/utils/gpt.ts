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

export async function callGptStructuredJson(params: {
  model: string;
  prompt: string;
  schemaName: string;
  schema: JsonSchema;
}): Promise<string> {
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

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: params.model,
      input: params.prompt,
      max_output_tokens: 800,

      text: {
        format: {
          type: "json_schema",
          name: params.schemaName,
          strict: true,
          schema: params.schema,
        },
      },
    }),
  });

  if (res.status === 429)
    throw new AppError(
      429,
      "UPSTREAM_QUOTA",
      "현재 검사 사용량/크레딧이 부족합니다.",
    );

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new AppError(
      502,
      "JA_CHECK_UPSTREAM_FAILED",
      `검사 요청에 실패했습니다.(${res.status}) ${errText}`.slice(0, 600),
    );
  }

  const json = await res.json();

  const outText = extractOutputText(json);

  if (!outText) {
    throw new AppError(
      502,
      "JA_CHECK_BAD_UPSTREAM",
      "검사 응답에서 텍스트를 추출하지 못했습니다.",
    );
  }

  try {
    return JSON.parse(outText);
  } catch {
    throw new AppError(
      502,
      "JA_CHECK_PARSE_FAILED",
      "검사 응답 JSON 파싱에 실패했습니다.",
    );
  }
}
