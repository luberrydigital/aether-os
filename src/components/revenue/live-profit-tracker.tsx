"use client";

import { useEffect, useMemo, useState } from "react";
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

const USD_DELTAS = [47, 83, 120, 199, 156, 210, 92, 64];
const ZAR_DELTAS = [890, 1200, 1540, 2100, 980, 1750, 640, 1320];

function pick<T>(arr: T[], i: number) {
  return arr[i % arr.length];
}

export function LiveProfitTracker() {
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

  const [lifetimeUsdCents, setLifetimeUsdCents] = useState(12_400_00);
  const [hourlyUsdCents, setHourlyUsdCents] = useState(4700);
  const [hourlyZarCents, setHourlyZarCents] = useState(890_00);
  const [lastPulse, setLastPulse] = useState({ usd: 4700, zar: 890_00 });
  const [pulseTick, setPulseTick] = useState(0);

  useEffect(() => {
    let t = 0;
    const id = window.setInterval(() => {
      const u = pick(USD_DELTAS, t) * 100;
      const z = pick(ZAR_DELTAS, t + 2) * 100;
      setLastPulse({ usd: u, zar: z });
      setHourlyUsdCents((c) => c + u);
      setHourlyZarCents((c) => c + z);
      setLifetimeUsdCents((c) => c + u);
      setPulseTick((p) => p + 1);
      t += 1;
    }, 3_800);
    return () => window.clearInterval(id);
  }, []);

  const barCount = 40;

  return (
    <Card className="relative overflow-hidden border-violet-500/25 bg-gradient-to-br from-violet-950/50 via-zinc-950/40 to-cyan-950/30 shadow-[0_0_80px_-24px_rgba(139,92,246,0.45),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl">
      <div className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-violet-600/20 blur-3xl motion-reduce:opacity-50" />
      <div className="pointer-events-none absolute -bottom-16 -left-16 size-56 rounded-full bg-cyan-500/15 blur-3xl" />
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
            Synthetic telemetry — swaps for PayFast / Paystack webhooks when you
            go live. Built to feel addictive on purpose.
          </CardDescription>
        </div>
        <Badge className="shrink-0 border border-amber-400/35 bg-amber-500/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-amber-100">
          Sandbox
        </Badge>
      </CardHeader>

      <CardContent className="relative z-10 space-y-8 pb-8 pt-2">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-zinc-500">
            Total earnings (simulated USD)
          </p>
          <p className="mt-2 bg-gradient-to-r from-emerald-300 via-cyan-200 to-violet-200 bg-clip-text font-mono text-5xl font-bold tabular-nums tracking-tight text-transparent md:text-6xl lg:text-7xl">
            {usd.format(lifetimeUsdCents / 100)}
          </p>
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between gap-2">
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-zinc-500">
              Velocity graph
            </p>
            <span className="font-mono text-[10px] uppercase tracking-wider text-violet-300/80">
              Live feed
            </span>
          </div>
          <div className="flex h-32 items-end gap-0.5 rounded-2xl border border-white/10 bg-black/40 p-4 shadow-inner md:h-40 md:gap-1 md:p-5">
            {Array.from({ length: barCount }).map((_, i) => {
              const v = (pulseTick + i * 2) % 18;
              const h = 8 + v * 4;
              const hot = i > barCount - 6;
              return (
                <div
                  key={i}
                  className={cn(
                    "flex-1 rounded-t-sm bg-gradient-to-t from-violet-800/50 via-fuchsia-500/60 to-cyan-400/90 transition-all duration-700",
                    hot && "shadow-[0_0_14px_-2px_rgba(34,211,238,0.45)]"
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
                {usd.format(hourlyUsdCents / 100)}
              </p>
              <p className="mt-2 text-sm font-medium text-emerald-300/90">
                +{usd.format(lastPulse.usd / 100)} in the last pulse
              </p>
            </div>
          </div>
          <div className="flex gap-4 border-t border-white/10 pt-4 sm:border-t-0 sm:border-l sm:pl-6 sm:pt-0">
            <Activity className="mt-1 size-5 shrink-0 text-violet-300" aria-hidden />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Last ~hour (ZAR)
              </p>
              <p className="mt-1 font-mono text-2xl font-bold tabular-nums text-white md:text-3xl">
                {zar.format(hourlyZarCents / 100)}
              </p>
              <p className="mt-2 text-sm font-medium text-violet-200/90">
                +{zar.format(lastPulse.zar / 100)} in the last pulse
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
