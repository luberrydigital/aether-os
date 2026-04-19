import type { ChatMessage, ChatModelConfig, LlmProviderId } from "./types";

/**
 * Active LLM: `LLM_PROVIDER=openai` or `anthropic`.
 * If unset, OpenAI is preferred when `OPENAI_API_KEY` exists; otherwise Anthropic when `ANTHROPIC_API_KEY` exists.
 */
function detectProvider(): LlmProviderId | null {
  const p = (process.env.LLM_PROVIDER ?? "").toLowerCase().trim();
  if (p === "openai" || p === "anthropic") return p;
  if (process.env.OPENAI_API_KEY) return "openai";
  if (process.env.ANTHROPIC_API_KEY) return "anthropic";
  return null;
}

function defaultModel(provider: LlmProviderId): string {
  const globalModel = process.env.LLM_MODEL?.trim();
  if (globalModel) return globalModel;
  switch (provider) {
    case "openai": {
      const m = process.env.OPENAI_MODEL?.trim();
      return m || "gpt-4o-mini";
    }
    case "anthropic": {
      const m = process.env.ANTHROPIC_MODEL?.trim();
      return m || "claude-sonnet-4-20250514";
    }
    default:
      return "gpt-4o-mini";
  }
}

export function getChatModelConfig(): ChatModelConfig | null {
  const provider = detectProvider();
  if (!provider) return null;
  return { provider, model: defaultModel(provider) };
}

async function callOpenAICompatible(
  url: string,
  headers: Record<string, string>,
  body: Record<string, unknown>
): Promise<string> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
  const raw = await res.text();
  if (!res.ok) {
    throw new Error(`LLM HTTP ${res.status}: ${raw.slice(0, 400)}`);
  }
  const data = JSON.parse(raw) as {
    choices?: { message?: { content?: string } }[];
    content?: { text?: string }[];
  };
  const fromChat = data.choices?.[0]?.message?.content;
  if (typeof fromChat === "string") return fromChat;
  const anthropicText = Array.isArray(data.content)
    ? data.content.map((b) => b?.text ?? "").join("")
    : "";
  if (anthropicText) return anthropicText;
  throw new Error("LLM response missing text content");
}

async function invokeOpenAI(
  cfg: ChatModelConfig,
  messages: ChatMessage[]
): Promise<string> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("OPENAI_API_KEY not set");
  return callOpenAICompatible(
    "https://api.openai.com/v1/chat/completions",
    { Authorization: `Bearer ${key}` },
    {
      model: cfg.model,
      temperature: 0.4,
      messages,
      response_format: { type: "json_object" },
    }
  );
}

async function invokeAnthropic(
  cfg: ChatModelConfig,
  messages: ChatMessage[]
): Promise<string> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error("ANTHROPIC_API_KEY not set");
  const system = messages.filter((m) => m.role === "system");
  const rest = messages.filter((m) => m.role !== "system");
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: cfg.model,
      max_tokens: 4096,
      temperature: 0.4,
      system: system.map((m) => m.content).join("\n\n"),
      messages: rest.map((m) => ({
        role: m.role === "user" ? "user" : "assistant",
        content: m.content,
      })),
    }),
  });
  const raw = await res.text();
  if (!res.ok) {
    throw new Error(`Anthropic HTTP ${res.status}: ${raw.slice(0, 400)}`);
  }
  const data = JSON.parse(raw) as {
    content?: { type?: string; text?: string }[];
  };
  const text = (data.content ?? [])
    .map((c) => (c.type === "text" ? c.text ?? "" : ""))
    .join("");
  if (!text.trim()) throw new Error("Anthropic response missing text");
  return text;
}

/**
 * Model-agnostic text generation (JSON-oriented prompts).
 * OpenAI (default) or Anthropic Claude: set `LLM_PROVIDER` or rely on key order (OpenAI first).
 * Model: `LLM_MODEL` overrides all; else `OPENAI_MODEL` / `ANTHROPIC_MODEL` per provider, then defaults.
 */
export async function generateLlmText(
  messages: ChatMessage[]
): Promise<string> {
  const cfg = getChatModelConfig();
  if (!cfg) {
    throw new Error(
      "No LLM configured (set OPENAI_API_KEY and/or ANTHROPIC_API_KEY, optional LLM_PROVIDER)."
    );
  }
  switch (cfg.provider) {
    case "openai":
      return invokeOpenAI(cfg, messages);
    case "anthropic":
      return invokeAnthropic(cfg, messages);
    default:
      throw new Error(`Unsupported LLM_PROVIDER`);
  }
}

export async function generateLlmJson<T>(
  messages: ChatMessage[],
  fallback: () => T
): Promise<T> {
  try {
    const cfg = getChatModelConfig();
    if (!cfg) return fallback();
    let text: string;
    switch (cfg.provider) {
      case "openai":
        text = await invokeOpenAI(cfg, messages);
        break;
      case "anthropic":
        text = await invokeAnthropic(cfg, messages);
        break;
      default:
        return fallback();
    }
    const cleaned = text.replace(/^```json\s*/i, "").replace(/```\s*$/i, "");
    return JSON.parse(cleaned) as T;
  } catch {
    return fallback();
  }
}
