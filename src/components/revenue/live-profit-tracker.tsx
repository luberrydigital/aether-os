"use client";

import { useMemo } from "react";
import { Activity, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { RevenueLogRow, RevenueTotals } from "@/components/revenue-dashboard-client";

type Props = {
  totals: RevenueTotals | null;
  logs: RevenueLogRow[];
  loading: boolean;
};

export function LiveProfitTracker({ totals, logs, loading }: Props) {
  const usd = useMemo(
    () =>
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }),
    []
  );
  const zar = useMemo(
    () =>
      new Intl.NumberFormat("en-ZA", {
        style: "currency",
        currency: "ZAR",
        maximumFractionDigits: 0,
      }),
    []
  );

  const now = Date.now();
  const oneHourAgo = now - 60 * 60 * 1000;
  let lastHourUsdCents = 0;
  let lastHourZarCents = 0;
  let lastPulseUsdCents = 0;
  let lastPulseZarCents = 0;
  const latest = logs[0];
  if (latest?.currency === "USD") lastPulseUsdCents = latest.net_cents;
  if (latest?.currency === "ZAR") lastPulseZarCents = latest.net_cents;

  for (const row of logs) {
    const t = new Date(row.created_at).getTime();
    if (!Number.isFinite(t) || t < oneHourAgo) continue;
    if (row.currency === "USD") lastHourUsdCents += row.net_cents;
    else lastHourZarCents += row.net_cents;
  }

  const barCount = 40;
  const bars = useMemo(() => {
    // Build a simple "velocity" by mapping recent logs to heights.
    const base = new Array(barCount).fill(10);
    const take = logs.slice(0, 12).reverse();
    for (let i = 0; i < take.length; i += 1) {
      const r = take[i];
      const v = Math.min(100, Math.max(8, Math.round((r.net_cents / 1000) * 2)));
      base[barCount - 1 - i * 3] = v;
    }
    return base.map((h, i) => ({ h, hot: i > barCount - 6 }));
  }, [logs]);
  const lifetimeUsd = totals?.net.usdCents ?? 0;

  return (
    <Card className="glass-premium relative overflow-hidden border-amber-500/25 bg-gradient-to-br from-amber-950/40 via-zinc-950/40 to-black/30 shadow-[0_0_80px_-24px_rgba(212,175,55,0.3),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl animate-luberry-neon-pulse motion-reduce:animate-none">
      <div className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-amber-600/15 blur-3xl motion-reduce:opacity-50" />
      <div className="pointer-events-none absolute -bottom-16 -left-16 size-56 rounded-full bg-amber-500/10 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl">
        <div className="animate-aether-shimmer-line absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-transparent via-white/[0.05] to-transparent motion-reduce:hidden" />
      </div>

      <CardHeader className="relative z-10 flex flex-row flex-wrap items-start justify-between gap-4 space-y-0 pb-2">
        <div>
          <CardTitle className="flex flex-wrap items-center gap-3 text-2xl font-bold tracking-tight text-white md:text-3xl">
            <span className="flex size-11 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/10 shadow-[0_0_24px_-4px_rgba(52,211,153,0.4)]">
              <TrendingUp className="size-6 text-emerald-300" aria-hidden />
            </span>
            Live revenue stream
          </CardTitle>
          <CardDescription className="mt-3 max-w-xl text-base text-zinc-400">
            Pulled from your real database ledger (`revenue_logs`). Every sale
            auto-deducts a platform fee in the 18–22% band.
          </CardDescription>
        </div>
        <Badge
          className={cn(
            "shrink-0 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em]",
            loading
              ? "border border-amber-400/35 bg-amber-500/15 text-amber-100"
              : "border border-emerald-500/35 bg-emerald-500/15 text-emerald-100"
          )}
        >
          {loading ? "Loading" : "Live"}
        </Badge>
      </CardHeader>

      <CardContent className="relative z-10 space-y-8 pb-8 pt-2">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-zinc-500">
            Total earnings (net USD)
          </p>
          <p className="mt-2 bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-300 bg-clip-text font-mono text-5xl font-bold tabular-nums tracking-tight text-transparent md:text-6xl lg:text-7xl">
            {usd.format(lifetimeUsd / 100)}
          </p>
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between gap-2">
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-zinc-500">
              Velocity graph
            </p>
            <span className="font-mono text-[10px] uppercase tracking-wider text-amber-300/80">
              Live feed
            </span>
          </div>
          <div className="flex h-32 items-end gap-0.5 rounded-2xl border border-white/10 bg-black/40 p-4 shadow-inner md:h-40 md:gap-1 md:p-5">
            {bars.map(({ h, hot }, i) => {
              return (
                <div
                  key={i}
                  className={cn(
                    "flex-1 rounded-t-sm bg-gradient-to-t from-amber-800/50 via-amber-600/60 to-amber-400/90 transition-all duration-700",
                    hot && "shadow-[0_0_14px_-2px_rgba(212,175,55,0.45)]"
                  )}
                  style={{
                    height: `${h}%`,
                    opacity: hot ? 1 : 0.55 + (i % 5) * 0.06,
                  }}
                />
              );
            })}
          </div>
        </div>

        <div className="grid gap-4 rounded-2xl border border-white/10 bg-black/35 p-5 sm:grid-cols-2 md:p-6">
          <div className="flex gap-4">
            <Activity className="mt-1 size-5 shrink-0 text-sky-400" aria-hidden />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Last ~hour (USD)
              </p>
              <p className="mt-1 font-mono text-2xl font-bold tabular-nums text-white md:text-3xl">
                {usd.format(lastHourUsdCents / 100)}
              </p>
              <p className="mt-2 text-sm font-medium text-emerald-300/90">
                +{usd.format(lastPulseUsdCents / 100)} on the last sale
              </p>
            </div>
          </div>
          <div className="flex gap-4 border-t border-white/10 pt-4 sm:border-t-0 sm:border-l sm:pl-6 sm:pt-0">
            <Activity className="mt-1 size-5 shrink-0 text-amber-300" aria-hidden />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Last ~hour (ZAR)
              </p>
              <p className="mt-1 font-mono text-2xl font-bold tabular-nums text-white md:text-3xl">
                {zar.format(lastHourZarCents / 100)}
              </p>
              <p className="mt-2 text-sm font-medium text-amber-200/90">
                +{zar.format(lastPulseZarCents / 100)} on the last sale
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
