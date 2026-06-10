import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { generateAgentContent } from "@/lib/agents/content-generator";
import { getRouteSession } from "@/lib/auth/session";
import { dbGetUserById, dbIncrementAgentGeneration } from "@/lib/db/local-db";
import { tierAgentGenerationLimit } from "@/lib/subscriptions/tiers";

export const runtime = "nodejs";

const bodySchema = z.object({
  type: z.enum(["social", "email", "product"]),
  context: z.string().min(3).max(2000),
  businessName: z.string().max(200).optional(),
});

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
  const limit = tierAgentGenerationLimit(tier);
  const today = new Date().toISOString().slice(0, 10);
  const currentCount =
    user.agentGenerationsDate === today ? (user.agentGenerationsToday ?? 0) : 0;

  if (currentCount >= limit) {
    return NextResponse.json(
      {
        error: `Daily limit reached (${limit} generations). Upgrade to Pro for unlimited access.`,
        limit,
        tier,
      },
      { status: 429 }
    );
  }

  let body: z.infer<typeof bodySchema>;
  try {
    body = bodySchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const content = await generateAgentContent({
    type: body.type,
    context: body.context,
    businessName: body.businessName,
  });

  const usage = await dbIncrementAgentGeneration(userId);

  return NextResponse.json({
    ok: true,
    content,
    usage: { count: usage.count, limit: limit === Infinity ? null : limit, tier },
  });
}
