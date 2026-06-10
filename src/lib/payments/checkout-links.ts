import type { PaymentGatewayId } from "@/lib/payments/gateways";

export type SandboxCheckoutParams = {
  gateway: PaymentGatewayId;
  slug: string;
  storefrontId: string;
  productId: string;
  title: string;
  priceCents: number;
  currency: string;
};

/**
 * Internal sandbox checkout route (no webhooks). Keeps gateway-specific entrypoints
 * so we can swap in real PayFast/Paystack server flows later.
 */
export function buildSandboxCheckoutUrl(p: SandboxCheckoutParams): string {
  const qs = new URLSearchParams({
    slug: p.slug,
    storefrontId: p.storefrontId,
    productId: p.productId,
    title: p.title,
    cents: String(p.priceCents),
    currency: p.currency,
  });
  return `/checkout/${p.gateway}?${qs.toString()}`;
}
