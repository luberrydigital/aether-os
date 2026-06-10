import { NextResponse } from "next/server";
import { getPaymentsGatewayFlags } from "@/lib/env/env-status";

export const runtime = "nodejs";

export async function GET() {
  // Public: only exposes whether keys exist (no secrets). Dashboard and docs UIs use this.
  const p = getPaymentsGatewayFlags();
  return NextResponse.json({
    sandbox: p.sandbox,
    gateways: {
      payfast: p.payfast,
      paystack: p.paystack,
    },
  });
}
