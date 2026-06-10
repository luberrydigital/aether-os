import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getRouteSession } from "@/lib/auth/session";
import { dbCancelUserSubscription } from "@/lib/db/local-db";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const session = await getRouteSession(request);
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await dbCancelUserSubscription(userId);
  if (!result) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const { billing, immediate } = result;

  return NextResponse.json({
    ok: true,
    immediate,
    billing,
    message: immediate
      ? "Your trial has been cancelled. You are now on the Free plan."
      : billing.cancelEffectiveAt
        ? `Subscription cancelled. Access continues until ${new Date(billing.cancelEffectiveAt).toLocaleDateString("en-ZA")}.`
        : "Subscription cancelled.",
  });
}
