import Link from "next/link";
import { notFound } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { PaymentGatewayId } from "@/lib/payments/gateways";
import { gatewayMeta } from "@/lib/payments/gateways";
import { platformFeeRateFromId } from "@/lib/payments/platform-fee";
import { cn } from "@/lib/utils";
import { PlaceOrderClient } from "./place-order-client";
import { getSession } from "@/lib/auth/session";
import { dbGetStorefrontById } from "@/lib/db/local-db";
import {
  payfastMerchantIdFromEnv,
  payfastMerchantKeyFromEnv,
  payfastPassphraseFromEnv,
  payfastProcessUrl,
  payfastSignature,
  toPayfastAmount,
} from "@/lib/payments/payfast";

function isGateway(g: string): g is PaymentGatewayId {
  return g === "payfast" || g === "paystack";
}

function money(cents: number, currency: string) {
  try {
    return new Intl.NumberFormat(currency === "ZAR" ? "en-ZA" : "en-US", {
      style: "currency",
      currency: currency === "ZAR" ? "ZAR" : "USD",
      maximumFractionDigits: 2,
    }).format(cents / 100);
  } catch {
    return `${(cents / 100).toFixed(2)} ${currency}`;
  }
}

export default async function SandboxCheckoutPage({
  params,
  searchParams,
}: {
  params: Promise<{ gateway: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { gateway: gwRaw } = await params;
  const sp = await searchParams;
  if (!isGateway(gwRaw)) notFound();

  const gateway = gwRaw;
  const title = typeof sp.title === "string" ? sp.title : "Product";
  const slug = typeof sp.slug === "string" ? sp.slug : "";
  const productId = typeof sp.productId === "string" ? sp.productId : "";
  const cents = Number(typeof sp.cents === "string" ? sp.cents : "");
  const currency =
    typeof sp.currency === "string" && sp.currency ? sp.currency : "USD";
  const storefrontId = typeof sp.storefrontId === "string" ? sp.storefrontId : "";

  if (!slug || !productId || !Number.isFinite(cents) || !storefrontId) notFound();

  const meta = gatewayMeta(gateway);
  const platformRate = platformFeeRateFromId(productId);
  const platformFeeCents = Math.round(cents * platformRate);
  const netToMerchantCents = Math.max(0, cents - platformFeeCents);

  // Ensure this page is authenticated for placing Printful orders.
  const session = await getSession();
  const user = session?.user ?? null;

  // PayFast live checkout (hosted by PayFast). We sign server-side.
  const baseUrl = process.env.NEXTAUTH_URL?.trim() || "http://localhost:3000";
  const pfEnabled = gateway === "payfast" && Boolean(payfastMerchantIdFromEnv() && payfastMerchantKeyFromEnv());
  const store = storefrontId ? await dbGetStorefrontById(storefrontId) : null;
  const companyId = store?.company_id ?? "";
  const mPaymentId = `aether-${companyId}-${productId}-${Date.now()}`;
  const payfastParams: Record<string, string> | null = pfEnabled
    ? {
        merchant_id: payfastMerchantIdFromEnv(),
        merchant_key: payfastMerchantKeyFromEnv(),
        return_url: `${baseUrl}/dashboard`,
        cancel_url: `${baseUrl}/store/${slug}/product/${productId}`,
        notify_url: `${baseUrl}/api/webhooks/payfast`,
        m_payment_id: mPaymentId,
        amount: toPayfastAmount(cents / 100),
        item_name: title,
        custom_str1: companyId,
        custom_str2: storefrontId,
        custom_str3: productId,
      }
    : null;
  const payfastSigned: Record<string, string> | null = payfastParams
    ? { ...payfastParams, signature: payfastSignature(payfastParams, payfastPassphraseFromEnv()) }
    : null;

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[oklch(0.07_0.03_280)] text-foreground">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-25%,oklch(0.45_0.22_285_/_0.42),transparent_55%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,oklch(0.05_0.03_280_/_0.96))]" />
      </div>

      <main className="mx-auto flex max-w-xl flex-col gap-8 px-5 py-14 md:py-20">
        <div className="text-center">
          <Badge className="border border-amber-400/35 bg-amber-500/15 text-amber-100">
            Sandbox checkout
          </Badge>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-white md:text-4xl">
            {meta.label}
          </h1>
          <p className="mt-2 text-sm text-zinc-400">{meta.region}</p>
        </div>

        <Card className="border-white/[0.1] bg-white/[0.04] ring-1 ring-white/[0.08] backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl text-white">
              <ShieldCheck className="size-5 text-emerald-300" aria-hidden />
              Order summary
            </CardTitle>
            <CardDescription className="text-zinc-400">
              No money is captured here. This route is a safe UI shell until
              server-side sessions (PayFast ITN, Paystack
              charge) are wired.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-zinc-300">
            <div className="rounded-xl border border-white/10 bg-black/40 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Item
              </p>
              <p className="mt-1 text-lg font-semibold text-white">{title}</p>
              <p className="mt-3 text-xs text-zinc-500">
                Store <span className="font-mono text-zinc-300">{slug}</span> ·
                Product{" "}
                <span className="font-mono text-zinc-300">{productId}</span>
              </p>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-white/10 bg-black/30 px-4 py-3">
              <span className="text-zinc-400">Total</span>
              <span className="font-mono text-xl font-bold text-emerald-200">
                {money(cents, currency)}
              </span>
            </div>
            <div className="grid gap-2 rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Aether OS platform fee</span>
                <span className="font-mono text-amber-200">
                  {(platformRate * 100).toFixed(1)}% ·{" "}
                  {money(platformFeeCents, currency)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Net to merchant (preview)</span>
                <span className="font-mono text-emerald-200">
                  {money(netToMerchantCents, currency)}
                </span>
              </div>
            </div>
            <p className="rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-100">
              {gateway === "payfast"
                ? "PayFast checkout is live: you will be redirected to PayFast to complete payment."
                : "Sandbox shell: Paystack checkout will be wired next."}
            </p>

            {gateway === "payfast" ? (
              payfastSigned ? (
                <form action={payfastProcessUrl()} method="post" className="space-y-3">
                  {Object.entries(payfastSigned).map(([k, v]) => (
                    <input key={k} type="hidden" name={k} value={v} />
                  ))}
                  <div className="rounded-xl border border-white/10 bg-black/25 p-3 text-xs text-zinc-400">
                    PayFast will send an ITN to <span className="font-mono">{`/api/webhooks/payfast`}</span> to record revenue.
                  </div>
                  <button
                    type="submit"
                    className={cn(
                      buttonVariants({ size: "lg" }),
                      "w-full rounded-xl bg-gradient-to-r from-emerald-500/20 via-cyan-500/20 to-violet-500/20 text-white"
                    )}
                  >
                    Pay with PayFast
                  </button>
                </form>
              ) : (
                <div className="rounded-xl border border-amber-500/25 bg-amber-950/20 p-3 text-xs text-amber-100">
                  PayFast env is not configured. Set <span className="font-mono">PAYFAST_MERCHANT_ID</span>,{" "}
                  <span className="font-mono">PAYFAST_MERCHANT_KEY</span>, and{" "}
                  <span className="font-mono">PAYFAST_PASSPHRASE</span>.
                </div>
              )
            ) : null}
          </CardContent>
        </Card>

        {user ? (
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Fulfillment (Printful)
            </p>
            <PlaceOrderClient
              storefrontId={storefrontId}
              productId={productId}
              currency={currency}
              priceCents={cents}
            />
          </div>
        ) : (
          <p className="rounded-lg border border-amber-500/25 bg-amber-950/20 px-3 py-2 text-xs text-amber-100">
            Sign in to place a real Printful order.
          </p>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href={`/store/${slug}`}
            className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
          >
            Back to store
          </Link>
          <Link
            href={`/store/${slug}/product/${productId}`}
            className={cn(buttonVariants({ size: "lg" }))}
          >
            Back to product
          </Link>
        </div>
      </main>
    </div>
  );
}
