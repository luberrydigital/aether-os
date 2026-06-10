import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { analyzeCompetitor } from "@/lib/empire/intelligence";
import { getRouteSession } from "@/lib/auth/session";
import { dbGetUserById, dbLatestCompanyForUser } from "@/lib/db/local-db";
import { tierHasFeature } from "@/lib/subscriptions/tiers";

export const runtime = "nodejs";

const bodySchema = z.object({
  competitor: z.string().min(2).max(200),
  niche: z.string().max(200).optional(),
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
  if (!tierHasFeature(tier, "competitor_spy")) {
    return NextResponse.json(
      { error: "Upgrade to Elite to unlock Smart Competitor Spy." },
      { status: 403 }
    );
  }

  let body: z.infer<typeof bodySchema>;
  try {
    body = bodySchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const company = await dbLatestCompanyForUser(userId);
  const blueprint = company?.creator_blueprint as { businessName?: string } | null;

  const report = await analyzeCompetitor({
    competitor: body.competitor,
    niche: body.niche ?? company?.sentence ?? "AI business",
    businessName: blueprint?.businessName,
  });

  return NextResponse.json({ ok: true, report });
}
