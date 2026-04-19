import {
  heuristicBusinessDesigner,
  heuristicFinance,
} from "@/lib/agents/orchestration-heuristics";
import type { OrchestrationPublicState } from "@/lib/agents/orchestration-types";
import type { CreatorBlueprint } from "./types";

export function buildCreatorBlueprintFromOrchestration(
  pub: OrchestrationPublicState
): CreatorBlueprint {
  const bd = pub.businessDesigner ?? heuristicBusinessDesigner(pub.sentence);
  const fin = pub.financePayment ?? heuristicFinance(pub.sentence);
  const low = Math.max(0, fin.netAfterPlatformFee);
  const high = Math.max(fin.projectedWeekOneGross, low);

  return {
    businessName: bd.businessName,
    description: [bd.tagline, bd.executiveSummary].filter(Boolean).join("\n\n"),
    agentTeam: bd.agentTeam.map((a) => ({ name: a.name, focus: a.mandate })),
    firstWeekRevenue: {
      low,
      high,
      currency: "USD",
    },
    orchestration: pub,
  };
}
