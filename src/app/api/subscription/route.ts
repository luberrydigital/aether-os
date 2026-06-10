import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { getRouteSession } from "@/lib/auth/session";
import { dbGetUserWithBilling, dbSetUserSubscription } from "@/lib/db/local-db";
import { SUBSCRIPTION_TIERS, type SubscriptionTier } from "@/lib/subscriptions/tiers";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const session = await getRouteSession(request);
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await dbGetUserWithBilling(userId);
  if (!result) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({
    tier: result.billing.effectiveTier,
    billing: result.billing,
    tiers: SUBSCRIPTION_TIERS,
  });
}

const upgradeSchema = z.object({
  tier: z.enum(["free", "pro", "elite", "empire"]),
});

export async function POST(request: NextRequest) {
  const session = await getRouteSession(request);
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: z.infer<typeof upgradeSchema>;
  try {
    body = upgradeSchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
  }

  const user = await dbSetUserSubscription(userId, body.tier as SubscriptionTier);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const tierDef = SUBSCRIPTION_TIERS.find((t) => t.id === body.tier);

  const refreshed = await dbGetUserWithBilling(userId);

  return NextResponse.json({
    ok: true,
    tier: user.subscriptionTier,
    billing: refreshed?.billing,
    message:
      body.tier === "free"
        ? "Downgraded to Free plan."
        : `Upgraded to ${tierDef?.name ?? body.tier}. Billing integration coming soon — enjoy full access in sandbox mode.`,
  });
}
