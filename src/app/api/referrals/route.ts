import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getRouteSession } from "@/lib/auth/session";
import {
  dbCountReferrals,
  dbGetUserById,
  dbListReferralEarnings,
  dbReferralEarningsTotals,
} from "@/lib/db/local-db";
import { REFERRAL_SUBSCRIPTION_COMMISSION_RATE } from "@/lib/referrals/codes";

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

  const [referralCount, totals, earnings] = await Promise.all([
    dbCountReferrals(userId),
    dbReferralEarningsTotals(userId),
    dbListReferralEarnings(userId, 20),
  ]);

  const origin = request.nextUrl.origin;
  const referralLink = `${origin}/login?ref=${user.referralCode}`;

  return NextResponse.json({
    referralCode: user.referralCode,
    referralLink,
    commissionRate: REFERRAL_SUBSCRIPTION_COMMISSION_RATE,
    commissionLabel: "25% of subscription fees — for life",
    referralCount,
    totals,
    earnings,
  });
}
