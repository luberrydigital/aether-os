import { NextResponse } from "next/server";
import { runLaunchGraph } from "@/lib/agents/launch-graph";
import { runOrchestrationSyncForLaunch } from "@/lib/agents/orchestration-graph";
import { buildCreatorBlueprintFromOrchestration } from "@/lib/creator/from-orchestration";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
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
  const blueprint = buildCreatorBlueprintFromOrchestration(orchestration);

  const { error } = await supabase.from("companies").insert({
    user_id: user.id,
    sentence,
    agent_plan: graph.agents,
    creator_blueprint: blueprint,
  });

  if (error) {
    return NextResponse.json(
      {
        error: error.message,
        blueprint,
        agents: graph.agents,
        narrative: graph.narrative,
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    blueprint,
    agents: graph.agents,
    narrative: graph.narrative,
  });
}
