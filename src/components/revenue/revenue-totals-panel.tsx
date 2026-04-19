"use client";

import { useMemo } from "react";
import { Landmark, Percent } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { PayoutRow } from "@/lib/payments/mock-payouts";

type Props = {
  payouts: PayoutRow[];
  platformFeeRate: number;
};

export function RevenueTotalsPanel({ payouts, platformFeeRate }: Props) {
  const { gross, fee, net } = useMemo(() => {
    let grossZar = 0;
    let grossUsd = 0;
    let feeZar = 0;
    let feeUsd = 0;
    for (const p of payouts) {
      if (p.currency === "ZAR") {
        grossZar += p.grossCents;
        feeZar += p.platformFeeCents;
      } else {
        grossUsd += p.grossCents;
        feeUsd += p.platformFeeCents;
      }
    }
    return {
      gross: { zar: grossZar, usd: grossUsd },
      fee: { zar: feeZar, usd: feeUsd },
      net: { zar: grossZar - feeZar, usd: grossUsd - feeUsd },
    };
  }, [payouts]);

  const zar = useMemo(
    () =>
      new Intl.NumberFormat("en-ZA", {
        style: "currency",
        currency: "ZAR",
        maximumFractionDigits: 0,
      }),
    []
  );
  const usd = useMemo(
    () =>
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }),
    []
  );

  const pct = (platformFeeRate * 100).toFixed(1);

  const spark = useMemo(() => {
    let seed = 0;
    for (const p of payouts) seed += p.grossCents;
    const out: number[] = [];
    let v = Math.abs(seed) % 97 || 41;
    for (let i = 0; i < 18; i += 1) {
      v = (v * 17 + 23) % 100;
      out.push(25 + (v % 55));
    }
    return out;
  }, [payouts]);

  return (
    <Card className="relative h-full overflow-hidden border-emerald-500/25 bg-gradient-to-b from-emerald-950/40 via-zinc-950/50 to-violet-950/25 shadow-[0_0_60px_-18px_rgba(52,211,153,0.25)] backdrop-blur-xl">
      <div className="pointer-events-none absolute -right-12 top-0 size-40 rounded-full bg-emerald-500/15 blur-3xl" />
      <CardHeader className="relative">
        <CardTitle className="flex flex-wrap items-center gap-3 text-xl font-bold text-white md:text-2xl">
          <span className="flex size-11 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/15">
            <Landmark className="size-6 text-emerald-300" aria-hidden />
          </span>
          Treasury snapshot
        </CardTitle>
        <CardDescription className="text-base text-zinc-400">
          Aggregated from sandbox payout history. Platform fee applies on every
          inflow (18–22% band).
        </CardDescription>
      </CardHeader>
      <CardContent className="relative space-y-6">
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-amber-500/25 bg-amber-950/20 px-4 py-3">
          <Percent className="size-5 text-amber-300" aria-hidden />
          <span className="text-sm font-medium text-zinc-400">Platform fee</span>
          <span className="font-mono text-3xl font-bold tabular-nums text-amber-100 md:text-4xl">
            {pct}%
          </span>
        </div>

        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-zinc-500">
            Gross inflow (mock)
          </p>
          <div className="mt-2 flex h-14 items-end gap-1">
            {spark.map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-t-sm bg-gradient-to-t from-emerald-900/60 to-emerald-400/80"
                style={{ height: `${h}%`, opacity: 0.45 + (i % 4) * 0.1 }}
              />
            ))}
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-zinc-500">
              Gross collected
            </p>
            <p className="mt-2 font-mono text-3xl font-bold tabular-nums text-white md:text-4xl">
              {zar.format(gross.zar / 100)}
            </p>
            <p className="mt-1 font-mono text-sm text-zinc-500">
              + {usd.format(gross.usd / 100)} international
            </p>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-zinc-500">
              Fees withheld
            </p>
            <p className="mt-2 font-mono text-3xl font-bold tabular-nums text-amber-200 md:text-4xl">
              {zar.format(fee.zar / 100)}
            </p>
            <p className="mt-1 font-mono text-sm text-zinc-500">
              + {usd.format(fee.usd / 100)}
            </p>
          </div>
        </div>
        <Separator className="bg-white/10" />
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-zinc-500">
            Net to you
          </p>
          <p className="mt-2 bg-gradient-to-r from-emerald-300 to-cyan-200 bg-clip-text font-mono text-4xl font-bold tabular-nums text-transparent md:text-5xl">
            {zar.format(net.zar / 100)}
          </p>
          <p className="mt-1 font-mono text-sm text-zinc-500">
            + {usd.format(net.usd / 100)} USD rails
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
