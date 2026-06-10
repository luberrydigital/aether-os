import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getRouteSession } from "@/lib/auth/session";
import { dbGetUserWithBilling } from "@/lib/db/local-db";
import { getTierDefinition } from "@/lib/subscriptions/tiers";
import { SUBSCRIPTION_TIERS } from "@/lib/subscriptions/tiers";
import { isEmailConfigured } from "@/lib/email/send";

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

  const { user, billing } = result;
  const tierDef = getTierDefinition(billing.effectiveTier);

  return NextResponse.json({
    email: user.email,
    displayName: user.displayName ?? null,
    billing: {
      ...billing,
      tierName: tierDef.name,
      priceLabel: tierDef.priceLabel,
    },
    tiers: SUBSCRIPTION_TIERS,
    emailConfigured: isEmailConfigured(),
  });
}
