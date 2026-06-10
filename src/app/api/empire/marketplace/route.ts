import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { MARKETPLACE_CATALOG } from "@/lib/empire/marketplace";
import { getRouteSession } from "@/lib/auth/session";
import { dbAddOwnedAgent, dbGetUserById } from "@/lib/db/local-db";
import { tierHasFeature } from "@/lib/subscriptions/tiers";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const session = await getRouteSession(request);
  const userId = session?.user?.id;
  const user = userId ? await dbGetUserById(userId) : null;
  const tier = user?.subscriptionTier ?? "free";

  return NextResponse.json({
    agents: MARKETPLACE_CATALOG,
    ownedAgentIds: user?.ownedAgentIds ?? [],
    canBuy: tierHasFeature(tier, "marketplace_buy"),
    canSell: tierHasFeature(tier, "marketplace_sell"),
    tier,
  });
}

const buySchema = z.object({ agentId: z.string() });

export async function POST(request: NextRequest) {
  const session = await getRouteSession(request);
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await dbGetUserById(userId);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const tier = user.subscriptionTier ?? "free";
  if (!tierHasFeature(tier, "marketplace_buy")) {
    return NextResponse.json(
      { error: "Upgrade to Pro to access the Agent Marketplace." },
      { status: 403 }
    );
  }

  let body: z.infer<typeof buySchema>;
  try {
    body = buySchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const agent = MARKETPLACE_CATALOG.find((a) => a.id === body.agentId);
  if (!agent) {
    return NextResponse.json({ error: "Agent not found" }, { status: 404 });
  }

  if (user.ownedAgentIds?.includes(agent.id)) {
    return NextResponse.json({ error: "You already own this agent." }, { status: 400 });
  }

  await dbAddOwnedAgent(userId, agent.id);

  return NextResponse.json({
    ok: true,
    agent,
    message: `${agent.name} deployed to your empire. Agent is now active 24/7.`,
  });
}
