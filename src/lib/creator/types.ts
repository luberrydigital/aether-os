import type { OrchestrationPublicState } from "@/lib/agents/orchestration-types";

export type CreatorAgentRole = {
  name: string;
  focus: string;
};

export type CreatorBlueprint = {
  businessName: string;
  description: string;
  agentTeam: CreatorAgentRole[];
  firstWeekRevenue: {
    low: number;
    high: number;
    currency: "USD";
  };
  /** Full multi-agent orchestration snapshot from launch (LLM + heuristics fallback). */
  orchestration?: OrchestrationPublicState;
};
