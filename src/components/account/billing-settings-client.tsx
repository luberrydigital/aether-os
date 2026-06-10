"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, Check, Crown, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { GlassCard } from "@/components/premium/glass-card";
import { cn } from "@/lib/utils";
import type { SubscriptionTier } from "@/lib/subscriptions/tiers";

type BillingData = {
  billing: {
    effectiveTier: SubscriptionTier;
    tierName: string;
    priceLabel: string;
    status: string;
    isOnTrial: boolean;
    trialDaysRemaining: number;
    trialEndsAt: string | null;
    cancelAtPeriodEnd: boolean;
    cancelEffectiveAt: string | null;
  };
  tiers: Array<{
    id: SubscriptionTier;
    name: string;
    priceLabel: string;
    features: string[];
    highlighted?: boolean;
  }>;
};

export function BillingSettingsClient() {
  const [data, setData] = useState<BillingData | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/billing");
    if (res.ok) setData((await res.json()) as BillingData);
  }

  useEffect(() => {
    void load();
  }, []);

  async function cancelSubscription() {
    if (!confirm("Cancel your subscription? You can upgrade again anytime.")) return;
    setBusy("cancel");
    setMessage(null);
    const res = await fetch("/api/billing/cancel", { method: "POST" });
    const json = (await res.json()) as { message?: string; error?: string };
    setMessage(json.message ?? json.error ?? "Done");
    await load();
    setBusy(null);
  }

  async function changeTier(tier: SubscriptionTier) {
    setBusy(`tier-${tier}`);
    setMessage(null);
    const res = await fetch("/api/subscription", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tier }),
    });
    const json = (await res.json()) as { message?: string; error?: string };
    setMessage(json.message ?? json.error ?? "Plan updated");
    await load();
    setBusy(null);
  }

  if (!data) {
    return <p className="text-zinc-500">Loading billing…</p>;
  }

  const { billing, tiers } = data;

  return (
    <div className="space-y-6">
      {message ? (
        <GlassCard className="border-amber-500/25 p-4">
          <p className="text-sm text-amber-100">{message}</p>
        </GlassCard>
      ) : null}

      <GlassCard className="p-6" glow>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              Current plan
            </p>
            <h2 className="mt-1 flex items-center gap-2 text-2xl font-bold text-white">
              {billing.isOnTrial ? (
                <>
                  <Sparkles className="size-6 text-amber-400" />
                  Pro Trial
                </>
              ) : (
                <>
                  <Crown className="size-6 text-amber-400" />
                  {billing.tierName}
                </>
              )}
            </h2>
            <p className="mt-1 text-zinc-400">{billing.priceLabel}</p>
          </div>
          <Badge
            className={cn(
              billing.isOnTrial && "border-amber-500/30 bg-amber-500/15 text-amber-100",
              billing.status === "active" && "border-emerald-500/30 bg-emerald-500/15 text-emerald-100",
              billing.status === "cancelled" && "border-red-500/30 bg-red-500/15 text-red-200",
              billing.status === "free" && "border-white/20 bg-white/5 text-zinc-300"
            )}
          >
            {billing.isOnTrial
              ? `${billing.trialDaysRemaining} days left`
              : billing.status}
          </Badge>
        </div>

        {billing.isOnTrial && billing.trialEndsAt ? (
          <div className="mt-5 rounded-xl border border-amber-500/20 bg-amber-950/20 p-4 text-sm text-amber-100/90">
            Your 10-day Pro trial ends on{" "}
            <strong>
              {new Date(billing.trialEndsAt).toLocaleDateString("en-ZA", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </strong>
            . Cancel anytime — no charge until you upgrade.
          </div>
        ) : null}

        {billing.cancelAtPeriodEnd && billing.cancelEffectiveAt ? (
          <div className="mt-5 flex items-start gap-3 rounded-xl border border-amber-500/25 bg-amber-950/20 p-4 text-sm text-amber-100">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            <span>
              Cancellation scheduled. Access until{" "}
              {new Date(billing.cancelEffectiveAt).toLocaleDateString("en-ZA")}, then
              you&apos;ll move to the Free plan.
            </span>
          </div>
        ) : null}

        <div className="mt-6 flex flex-wrap gap-3">
          {(billing.isOnTrial || billing.status === "active" || billing.status === "cancelled") &&
          !billing.cancelAtPeriodEnd ? (
            <Button
              type="button"
              variant="outline"
              disabled={busy !== null}
              onClick={() => void cancelSubscription()}
              className="border-red-500/30 text-red-300 hover:bg-red-950/30"
            >
              {busy === "cancel"
                ? "Processing…"
                : billing.isOnTrial
                  ? "Cancel trial"
                  : "Cancel subscription"}
            </Button>
          ) : null}
          <Link
            href="/dashboard"
            className={cn(buttonVariants({ variant: "outline" }), "border-white/15")}
          >
            Back to dashboard
          </Link>
        </div>
      </GlassCard>

      <div>
        <h3 className="mb-4 text-lg font-semibold text-white">Change plan</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          {tiers.filter((t) => t.id !== "free").map((tier) => {
            const isCurrent = billing.effectiveTier === tier.id && !billing.isOnTrial;
            const isTrialPro = billing.isOnTrial && tier.id === "pro";
            return (
              <GlassCard key={tier.id} className="p-5">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-white">{tier.name}</p>
                  <p className="font-mono text-amber-200">{tier.priceLabel}</p>
                </div>
                <ul className="mt-3 space-y-1">
                  {tier.features.slice(0, 3).map((f) => (
                    <li key={f} className="flex items-start gap-2 text-xs text-zinc-400">
                      <Check className="mt-0.5 size-3 text-amber-400" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  type="button"
                  disabled={isCurrent || isTrialPro || busy !== null}
                  onClick={() => void changeTier(tier.id)}
                  className={cn(
                    "mt-4 w-full rounded-lg",
                    tier.highlighted
                      ? "bg-amber-500 text-black hover:bg-amber-400"
                      : "border border-white/15 bg-white/5"
                  )}
                  variant={tier.highlighted ? "default" : "outline"}
                >
                  {isCurrent || isTrialPro
                    ? "Current plan"
                    : busy === `tier-${tier.id}`
                      ? "Updating…"
                      : `Switch to ${tier.name}`}
                </Button>
              </GlassCard>
            );
          })}
        </div>
      </div>
    </div>
  );
}
