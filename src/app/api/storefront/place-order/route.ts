import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getRouteSession } from "@/lib/auth/session";
import { platformFeeRateFromId } from "@/lib/payments/platform-fee";
import { printfulCreateOrder, printfulResolveStoreId } from "@/lib/printful/client";
import {
  dbGetCompanyById,
  dbGetProduct,
  dbGetStorefrontById,
  dbInsertPrintfulOrder,
  dbInsertRevenueLog,
  dbSetStorefrontPrintfulStoreId,
} from "@/lib/db/local-db";

export const runtime = "nodejs";

type Body = {
  storefrontId: string;
  productId: string;
  quantity: number;
  email?: string;
  recipient: {
    name: string;
    address1: string;
    address2?: string;
    city: string;
    state_code?: string;
    country_code: string;
    zip: string;
    phone?: string;
  };
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  const session = await getRouteSession(request);
  const sessionUserId = session?.user?.id ?? null;

  const body = (await request.json().catch(() => null)) as Body | null;
  if (!body?.storefrontId || !body.productId) {
    return NextResponse.json({ error: "Missing storefrontId/productId" }, { status: 400 });
  }
  const qty = Math.max(1, Math.min(10, Math.floor(Number(body.quantity || 1))));

  // Local DB has storefronts keyed by slug; we receive id, so we find via product storefront id match.
  const product = await dbGetProduct(body.productId);
  if (!product || product.storefront_id !== body.storefrontId) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const storefront = await dbGetStorefrontById(body.storefrontId);
  if (!storefront) {
    return NextResponse.json({ error: "Storefront not found" }, { status: 404 });
  }

  const company = await dbGetCompanyById(storefront.company_id);
  if (!company) {
    return NextResponse.json({ error: "Company not found" }, { status: 404 });
  }

  const guestEmail = body.email?.trim() ?? "";
  if (!sessionUserId && (!guestEmail || !EMAIL_RE.test(guestEmail))) {
    return NextResponse.json(
      { error: "Sign in or enter a valid email so we can confirm your order." },
      { status: 401 }
    );
  }

  const ownerUserId = company.user_id;
  const revenueUserId = sessionUserId ?? ownerUserId;

  const grossCents = Number(product.price_cents) * qty;
  const rate = platformFeeRateFromId(`${storefront.company_id}-${product.id}`);
  const platformFeeCents = Math.round(grossCents * rate);
  const netCents = Math.max(0, grossCents - platformFeeCents);

  const pod = (product.pod ?? {}) as Record<string, unknown>;
  const printful =
    pod.printful && typeof pod.printful === "object"
      ? (pod.printful as Record<string, unknown>)
      : null;
  const syncVariantIds = Array.isArray(printful?.syncVariantIds)
    ? (printful?.syncVariantIds as unknown[]).filter((x): x is number => typeof x === "number")
    : [];
  const syncVariantId = syncVariantIds[0] ?? null;
  let storeId =
    (storefront.printful_store_id as string | null) ??
    (typeof printful?.storeId === "string" ? (printful.storeId as string) : null);

  if (!storeId) {
    const resolved = await printfulResolveStoreId();
    if (resolved) {
      storeId = resolved;
      await dbSetStorefrontPrintfulStoreId(storefront.id, resolved);
    }
  }

  if (!storeId) {
    return NextResponse.json(
      {
        error:
          "Printful is not configured: set PRINTFUL_API_KEY and PRINTFUL_STORE_ID (or use a Printful token that can list stores).",
      },
      { status: 400 }
    );
  }

  if (!syncVariantId) {
    return NextResponse.json(
      {
        error:
          "This product is not linked to Printful yet (no sync variant). Launch the product again with PRINTFUL_API_KEY set so variants sync.",
      },
      { status: 400 }
    );
  }

  const externalId = `aether-order-${storefront.id}-${product.id}-${Date.now()}`;
  const recipient = body.recipient ?? ({} as Body["recipient"]);
  if (!recipient?.name || !recipient?.address1 || !recipient?.city || !recipient?.zip || !recipient?.country_code) {
    return NextResponse.json({ error: "Missing recipient fields" }, { status: 400 });
  }

  let orderResult: { id: number; status: string };
  try {
    orderResult = await printfulCreateOrder(
      storeId,
      {
        external_id: externalId,
        recipient,
        items: [{ sync_variant_id: syncVariantId, quantity: qty }],
      },
      true
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Printful order failed";
    return NextResponse.json({ error: msg }, { status: 502 });
  }

  const customerEmail = (body.email?.trim() || guestEmail) || null;

  // Persist order + revenue
  const orderRow = await dbInsertPrintfulOrder({
    company_id: storefront.company_id,
    storefront_id: storefront.id,
    product_id: product.id,
    user_id: sessionUserId,
    currency: (product.currency as string) === "ZAR" ? "ZAR" : "USD",
    gross_cents: grossCents,
    platform_fee_rate: rate,
    platform_fee_cents: platformFeeCents,
    net_cents: netCents,
    customer_email: customerEmail,
    recipient,
    printful_order_id: String(orderResult.id),
    printful_status: orderResult.status,
    tracking_number: null,
    tracking_url: null,
  });

  await dbInsertRevenueLog({
    company_id: storefront.company_id,
    user_id: revenueUserId,
    gateway: "printful",
    currency: (product.currency as string) === "ZAR" ? "ZAR" : "USD",
    gross_cents: grossCents,
    platform_fee_rate: rate,
    platform_fee_cents: platformFeeCents,
    net_cents: netCents,
    reference: externalId,
    note: `Storefront order → Printful order ${orderResult.id}`,
  });

  return NextResponse.json({
    ok: true,
    orderId: orderRow.id,
    printful: orderResult,
  });
}

