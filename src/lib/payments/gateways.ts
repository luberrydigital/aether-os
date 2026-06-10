export type PaymentGatewayId = "payfast" | "paystack";

export type PaymentGatewayMeta = {
  id: PaymentGatewayId;
  label: string;
  shortLabel: string;
  region: string;
  /** Docs / sandbox portal for operators */
  docsUrl: string;
  /** Env vars checked server-side (no secret values exposed to client) */
  envKeys: string[];
  /**
   * Copy-paste template for `.env.local` using sandbox / test shapes.
   * Replace placeholders with keys from each provider’s dashboard.
   */
  testEnvTemplate: string;
};

export const PAYMENT_GATEWAYS: readonly PaymentGatewayMeta[] = [
  {
    id: "payfast",
    label: "PayFast",
    shortLabel: "SA cards & EFT",
    region: "South Africa — PayFast Checkout (sandbox)",
    docsUrl: "https://developers.payfast.co.za/docs#sandbox-testing",
    envKeys: ["PAYFAST_MERCHANT_ID", "PAYFAST_MERCHANT_KEY", "PAYFAST_PASSPHRASE"],
    testEnvTemplate: `# PayFast sandbox — https://sandbox.payfast.co.za/
PAYFAST_MERCHANT_ID=10000100
PAYFAST_MERCHANT_KEY=46f0cd694581a
PAYFAST_PASSPHRASE=jt7NOE43FZPn`,
  },
  {
    id: "paystack",
    label: "Paystack",
    shortLabel: "Cards & bank (Africa)",
    region: "Nigeria, Ghana, Kenya, South Africa & more (test mode)",
    docsUrl: "https://paystack.com/docs/payments/test-payments",
    envKeys: ["PAYSTACK_PUBLIC_KEY", "PAYSTACK_SECRET_KEY"],
    testEnvTemplate: `# Paystack test — https://dashboard.paystack.com/#/settings/developer
PAYSTACK_PUBLIC_KEY=pk_test_REPLACE_ME
PAYSTACK_SECRET_KEY=sk_test_REPLACE_ME`,
  },
] as const;

export function gatewayMeta(id: PaymentGatewayId): PaymentGatewayMeta {
  const found = PAYMENT_GATEWAYS.find((g) => g.id === id);
  if (!found) return PAYMENT_GATEWAYS[0]!;
  return found;
}

/** Public key for Paystack (server or client); supports legacy NEXT_PUBLIC name. */
export function paystackPublicKeyFromEnv(): string | undefined {
  const a = process.env.PAYSTACK_PUBLIC_KEY?.trim();
  if (a) return a;
  return process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY?.trim();
}

