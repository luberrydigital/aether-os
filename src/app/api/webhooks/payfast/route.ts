import { NextResponse } from "next/server";
import { z } from "zod";
import { platformFeeRateFromId } from "@/lib/payments/platform-fee";
import {
  dbGetCompanyById,
  dbGetRevenueLogByReference,
  dbInsertRevenueLog,
} from "@/lib/db/local-db";
import { payfastPassphraseFromEnv, payfastSignature, payfastValidateItN } from "@/lib/payments/payfast";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const itnSchema = z.object({
  m_payment_id: z.string().optional(),
  pf_payment_id: z.string().optional(),
  payment_status: z.string().optional(),
  amount_gross: z.string().optional(),
  item_name: z.string().optional(),
  custom_str1: z.string().optional(), // company_id
  custom_str2: z.string().optional(), // storefront_id
  custom_str3: z.string().optional(), // product_id
  signature: z.string().optional(),
});

function parseMoneyToCents(v: string | undefined | null): number {
  const n = Number(String(v ?? "").replace(",", "."));
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.round(n * 100));
}

export async function POST(request: Request) {
  // PayFast ITN: form-encoded
  const rawBody = await request.text();
  const params = Object.fromEntries(new URLSearchParams(rawBody).entries()) as Record<string, string>;
  const parsed = itnSchema.safeParse(params);
  if (!parsed.success) return NextResponse.json({ ok: false }, { status: 400 });

  // 1) Signature check
  const passphrase = payfastPassphraseFromEnv();
  const expected = payfastSignature(params, passphrase);
  if (!params.signature || params.signature !== expected) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  // 2) Server-side validation with PayFast (prevents spoofing)
  const valid = await payfastValidateItN(rawBody);
  if (!valid) return NextResponse.json({ ok: false }, { status: 400 });

  const paymentStatus = (params.payment_status ?? "").toUpperCase();
  const pfPaymentId = params.pf_payment_id ?? "";
  const companyId = params.custom_str1 ?? "";

  // Always 200 to stop PayFast retries once verified.
  if (!pfPaymentId || !companyId) return NextResponse.json({ ok: true });
  if (paymentStatus !== "COMPLETE") return NextResponse.json({ ok: true });

  // Idempotency
  const existing = await dbGetRevenueLogByReference(pfPaymentId);
  if (existing) return NextResponse.json({ ok: true });

  const company = await dbGetCompanyById(companyId);
  if (!company) return NextResponse.json({ ok: true });

  const grossCents = parseMoneyToCents(params.amount_gross);
  const rate = platformFeeRateFromId(`${companyId}-${pfPaymentId}`);
  const platformFeeCents = Math.round(grossCents * rate);
  const netCents = Math.max(0, grossCents - platformFeeCents);

  await dbInsertRevenueLog({
    company_id: companyId,
    user_id: company.user_id,
    gateway: "payfast",
    currency: "ZAR",
    gross_cents: grossCents,
    platform_fee_rate: rate,
    platform_fee_cents: platformFeeCents,
    net_cents: netCents,
    reference: pfPaymentId,
    note: `PayFast ITN · ${params.item_name ?? "sale"}`,
  });

  return NextResponse.json({ ok: true });
}

