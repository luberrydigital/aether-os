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
  /** Public storefront slug after ecommerce launch + DB insert. */
  storefrontSlug?: string;
  /** Path to the generated Next.js storefront route. */
  storefrontPath?: string;
  /** Full multi-agent orchestration snapshot from launch (LLM + heuristics fallback). */
  orchestration?: OrchestrationPublicState;
};
