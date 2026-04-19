import { NextResponse } from "next/server";
import { paystackPublicKeyFromEnv, stripePublishableKeyFromEnv } from "@/lib/payments/gateways";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    sandbox: true,
    gateways: {
      stripe: {
        configured: Boolean(
          stripePublishableKeyFromEnv() && process.env.STRIPE_SECRET_KEY
        ),
      },
      payfast: {
        configured: Boolean(
          process.env.PAYFAST_MERCHANT_ID &&
            process.env.PAYFAST_MERCHANT_KEY &&
            process.env.PAYFAST_PASSPHRASE
        ),
      },
      paystack: {
        configured: Boolean(
          paystackPublicKeyFromEnv() && process.env.PAYSTACK_SECRET_KEY
        ),
      },
    },
  });
}
