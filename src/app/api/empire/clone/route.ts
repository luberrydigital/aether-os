import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getRouteSession } from "@/lib/auth/session";
import {
  dbCloneCompany,
  dbGetUserById,
  dbLatestCompanyForUser,
  dbListUserCompanies,
} from "@/lib/db/local-db";
import { tierBusinessLimit, tierHasFeature } from "@/lib/subscriptions/tiers";

export const runtime = "nodejs";

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
  if (!tierHasFeature(tier, "one_click_clone")) {
    return NextResponse.json(
      { error: "Upgrade to Pro to unlock One-Click Clone." },
      { status: 403 }
    );
  }

  const companies = await dbListUserCompanies(userId);
  const limit = tierBusinessLimit(tier);
  if (companies.length >= limit) {
    return NextResponse.json(
      { error: "Business limit reached. Upgrade for unlimited businesses." },
      { status: 403 }
    );
  }

  const source = await dbLatestCompanyForUser(userId);
  if (!source) {
    return NextResponse.json(
      { error: "No business to clone. Launch one first." },
      { status: 400 }
    );
  }

  const clone = await dbCloneCompany(source.id, userId);
  if (!clone) {
    return NextResponse.json({ error: "Clone failed." }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    company: { id: clone.id, sentence: clone.sentence },
    message: "Business cloned successfully. Your duplicate empire is live.",
  });
}
