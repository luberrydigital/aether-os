import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { generateDailyCoach } from "@/lib/empire/intelligence";
import { getRouteSession } from "@/lib/auth/session";
import { dbGetUserById, dbLatestCompanyForUser } from "@/lib/db/local-db";
import { tierHasFeature } from "@/lib/subscriptions/tiers";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
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
  if (!tierHasFeature(tier, "daily_coach")) {
    return NextResponse.json(
      { error: "Upgrade to Pro to unlock your Daily AI Business Coach." },
      { status: 403 }
    );
  }

  const company = await dbLatestCompanyForUser(userId);
  const blueprint = company?.creator_blueprint as { businessName?: string } | null;

  const insight = await generateDailyCoach({
    businessName: blueprint?.businessName,
    revenueZar: (company?.total_net_zar_cents ?? 0) / 100,
    tier,
  });

  return NextResponse.json({ ok: true, insight, date: new Date().toISOString().slice(0, 10) });
}
