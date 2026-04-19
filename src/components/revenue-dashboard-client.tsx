"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Activity, Radio } from "lucide-react";
import { SignOutButton } from "@/components/sign-out-button";
import {
  ActiveAgentsPanel,
  type DashboardAgent,
} from "@/components/revenue/active-agents-panel";
import { LiveProfitTracker } from "@/components/revenue/live-profit-tracker";
import { PaymentMethodPanel } from "@/components/revenue/payment-method-panel";
import { PayoutHistoryTable } from "@/components/revenue/payout-history-table";
import { RevenueTotalsPanel } from "@/components/revenue/revenue-totals-panel";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PayoutRow } from "@/lib/payments/mock-payouts";

export type RevenueDashboardClientProps = {
  businessName: string | null;
  agents: DashboardAgent[];
  payouts: PayoutRow[];
  platformFeeRate: number;
};

const TICKER_ITEMS = [
  "NET +$847",
  "ZAR +R18.2K",
  "AGENT MESH · 7 ACTIVE",
  "UPTIME 99.99%",
  "TREASURY · SANDBOX",
  "PULSE +$2.1K / HR",
  "PAYFAST · READY",
  "PAYSTACK · READY",
  "ORCHESTRATION · LIVE",
  "PLATFORM FEE · 18–22%",
];

function CommandCenterTicker() {
  const doubled = [...TICKER_ITEMS, ...TICKER_ITEMS];
  return (
    <div className="relative z-30 overflow-hidden border-b border-cyan-500/15 bg-black/50 py-2.5 backdrop-blur-xl">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-[oklch(0.07_0.03_280)] to-transparent md:w-24" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-[oklch(0.07_0.03_280)] to-transparent md:w-24" />
      <div className="flex w-max animate-aether-marquee motion-reduce:[animation:none]">
        {doubled.map((item, i) => (
          <span
            key={`${item}-${i}`}
            className="mx-6 flex shrink-0 items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.35em] text-cyan-200/90 md:text-xs"
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
  payouts,
  platformFeeRate,
}: RevenueDashboardClientProps) {
  const [clock, setClock] = useState<string>("");

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

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[oklch(0.07_0.03_280)] text-foreground">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_100%_70%_at_50%_-15%,oklch(0.42_0.2_285_/_0.38),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_100%_0%,oklch(0.32_0.14_200_/_0.2),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_45%_at_0%_100%,oklch(0.36_0.18_320_/_0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,oklch(0.05_0.03_280_/_0.96))]" />
      </div>

      <CommandCenterTicker />

      <header className="sticky top-0 z-20 border-b border-white/[0.08] bg-[oklch(0.08_0.03_280_/_0.85)] shadow-[0_8px_40px_-20px_rgba(0,0,0,0.6)] backdrop-blur-2xl">
        <div className="mx-auto flex max-w-[min(100%,90rem)] flex-wrap items-center justify-between gap-6 px-5 py-5 md:px-12 md:py-6">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-[11px] font-bold uppercase tracking-[0.42em] text-violet-300/95 md:text-xs">
                Aether OS
              </p>
              <Badge className="border border-emerald-500/35 bg-emerald-500/15 text-[10px] font-semibold uppercase tracking-wider text-emerald-100">
                Command center
              </Badge>
            </div>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-white md:text-4xl lg:text-5xl">
              Empire economics
            </h1>
            {businessName ? (
              <p className="mt-2 max-w-2xl text-pretty text-sm leading-relaxed text-zinc-400 md:text-base lg:text-lg">
                <span className="font-semibold text-violet-200/95">
                  {businessName}
                </span>{" "}
                — live treasury, autonomous agents, and PayFast / Paystack rails
                in one obsessive surface.
              </p>
            ) : (
              <p className="mt-2 max-w-xl text-sm text-zinc-400 md:text-base">
                Launch a company to bind this cockpit to your latest blueprint.
              </p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3 md:gap-4">
            <div className="hidden items-center gap-2 rounded-xl border border-white/10 bg-black/40 px-4 py-2 font-mono text-xs text-zinc-400 sm:flex md:text-sm">
              <Activity className="size-4 text-emerald-400" aria-hidden />
              <span className="text-zinc-300">UTC</span>
              <span className="font-semibold tabular-nums text-white">{clock}</span>
            </div>
            <Link
              href="/launch"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "h-10 rounded-xl border-violet-500/30 bg-violet-500/10 px-5 text-violet-100 transition hover:border-violet-400/50 hover:bg-violet-500/20 md:h-11"
              )}
            >
              New launch
            </Link>
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[min(100%,90rem)] space-y-12 px-5 py-10 md:space-y-16 md:px-12 md:py-14">
        <section className="grid gap-8 lg:grid-cols-3 lg:gap-10">
          <div className="lg:col-span-2">
            <LiveProfitTracker />
          </div>
          <div className="lg:col-span-1">
            <RevenueTotalsPanel
              payouts={payouts}
              platformFeeRate={platformFeeRate}
            />
          </div>
        </section>

        <section className="grid gap-8 xl:grid-cols-3 xl:gap-10">
          <div className="space-y-8 xl:col-span-2">
            <ActiveAgentsPanel agents={agents} />
            <PayoutHistoryTable payouts={payouts} />
          </div>
          <div className="xl:col-span-1">
            <PaymentMethodPanel />
          </div>
        </section>
      </main>
    </div>
  );
}
