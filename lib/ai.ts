import { db } from "@/lib/db";

type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export async function getAISettings() {
  const setting = await db.userSetting.findFirst({ orderBy: { updatedAt: "desc" } });
  const apiKey = setting?.openaiApiKey || process.env.OPENAI_API_KEY;
  const baseUrl = setting?.openaiBaseUrl || process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
  const model = setting?.openaiModel || process.env.OPENAI_MODEL || "gpt-4o-mini";

  if (!apiKey) {
    throw new Error("尚未配置模型 API Key，请先到 /settings 保存 OpenAI-compatible API 配置。");
  }

  return {
    apiKey,
    baseUrl: baseUrl.replace(/\/$/, ""),
    model
  };
}

export async function generateChatCompletion(messages: ChatMessage[], temperature = 0.65) {
  const settings = await getAISettings();
  const response = await fetch(`${settings.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${settings.apiKey}`
    },
    body: JSON.stringify({
      model: settings.model,
      messages,
      temperature
    })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`模型调用失败：${response.status} ${text.slice(0, 600)}`);
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const output = data.choices?.[0]?.message?.content?.trim();
  if (!output) throw new Error("模型没有返回有效内容。");
  return output;
}
