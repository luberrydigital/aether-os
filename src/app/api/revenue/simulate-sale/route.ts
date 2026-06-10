import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getRouteSession } from "@/lib/auth/session";
import { dbInsertRevenueLog, dbLatestCompanyForUser } from "@/lib/db/local-db";

export const runtime = "nodejs";

function clampFeeRate(rate: number): number {
  return Math.min(0.22, Math.max(0.18, rate));
}

function randomFeeRateInBand(): number {
  // 4dp precision feels realistic and stays in [0.18, 0.22]
  const raw = 0.18 + Math.random() * (0.22 - 0.18);
  return clampFeeRate(Math.round(raw * 10_000) / 10_000);
}

function randomInt(min: number, max: number): number {
  return Math.floor(min + Math.random() * (max - min + 1));
}

export async function POST(request: NextRequest) {
  const session = await getRouteSession(request);
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const company = await dbLatestCompanyForUser(userId);

  if (!company?.id) {
    return NextResponse.json(
      { error: "No company found. Create a launch first." },
      { status: 400 }
    );
  }

  const gateways = ["payfast", "paystack"] as const;
  const gateway = gateways[randomInt(0, gateways.length - 1)];
  const currency: "USD" | "ZAR" = Math.random() < 0.25 ? "USD" : "ZAR";

  // Keep amounts plausible for a demo dashboard
  const grossCents =
    currency === "USD" ? randomInt(2_500, 35_000) : randomInt(15_000, 180_000);

  const platformFeeRate = randomFeeRateInBand();
  const platformFeeCents = Math.round(grossCents * platformFeeRate);
  const netCents = Math.max(0, grossCents - platformFeeCents);
  const reference = `SIM-${gateway.toUpperCase()}-${Date.now()}`;

  const inserted = await dbInsertRevenueLog({
    company_id: company.id,
    user_id: userId,
    gateway,
    currency,
    gross_cents: grossCents,
    platform_fee_rate: platformFeeRate,
    platform_fee_cents: platformFeeCents,
    net_cents: netCents,
    reference,
    note: "Simulated real sale (writes to revenue_logs + rolls up totals).",
  });

  return NextResponse.json({ ok: true, log: inserted });
}

