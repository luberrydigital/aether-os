export type ChatMessage = {
  role: "system" | "user";
  content: string;
};

export type LlmProviderId = "openai" | "anthropic";

export type ChatModelConfig = {
  provider: LlmProviderId;
  model: string;
};
