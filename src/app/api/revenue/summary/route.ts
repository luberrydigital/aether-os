import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getRouteSession } from "@/lib/auth/session";
import {
  dbGetUserWithBilling,
  dbLatestCompanyForUser,
  dbListPrintfulOrders,
  dbListRevenueLogs,
} from "@/lib/db/local-db";
import { computeRevenueMetrics } from "@/lib/revenue/metrics";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const session = await getRouteSession(request);
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userResult = await dbGetUserWithBilling(userId);
  const company = await dbLatestCompanyForUser(userId);
  if (!company?.id) {
    return NextResponse.json({
      company: null,
      totals: null,
      logs: [],
      orders: [],
      metrics: null,
      subscriptionTier: userResult?.billing.effectiveTier ?? "free",
      billing: userResult?.billing ?? null,
    });
  }

  const logs = await dbListRevenueLogs(company.id, 100);
  const orders = await dbListPrintfulOrders(company.id, 25);
  const metrics = computeRevenueMetrics(logs);

  return NextResponse.json({
    company: { id: company.id },
    subscriptionTier: userResult?.billing.effectiveTier ?? "free",
    billing: userResult?.billing ?? null,
    metrics,
    totals: {
      revenue: {
        usdCents: company.total_revenue_usd_cents ?? 0,
        zarCents: company.total_revenue_zar_cents ?? 0,
      },
      platformFees: {
        usdCents: company.total_platform_fee_usd_cents ?? 0,
        zarCents: company.total_platform_fee_zar_cents ?? 0,
      },
      net: {
        usdCents: company.total_net_usd_cents ?? 0,
        zarCents: company.total_net_zar_cents ?? 0,
      },
    },
    logs,
    orders: orders.map((o) => ({
      id: o.id,
      created_at: o.created_at,
      currency: o.currency,
      gross_cents: o.gross_cents,
      net_cents: o.net_cents,
      printful_order_id: o.printful_order_id,
      printful_status: o.printful_status,
      tracking_number: o.tracking_number,
      tracking_url: o.tracking_url,
      product_id: o.product_id,
      storefront_id: o.storefront_id,
    })),
  });
}

