import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { runLaunchGraph } from "@/lib/agents/launch-graph";
import { runOrchestrationSyncForLaunch } from "@/lib/agents/orchestration-graph";
import { buildCreatorBlueprintFromOrchestration } from "@/lib/creator/from-orchestration";
import type { CreatorBlueprint } from "@/lib/creator/types";
import { getRouteSession } from "@/lib/auth/session";
import { dbInsertCompany } from "@/lib/db/local-db";
import {
  createStorefrontFromDesigner,
  shouldCreateStorefront,
} from "@/lib/storefront/create-storefront";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const session = await getRouteSession(request);
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const sentence =
    typeof body?.sentence === "string" ? body.sentence.trim() : "";

  if (!sentence) {
    return NextResponse.json(
      { error: "Describe your AI business in one sentence." },
      { status: 400 }
    );
  }

  const [graph, orchestration] = await Promise.all([
    runLaunchGraph(sentence),
    runOrchestrationSyncForLaunch(sentence),
  ]);
  let blueprint = buildCreatorBlueprintFromOrchestration(orchestration);

  const inserted = await dbInsertCompany({
    user_id: userId,
    sentence,
    agent_plan: graph.agents,
    creator_blueprint: blueprint,
    total_revenue_usd_cents: 0,
    total_revenue_zar_cents: 0,
    total_platform_fee_usd_cents: 0,
    total_platform_fee_zar_cents: 0,
    total_net_usd_cents: 0,
    total_net_zar_cents: 0,
  });

  let storefrontWarning: string | undefined;

  const designer = orchestration.businessDesigner;
  if (
    inserted?.id &&
    designer &&
    shouldCreateStorefront(designer)
  ) {
    const created = await createStorefrontFromDesigner({
      companyId: inserted.id,
      userId,
      designer,
    });

    if (created.ok) {
      const nextBlueprint: CreatorBlueprint = {
        ...blueprint,
        storefrontSlug: created.slug,
        storefrontPath: `/store/${created.slug}`,
      };
      blueprint = nextBlueprint;
    } else {
      storefrontWarning = created.reason;
    }
  }

  return NextResponse.json({
    blueprint,
    agents: graph.agents,
    narrative: graph.narrative,
    storefrontWarning,
  });
}
