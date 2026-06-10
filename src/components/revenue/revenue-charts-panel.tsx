"use client";

import { BarChart3, Percent, ShoppingCart, TrendingUp } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { RevenueMetrics } from "@/lib/revenue/metrics";

type Props = {
  metrics: RevenueMetrics | null;
  loading: boolean;
};

function MetricCard({
  label,
  value,
  sub,
  icon: Icon,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: typeof TrendingUp;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/40 p-5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
          {label}
        </p>
        <Icon className="size-4 text-amber-400" aria-hidden />
      </div>
      <p className="mt-2 font-mono text-2xl font-bold text-white md:text-3xl">
        {value}
      </p>
      {sub ? <p className="mt-1 text-xs text-zinc-500">{sub}</p> : null}
    </div>
  );
}

export function RevenueChartsPanel({ metrics, loading }: Props) {
  const zar = new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    maximumFractionDigits: 0,
  });
  const usd = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

  const breakdown = metrics?.dailyBreakdown ?? [];
  const maxNet = Math.max(
    1,
    ...breakdown.map((d) => d.netUsdCents + d.netZarCents / 18)
  );

  return (
    <Card className="relative overflow-hidden border-amber-500/20 bg-gradient-to-br from-zinc-950/80 via-black/60 to-amber-950/15 backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-2xl font-bold text-white">
          <span className="flex size-11 items-center justify-center rounded-xl border border-amber-500/25 bg-amber-500/10">
            <BarChart3 className="size-6 text-amber-300" aria-hidden />
          </span>
          Performance analytics
        </CardTitle>
        <CardDescription className="text-zinc-400">
          7-day revenue trend and key business metrics from your live ledger.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Total sales"
            value={loading ? "—" : String(metrics?.totalSales ?? 0)}
            sub="All-time transactions"
            icon={ShoppingCart}
          />
          <MetricCard
            label="Avg order (ZAR)"
            value={
              loading
                ? "—"
                : zar.format((metrics?.avgOrderValueZarCents ?? 0) / 100)
            }
            sub={
              metrics?.avgOrderValueUsdCents
                ? `USD: ${usd.format(metrics.avgOrderValueUsdCents / 100)}`
                : undefined
            }
            icon={TrendingUp}
          />
          <MetricCard
            label="Conversion rate"
            value={loading ? "—" : `${metrics?.conversionRate ?? 0}%`}
            sub="Estimated from traffic model"
            icon={Percent}
          />
          <MetricCard
            label="7-day growth"
            value={
              loading
                ? "—"
                : `${(metrics?.growthPercent ?? 0) >= 0 ? "+" : ""}${metrics?.growthPercent ?? 0}%`
            }
            sub="Net revenue vs prior period"
            icon={BarChart3}
          />
        </div>

        <div>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-zinc-500">
              7-day revenue chart
            </p>
            <span className="font-mono text-[10px] uppercase tracking-wider text-amber-300/80">
              Net revenue
            </span>
          </div>
          <div className="flex h-48 items-end gap-2 rounded-2xl border border-white/10 bg-black/40 p-5 md:h-56 md:gap-3">
            {breakdown.map((day, i) => {
              const net = day.netUsdCents + day.netZarCents / 18;
              const h = Math.max(4, Math.round((net / maxNet) * 100));
              const isToday = i === breakdown.length - 1;
              return (
                <div key={day.date} className="flex flex-1 flex-col items-center gap-2">
                  <div
                    className={cn(
                      "w-full rounded-t-md bg-gradient-to-t transition-all duration-500",
                      isToday
                        ? "from-amber-700/60 via-amber-500/80 to-amber-300/95 shadow-[0_0_16px_-2px_rgba(212,175,55,0.5)]"
                        : "from-amber-900/40 via-amber-700/50 to-amber-500/70 opacity-80"
                    )}
                    style={{ height: `${h}%` }}
                    title={`${day.label}: ${day.sales} sales`}
                  />
                  <span className="text-[9px] font-medium uppercase tracking-wide text-zinc-500 md:text-[10px]">
                    {day.label.split(" ")[0]}
                  </span>
                </div>
              );
            })}
          </div>
          {breakdown.every((d) => d.sales === 0) && !loading ? (
            <p className="mt-3 text-center text-sm text-zinc-500">
              No sales yet — simulate a sale or connect PayFast to populate this chart.
            </p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
