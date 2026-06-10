"use client";

import { useEffect, useState } from "react";
import { Copy, Gift, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type ReferralData = {
  referralCode: string;
  referralLink: string;
  commissionRate: number;
  referralCount: number;
  totals: { usdCents: number; zarCents: number };
  earnings: Array<{
    id: string;
    created_at: string;
    referral_earning_cents: number;
    currency: "USD" | "ZAR";
  }>;
};

export function ReferralPanel() {
  const [data, setData] = useState<ReferralData | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    void (async () => {
      const res = await fetch("/api/referrals");
      if (!res.ok) return;
      setData((await res.json()) as ReferralData);
    })();
  }, []);

  const zar = new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    maximumFractionDigits: 0,
  });

  async function copyLink() {
    if (!data?.referralLink) return;
    await navigator.clipboard.writeText(data.referralLink);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Card className="relative overflow-hidden border-amber-500/15 bg-gradient-to-br from-zinc-950/80 via-black/60 to-amber-950/15 backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-xl font-bold text-white md:text-2xl">
          <span className="flex size-10 items-center justify-center rounded-xl border border-amber-500/25 bg-amber-500/10">
            <Gift className="size-5 text-amber-300" aria-hidden />
          </span>
          Referral program
        </CardTitle>
        <CardDescription className="text-zinc-400">
          Earn 25% of your referrals&apos; subscription fees — for life. Viral invite links with instant rewards.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {data ? (
          <>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-white/10 bg-black/40 p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                  Referrals
                </p>
                <p className="mt-1 flex items-center gap-2 font-mono text-2xl font-bold text-white">
                  <Users className="size-5 text-amber-400" aria-hidden />
                  {data.referralCount}
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/40 p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                  Earned (ZAR)
                </p>
                <p className="mt-1 font-mono text-2xl font-bold text-amber-200">
                  {zar.format(data.totals.zarCents / 100)}
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/40 p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                  Lifetime commission
                </p>
                <p className="mt-1 font-mono text-2xl font-bold text-amber-200">
                  {Math.round(data.commissionRate * 100)}%
                </p>
                <p className="text-[10px] text-zinc-500">of subscription fees</p>
              </div>
            </div>

            <div className="rounded-xl border border-amber-500/20 bg-amber-950/20 p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-amber-300/80">
                Your referral link
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <code className="flex-1 break-all rounded-lg bg-black/50 px-3 py-2 font-mono text-sm text-amber-100">
                  {data.referralLink}
                </code>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => void copyLink()}
                  className="shrink-0 border-amber-500/30 text-amber-100"
                >
                  <Copy className="mr-2 size-4" aria-hidden />
                  {copied ? "Copied!" : "Copy"}
                </Button>
              </div>
              <p className="mt-2 text-xs text-zinc-500">
                Code: <Badge variant="secondary">{data.referralCode}</Badge>
              </p>
            </div>

            {data.earnings.length > 0 ? (
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                  Recent earnings
                </p>
                {data.earnings.slice(0, 5).map((e) => (
                  <div
                    key={e.id}
                    className="flex items-center justify-between rounded-lg border border-white/8 bg-black/30 px-3 py-2 text-sm"
                  >
                    <span className="text-zinc-400">
                      {new Date(e.created_at).toLocaleDateString()}
                    </span>
                    <span className="font-mono font-semibold text-amber-200">
                      +{e.currency === "ZAR" ? zar.format(e.referral_earning_cents / 100) : `$${(e.referral_earning_cents / 100).toFixed(2)}`}
                    </span>
                  </div>
                ))}
              </div>
            ) : null}
          </>
        ) : (
          <p className="text-sm text-zinc-500">Loading referral data…</p>
        )}
      </CardContent>
    </Card>
  );
}
