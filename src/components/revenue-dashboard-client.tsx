"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Activity, Radio } from "lucide-react";
import { TrialBanner } from "@/components/account/trial-banner";
import { UserProfileMenu } from "@/components/account/user-profile-menu";
import { AgentToolsPanel } from "@/components/revenue/agent-tools-panel";
import {
  ActiveAgentsPanel,
  type DashboardAgent,
} from "@/components/revenue/active-agents-panel";
import { LiveProfitTracker } from "@/components/revenue/live-profit-tracker";
import { PaymentMethodPanel } from "@/components/revenue/payment-method-panel";
import { PayoutHistoryTable } from "@/components/revenue/payout-history-table";
import { ReferralPanel } from "@/components/revenue/referral-panel";
import { RevenueChartsPanel } from "@/components/revenue/revenue-charts-panel";
import { RevenueTotalsPanel } from "@/components/revenue/revenue-totals-panel";
import { EmpireFeaturesHub } from "@/components/empire/empire-features-hub";
import { ParticleField } from "@/components/premium/particle-field";
import { SubscriptionTiersPanel } from "@/components/revenue/subscription-tiers-panel";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Button } from "@/components/ui/button";
import type { BillingSnapshot } from "@/lib/billing/trial";
import type { RevenueMetrics } from "@/lib/revenue/metrics";
import { cn } from "@/lib/utils";

export type RevenueTotals = {
  revenue: { usdCents: number; zarCents: number };
  platformFees: { usdCents: number; zarCents: number };
  net: { usdCents: number; zarCents: number };
};

export type RevenueLogRow = {
  id: string;
  created_at: string;
  gateway: string;
  currency: "USD" | "ZAR";
  gross_cents: number;
  platform_fee_rate: number;
  platform_fee_cents: number;
  net_cents: number;
  reference: string | null;
  note: string | null;
  company_id: string;
};

export type OrderRow = {
  id: string;
  created_at: string;
  currency: "USD" | "ZAR";
  gross_cents: number;
  net_cents: number;
  printful_order_id: string | null;
  printful_status: string | null;
  tracking_number: string | null;
  tracking_url: string | null;
  product_id: string;
  storefront_id: string;
};

export type RevenueDashboardClientProps = {
  businessName: string | null;
  agents: DashboardAgent[];
  userEmail?: string | null;
  userDisplayName?: string | null;
  initialBilling?: BillingSnapshot | null;
};

const TICKER_ITEMS = [
  "LUBERRY AI · LIVE",
  "AGENTS · ACTIVE",
  "PAYFAST · READY",
  "PAYSTACK · READY",
  "REFERRALS · 25% LIFETIME",
  "EMPIRE · COMMAND CENTER",
  "ANALYTICS · REAL-TIME",
  "UPTIME 99.9%",
];

function CommandCenterTicker() {
  const doubled = [...TICKER_ITEMS, ...TICKER_ITEMS];
  return (
    <div className="relative z-30 overflow-hidden border-b border-amber-500/15 bg-black/50 py-2.5 backdrop-blur-xl">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-[oklch(0.07_0.02_55)] to-transparent md:w-24" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-[oklch(0.07_0.02_55)] to-transparent md:w-24" />
      <div className="flex w-max animate-luberry-marquee motion-reduce:[animation:none]">
        {doubled.map((item, i) => (
          <span
            key={`${item}-${i}`}
            className="mx-6 flex shrink-0 items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.35em] text-amber-200/90 md:text-xs"
          >
            <Radio className="size-3 text-emerald-400" aria-hidden />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

export function RevenueDashboardClient({
  businessName,
  agents,
  userEmail,
  userDisplayName,
  initialBilling,
}: RevenueDashboardClientProps) {
  const [clock, setClock] = useState<string>("");
  const [totals, setTotals] = useState<RevenueTotals | null>(null);
  const [logs, setLogs] = useState<RevenueLogRow[]>([]);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [metrics, setMetrics] = useState<RevenueMetrics | null>(null);
  const [billing, setBilling] = useState<BillingSnapshot | null>(initialBilling ?? null);
  const [subscriptionTier, setSubscriptionTier] = useState<string>(
    initialBilling?.effectiveTier ?? "free"
  );
  const [loading, setLoading] = useState(false);
  const [simulateBusy, setSimulateBusy] = useState(false);
  const [cancelTrialBusy, setCancelTrialBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const tick = () =>
      setClock(
        new Intl.DateTimeFormat("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        }).format(new Date())
      );
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/revenue/summary", { cache: "no-store" });
      const json = (await res.json()) as
        | { error: string }
        | {
            totals: RevenueTotals | null;
            logs: RevenueLogRow[];
            orders?: OrderRow[];
            metrics?: RevenueMetrics | null;
            subscriptionTier?: string;
            billing?: BillingSnapshot | null;
          };
      if (!res.ok) {
        const msg = "error" in json ? json.error : "Failed to load revenue.";
        setError(msg);
        return;
      }
      if ("error" in json) {
        setError(json.error);
        return;
      }
      setTotals(json.totals ?? null);
      setLogs(Array.isArray(json.logs) ? json.logs : []);
      setOrders(Array.isArray(json.orders) ? json.orders : []);
      setMetrics(json.metrics ?? null);
      setSubscriptionTier(json.subscriptionTier ?? "free");
      if (json.billing) setBilling(json.billing);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load revenue.");
    } finally {
      setLoading(false);
    }
  }

  async function simulateSale() {
    setSimulateBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/revenue/simulate-sale", { method: "POST" });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(json.error ?? "Failed to simulate sale.");
        return;
      }
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to simulate sale.");
    } finally {
      setSimulateBusy(false);
    }
  }

  useEffect(() => {
    void refresh();
    const id = window.setInterval(() => void refresh(), 15_000);
    return () => window.clearInterval(id);
  }, []);

  const tierLabels: Record<string, string> = {
    empire: "Empire",
    elite: "Elite",
    pro: "Pro",
    free: "Starter",
  };
  const tierLabel = billing?.isOnTrial
    ? "Pro Trial"
    : (tierLabels[subscriptionTier] ?? "Starter");

  async function cancelTrial() {
    setCancelTrialBusy(true);
    try {
      const res = await fetch("/api/billing/cancel", { method: "POST" });
      if (res.ok) await refresh();
    } finally {
      setCancelTrialBusy(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[oklch(0.06_0.02_55)] text-foreground">
      <div className="pointer-events-none fixed inset-0 -z-20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_100%_70%_at_50%_-15%,oklch(0.42_0.12_75_/_0.35),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_100%_50%,oklch(0.35_0.08_200_/_0.12),transparent_50%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,oklch(0.04_0.02_55_/_0.97))]" />
      </div>
      <div className="pointer-events-none fixed inset-0 -z-10 opacity-40">
        <ParticleField className="size-full" />
      </div>

      <CommandCenterTicker />

      <header className="sticky top-0 z-20 border-b border-white/[0.08] bg-[oklch(0.08_0.02_55_/_0.85)] shadow-[0_8px_40px_-20px_rgba(0,0,0,0.6)] backdrop-blur-2xl">
        <div className="mx-auto flex max-w-[min(100%,90rem)] flex-wrap items-center justify-between gap-6 px-5 py-5 md:px-12 md:py-6">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-[11px] font-bold uppercase tracking-[0.42em] text-amber-300/95 md:text-xs">
                Luberry AI
              </p>
              <Badge className="border border-amber-500/35 bg-amber-500/15 text-[10px] font-semibold uppercase tracking-wider text-amber-100">
                {tierLabel} plan
              </Badge>
            </div>
            <h1 className="mt-2 bg-gradient-to-r from-white via-amber-100 to-amber-300 bg-clip-text text-3xl font-bold tracking-tight text-transparent md:text-4xl lg:text-5xl">
              Empire Command Center
            </h1>
            {businessName ? (
              <p className="mt-2 max-w-2xl text-pretty text-sm leading-relaxed text-zinc-400 md:text-base lg:text-lg">
                <span className="font-semibold text-amber-200/95">{businessName}</span>
                {" "}— your AI company works 24/7. You own the empire.
              </p>
            ) : (
              <p className="mt-2 max-w-xl text-sm text-zinc-400 md:text-base">
                Launch a business to unlock your full dashboard.
              </p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3 md:gap-4">
            <Button
              type="button"
              onClick={() => void simulateSale()}
              disabled={simulateBusy}
              className="h-10 rounded-xl border-amber-500/30 bg-amber-500/15 px-5 text-amber-50 hover:bg-amber-500/25 md:h-11"
              variant="outline"
            >
              {simulateBusy ? "Simulating…" : "Simulate Sale"}
            </Button>
            <div className="hidden items-center gap-2 rounded-xl border border-white/10 bg-black/40 px-4 py-2 font-mono text-xs text-zinc-400 sm:flex md:text-sm">
              <Activity className="size-4 text-emerald-400" aria-hidden />
              <span className="text-zinc-300">UTC</span>
              <span className="font-semibold tabular-nums text-white">{clock}</span>
            </div>
            <Link
              href="/launch"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "h-10 rounded-xl border-amber-500/30 bg-amber-500/10 px-5 text-amber-100 transition hover:border-amber-400/50 hover:bg-amber-500/20 md:h-11"
              )}
            >
              New launch
            </Link>
            <UserProfileMenu email={userEmail} displayName={userDisplayName} />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[min(100%,90rem)] space-y-12 px-5 py-10 md:space-y-16 md:px-12 md:py-14">
        {error ? (
          <div className="rounded-2xl border border-amber-500/30 bg-amber-950/20 px-5 py-4 text-sm text-amber-100">
            {error}
          </div>
        ) : null}

        {billing?.isOnTrial ? (
          <TrialBanner
            daysRemaining={billing.trialDaysRemaining}
            trialEndsAt={billing.trialEndsAt}
            onCancelTrial={() => void cancelTrial()}
            cancelling={cancelTrialBusy}
          />
        ) : null}

        <SubscriptionTiersPanel />

        <section className="grid gap-8 lg:grid-cols-3 lg:gap-10">
          <div className="lg:col-span-2">
            <LiveProfitTracker totals={totals} logs={logs} loading={loading} />
          </div>
          <div className="lg:col-span-1">
            <RevenueTotalsPanel totals={totals} logs={logs} loading={loading} />
          </div>
        </section>

        <RevenueChartsPanel metrics={metrics} loading={loading} />

        <EmpireFeaturesHub businessName={businessName} tier={subscriptionTier} />

        <section className="grid gap-8 xl:grid-cols-3 xl:gap-10">
          <div className="space-y-8 xl:col-span-2">
            <AgentToolsPanel businessName={businessName} />
            <ActiveAgentsPanel agents={agents} />
            <PayoutHistoryTable logs={logs} loading={loading} />
            <div className="rounded-2xl border border-white/10 bg-black/20 p-5 text-sm text-zinc-300">
              <div className="mb-3 text-[11px] font-bold uppercase tracking-[0.25em] text-zinc-500">
                Fulfillment status (Printful)
              </div>
              {orders.length ? (
                <div className="space-y-2">
                  {orders.slice(0, 8).map((o) => (
                    <div
                      key={o.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/30 px-4 py-3"
                    >
                      <div className="min-w-0">
                        <div className="font-mono text-xs text-zinc-400">
                          {new Date(o.created_at).toLocaleString()}
                        </div>
                        <div className="text-sm">
                          Printful{" "}
                          <span className="font-mono">{o.printful_order_id ?? "—"}</span>
                          {" "}·{" "}
                          <span className="font-semibold text-emerald-200">
                            {o.printful_status ?? "unknown"}
                          </span>
                        </div>
                      </div>
                      <div className="text-xs text-zinc-400">
                        {o.tracking_url ? (
                          <a
                            className="underline underline-offset-4 hover:text-white"
                            href={o.tracking_url}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Tracking
                          </a>
                        ) : (
                          <span>No tracking yet</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-zinc-500">
                  {loading
                    ? "Loading orders…"
                    : "No orders yet. Place an order from checkout to trigger fulfillment."}
                </div>
              )}
            </div>
          </div>
          <div className="space-y-8 xl:col-span-1">
            <ReferralPanel />
            <PaymentMethodPanel />
          </div>
        </section>
      </main>
    </div>
  );
}
