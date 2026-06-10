import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { generateSocialPosts } from "@/lib/empire/intelligence";
import { getRouteSession } from "@/lib/auth/session";
import {
  dbGetUserById,
  dbInsertSocialPosts,
  dbLatestCompanyForUser,
  dbListSocialPosts,
} from "@/lib/db/local-db";
import { tierHasFeature } from "@/lib/subscriptions/tiers";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const session = await getRouteSession(request);
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const posts = await dbListSocialPosts(userId);
  const user = await dbGetUserById(userId);
  const tier = user?.subscriptionTier ?? "free";

  return NextResponse.json({
    posts,
    enabled: tierHasFeature(tier, "auto_social"),
    platforms: ["facebook", "instagram", "tiktok", "x"],
  });
}

const scheduleSchema = z.object({
  businessName: z.string().optional(),
  niche: z.string().optional(),
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
  if (!tierHasFeature(tier, "auto_social")) {
    return NextResponse.json(
      { error: "Upgrade to Elite to unlock Auto Social Media Manager." },
      { status: 403 }
    );
  }

  let body: z.infer<typeof scheduleSchema>;
  try {
    body = scheduleSchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const company = await dbLatestCompanyForUser(userId);
  const blueprint = company?.creator_blueprint as { businessName?: string } | null;
  const businessName = body.businessName ?? blueprint?.businessName ?? "My AI Business";
  const niche = body.niche ?? company?.sentence?.slice(0, 80) ?? "AI business";

  const generated = generateSocialPosts({ businessName, niche });
  const now = Date.now();
  const posts = await dbInsertSocialPosts(
    generated.map((g, i) => ({
      user_id: userId,
      company_id: company?.id ?? null,
      platform: g.platform,
      content: g.content,
      status: "scheduled" as const,
      scheduled_at: new Date(now + (i + 1) * 3600_000 * 6).toISOString(),
    }))
  );

  return NextResponse.json({
    ok: true,
    posts,
    message: `4 posts scheduled across Facebook, Instagram, TikTok, and X. Auto-posting begins within 6 hours.`,
  });
}
