import type { PaymentGatewayId } from "./gateways";
import { platformFeeRateFromId } from "./platform-fee";

export type PayoutRow = {
  id: string;
  at: string;
  gateway: PaymentGatewayId;
  currency: "ZAR" | "USD";
  grossCents: number;
  platformFeeRate: number;
  platformFeeCents: number;
  netCents: number;
  status: "sandbox_settled" | "sandbox_pending";
  reference: string;
};

function mulberry32(seed: number) {
  return function next() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashSeed(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i += 1) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h) || 1;
}

const GATEWAY_ROTATION: PaymentGatewayId[] = [
  "payfast",
  "stripe",
  "paystack",
  "payfast",
  "paystack",
  "stripe",
  "payfast",
  "paystack",
];

export function buildMockPayoutHistory(
  companyId: string,
  count = 8
): PayoutRow[] {
  const rand = mulberry32(hashSeed(companyId));
  const baseRate = platformFeeRateFromId(companyId);
  const rows: PayoutRow[] = [];
  const now = Date.now();

  for (let i = 0; i < count; i += 1) {
    const gateway = GATEWAY_ROTATION[i % GATEWAY_ROTATION.length];
    const currency: "ZAR" | "USD" =
      gateway === "stripe" || (gateway === "paystack" && i % 4 === 0)
        ? "USD"
        : "ZAR";
    const grossBase =
      currency === "ZAR"
        ? 15_000 + Math.floor(rand() * 85_000)
        : 2500 + Math.floor(rand() * 12_000);
    const grossCents = grossBase;
    const jitter = (Math.floor(rand() * 41) - 20) / 10_000;
    const rate = Math.min(0.22, Math.max(0.18, baseRate + jitter));
    const platformFeeCents = Math.round(grossCents * rate);
    const netCents = grossCents - platformFeeCents;
    const at = new Date(now - (i + 1) * 3_600_000 * (1 + Math.floor(rand() * 5))).toISOString();

    rows.push({
      id: `payout-${companyId}-${i}`,
      at,
      gateway,
      currency,
      grossCents,
      platformFeeRate: rate,
      platformFeeCents,
      netCents,
      status: i === 0 ? "sandbox_pending" : "sandbox_settled",
      reference: `SBX-${gateway.toUpperCase()}-${100000 + Math.floor(rand() * 899999)}`,
    });
  }

  return rows;
}
