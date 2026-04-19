import type { LaunchAgent } from "@/lib/agents/launch-graph";
import type { CreatorBlueprint } from "@/lib/creator/types";
import { buildMockPayoutHistory } from "@/lib/payments/mock-payouts";
import { platformFeeRateFromId } from "@/lib/payments/platform-fee";
import { createClient } from "@/lib/supabase/server";
import { RevenueDashboardClient } from "@/components/revenue-dashboard-client";
import type { DashboardAgent } from "@/components/revenue/active-agents-panel";

function buildDashboardAgents(
  blueprint: CreatorBlueprint | null,
  graphAgents: unknown
): DashboardAgent[] {
  const safeAgents = Array.isArray(graphAgents) ? graphAgents : [];
  const team = Array.isArray(blueprint?.agentTeam) ? blueprint.agentTeam : [];
  if (team.length > 0) {
    return team.map((a, i) => ({
      id: `bp-${i}`,
      name: a.name,
      lane: "launch",
      mandate: a.focus,
    }));
  }
  return safeAgents.map((a) => {
    const agent = a as LaunchAgent;
    return {
      id: agent.id,
      name: agent.name,
      lane: agent.lane,
      mandate: agent.status,
    };
  });
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: companies, error: companiesError } = await supabase
    .from("companies")
    .select("id, sentence, agent_plan, creator_blueprint, created_at")
    .order("created_at", { ascending: false })
    .limit(12);

  const rows = companies ?? [];
  const latest = rows[0];
  const agentPlan = latest?.agent_plan;
  const safeAgents: LaunchAgent[] = Array.isArray(agentPlan)
    ? (agentPlan as LaunchAgent[])
    : [];
  const blueprint = latest?.creator_blueprint as CreatorBlueprint | null;

  const companyKey = latest?.id ?? `user-${user?.id ?? "anon"}`;
  const platformFeeRate = platformFeeRateFromId(companyKey);
  const payouts = buildMockPayoutHistory(companyKey);
  const agents = buildDashboardAgents(blueprint, safeAgents);

  return (
    <div className="min-h-screen bg-[oklch(0.07_0.03_280)]">
      {companiesError ? (
        <div className="border-b border-amber-500/35 bg-amber-950/40 px-5 py-4 text-sm text-amber-100 md:px-12">
          Could not load companies: {companiesError.message}. Run the SQL in{" "}
          <code className="rounded bg-black/30 px-1 py-0.5">
            supabase/migrations/*.sql
          </code>{" "}
          inside the Supabase SQL editor, then refresh.
        </div>
      ) : null}
      <RevenueDashboardClient
        businessName={blueprint?.businessName ?? null}
        agents={agents}
        payouts={payouts}
        platformFeeRate={platformFeeRate}
      />
    </div>
  );
}
