import { redirect } from "next/navigation";
import Link from "next/link";
import { SiteHeader } from "@/components/site/site-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { getSession } from "@/lib/auth/session";
import { dbLatestCompanyForUser, dbListRevenueLogs } from "@/lib/db/local-db";
import { cn } from "@/lib/utils";

function money(cents: number, currency: "USD" | "ZAR") {
  const locale = currency === "ZAR" ? "en-ZA" : "en-US";
  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(cents / 100);
}

export default async function EarningsPage() {
  const session = await getSession();
  const userId = session?.user?.id;
  if (!userId) redirect("/login?next=/earnings");

  const company = await dbLatestCompanyForUser(userId);
  const logs = company?.id ? await dbListRevenueLogs(company.id, 50) : [];

  const totals = company
    ? {
        revenueUsd: company.total_revenue_usd_cents ?? 0,
        revenueZar: company.total_revenue_zar_cents ?? 0,
        feeUsd: company.total_platform_fee_usd_cents ?? 0,
        feeZar: company.total_platform_fee_zar_cents ?? 0,
        netUsd: company.total_net_usd_cents ?? 0,
        netZar: company.total_net_zar_cents ?? 0,
      }
    : null;

  return (
    <div className="min-h-screen bg-[oklch(0.07_0.03_280)] text-foreground">
      <SiteHeader activeHref="/earnings" />

      <main className="mx-auto max-w-[min(100%,90rem)] space-y-10 px-5 py-10 md:px-12 md:py-14">
        <header className="space-y-3">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.42em] text-emerald-200/90">
            Earnings & payouts
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
            Transparent ledger: gross → platform fee → merchant net
          </h1>
          <p className="max-w-3xl text-pretty text-sm text-zinc-400 md:text-base">
            This page is the trust anchor. Every sale writes to <span className="font-mono">revenue_logs</span>, and your
            platform fee is recorded separately. For real money flows, your gateway must be configured to split funds so
            your fee settles to your own balance.
          </p>
        </header>

        {!company?.id ? (
          <Card className="border-amber-500/30 bg-amber-950/15">
            <CardHeader>
              <CardTitle className="text-white">No company yet</CardTitle>
              <CardDescription>Create a launch first to start earning.</CardDescription>
            </CardHeader>
            <CardContent>
              <Link
                href="/launch"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cyan-600 text-white"
                )}
              >
                Launch a business
              </Link>
            </CardContent>
          </Card>
        ) : (
          <>
            <section className="grid gap-6 lg:grid-cols-3">
              <Card className="border-white/10 bg-black/20 lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-white">Totals (lifetime)</CardTitle>
                  <CardDescription>Two-currency ledger (USD + ZAR).</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                    <div className="text-[11px] font-bold uppercase tracking-[0.25em] text-zinc-500">Revenue</div>
                    <div className="mt-2 flex flex-wrap gap-3">
                      <Badge className="border border-white/10 bg-white/5 text-zinc-200">
                        {money(totals?.revenueZar ?? 0, "ZAR")}
                      </Badge>
                      <Badge className="border border-white/10 bg-white/5 text-zinc-200">
                        {money(totals?.revenueUsd ?? 0, "USD")}
                      </Badge>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-amber-500/25 bg-amber-500/5 p-4">
                    <div className="text-[11px] font-bold uppercase tracking-[0.25em] text-amber-200/90">
                      Platform fee (your cut)
                    </div>
                    <div className="mt-2 flex flex-wrap gap-3">
                      <Badge className="border border-amber-500/25 bg-amber-500/10 text-amber-100">
                        {money(totals?.feeZar ?? 0, "ZAR")}
                      </Badge>
                      <Badge className="border border-amber-500/25 bg-amber-500/10 text-amber-100">
                        {money(totals?.feeUsd ?? 0, "USD")}
                      </Badge>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/5 p-4 md:col-span-2">
                    <div className="text-[11px] font-bold uppercase tracking-[0.25em] text-emerald-200/90">
                      Merchant net (after fee)
                    </div>
                    <div className="mt-2 flex flex-wrap gap-3">
                      <Badge className="border border-emerald-500/25 bg-emerald-500/10 text-emerald-100">
                        {money(totals?.netZar ?? 0, "ZAR")}
                      </Badge>
                      <Badge className="border border-emerald-500/25 bg-emerald-500/10 text-emerald-100">
                        {money(totals?.netUsd ?? 0, "USD")}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-white/10 bg-black/20">
                <CardHeader>
                  <CardTitle className="text-white">Payout schedule</CardTitle>
                  <CardDescription>Operator-facing expectations.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-zinc-300">
                  <p>
                    <span className="font-semibold text-white">Paystack:</span> settle per your Paystack balance rules.
                    Use <span className="font-mono">splits/subaccounts</span> so your platform fee lands in your own
                    balance automatically.
                  </p>
                  <p>
                    <span className="font-semibold text-white">PayFast:</span> configure ITN + split rules (or separate
                    merchant accounts) to route your platform fee.
                  </p>
                  <p className="text-xs text-zinc-500">
                    This page reads from the app ledger. Real payouts require verified webhooks + gateway settlement
                    configuration.
                  </p>
                </CardContent>
              </Card>
            </section>

            <section className="space-y-4">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-white md:text-2xl">Recent ledger entries</h2>
                  <p className="text-sm text-zinc-400">Latest 50 revenue logs.</p>
                </div>
                <Link href="/dashboard" className={cn(buttonVariants({ variant: "outline" }), "rounded-xl border-white/15 bg-white/5")}>
                  Open Mission Control
                </Link>
              </div>

              <div className="grid gap-3">
                {logs.length ? (
                  logs.map((row) => (
                    <div
                      key={row.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
                    >
                      <div className="min-w-0">
                        <div className="font-mono text-xs text-zinc-400">{new Date(row.created_at).toLocaleString()}</div>
                        <div className="text-sm text-white">
                          <span className="font-semibold">{row.gateway}</span>{" "}
                          <span className="text-zinc-400">·</span>{" "}
                          <span className="text-zinc-300">{row.reference ?? "—"}</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <Badge className="border border-white/10 bg-white/5 text-zinc-200">
                          gross {money(row.gross_cents, row.currency)}
                        </Badge>
                        <Badge className="border border-amber-500/25 bg-amber-500/10 text-amber-100">
                          fee {money(row.platform_fee_cents, row.currency)}
                        </Badge>
                        <Badge className="border border-emerald-500/25 bg-emerald-500/10 text-emerald-100">
                          net {money(row.net_cents, row.currency)}
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-white/10 bg-black/20 px-5 py-4 text-sm text-zinc-400">
                    No revenue logs yet. Use Mission Control → “Simulate Real Sale” (demo) or wire real webhooks for live ledger writes.
                  </div>
                )}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

