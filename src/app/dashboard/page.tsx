import type { LaunchAgent } from "@/lib/agents/launch-graph";
import type { CreatorBlueprint } from "@/lib/creator/types";
import { RevenueDashboardClient } from "@/components/revenue-dashboard-client";
import type { DashboardAgent } from "@/components/revenue/active-agents-panel";
import { getSession } from "@/lib/auth/session";
import { dbGetUserWithBilling, dbLatestCompanyForUser } from "@/lib/db/local-db";

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
  const session = await getSession();
  const userId = session?.user?.id;
  if (!userId) {
    return null;
  }

  const [latest, userBilling] = await Promise.all([
    dbLatestCompanyForUser(userId),
    dbGetUserWithBilling(userId),
  ]);
  const agentPlan = latest?.agent_plan;
  const safeAgents: LaunchAgent[] = Array.isArray(agentPlan) ? (agentPlan as LaunchAgent[]) : [];
  const blueprint = (latest?.creator_blueprint ?? null) as CreatorBlueprint | null;

  const agents = buildDashboardAgents(blueprint, safeAgents);

  return (
    <div className="min-h-screen bg-[oklch(0.07_0.03_280)]">
      <RevenueDashboardClient
        businessName={blueprint?.businessName ?? null}
        agents={agents}
        userEmail={session.user?.email ?? null}
        userDisplayName={userBilling?.user.displayName ?? null}
        initialBilling={userBilling?.billing ?? null}
      />
    </div>
  );
}
