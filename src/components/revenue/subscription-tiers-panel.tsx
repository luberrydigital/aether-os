"use client";

import { useEffect, useState } from "react";
import { Check, Crown, Gem, Rocket, Sparkles, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/premium/glass-card";
import { cn } from "@/lib/utils";
import type { SubscriptionTier, TierDefinition } from "@/lib/subscriptions/tiers";

const TIER_ICONS: Record<SubscriptionTier, typeof Sparkles> = {
  free: Sparkles,
  pro: Zap,
  elite: Crown,
  empire: Gem,
};

export function SubscriptionTiersPanel() {
  const [tiers, setTiers] = useState<TierDefinition[]>([]);
  const [currentTier, setCurrentTier] = useState<SubscriptionTier>("free");
  const [busy, setBusy] = useState<SubscriptionTier | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      const res = await fetch("/api/subscription");
      if (!res.ok) return;
      const json = (await res.json()) as {
        tier: SubscriptionTier;
        tiers: TierDefinition[];
      };
      setCurrentTier(json.tier);
      setTiers(json.tiers);
    })();
  }, []);

  async function selectTier(tier: SubscriptionTier) {
    if (tier === currentTier) return;
    setBusy(tier);
    setMessage(null);
    try {
      const res = await fetch("/api/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier }),
      });
      const json = (await res.json()) as {
        error?: string;
        message?: string;
        tier?: SubscriptionTier;
      };
      if (!res.ok) {
        setMessage(json.error ?? "Failed to update plan.");
        return;
      }
      setCurrentTier(json.tier ?? tier);
      setMessage(json.message ?? "Plan updated. Your empire just got more powerful.");
    } catch {
      setMessage("Failed to update plan.");
    } finally {
      setBusy(null);
    }
  }

  if (!tiers.length) return null;

  return (
    <GlassCard className="p-6 md:p-8" glow neon>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Rocket className="size-7 text-amber-400" />
        <div>
          <h2 className="text-2xl font-bold text-white md:text-3xl">
            Upgrade your empire
          </h2>
          <p className="text-sm text-zinc-400">
            Every tier unlocks agents that work harder than any employee.
          </p>
        </div>
      </div>

      {message ? (
        <p className="mb-6 rounded-xl border border-amber-500/25 bg-amber-950/30 px-4 py-3 text-sm text-amber-100">
          {message}
        </p>
      ) : null}

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {tiers.map((tier) => {
          const Icon = TIER_ICONS[tier.id];
          const isCurrent = currentTier === tier.id;
          const isEmpire = tier.id === "empire";
          return (
            <div
              key={tier.id}
              className={cn(
                "relative flex flex-col rounded-2xl border p-5 transition duration-300",
                tier.highlighted &&
                  "border-amber-500/50 bg-gradient-to-b from-amber-950/50 to-black/60 shadow-[0_0_50px_-12px_rgba(212,175,55,0.4)]",
                isEmpire &&
                  "border-cyan-400/30 bg-gradient-to-b from-cyan-950/30 via-amber-950/20 to-black/60",
                !tier.highlighted && !isEmpire && "border-white/10 bg-black/50",
                isCurrent && "ring-2 ring-amber-400/60"
              )}
            >
              {tier.badge ? (
                <Badge
                  className={cn(
                    "absolute -top-3 left-1/2 -translate-x-1/2 border-0 text-[10px] font-bold uppercase",
                    isEmpire ? "bg-cyan-400 text-black" : "bg-amber-500 text-black"
                  )}
                >
                  {tier.badge}
                </Badge>
              ) : null}
              <div className="flex items-center gap-3 pt-2">
                <span className="flex size-10 items-center justify-center rounded-xl border border-amber-500/25 bg-amber-500/10">
                  <Icon className="size-5 text-amber-300" />
                </span>
                <div>
                  <p className="text-lg font-bold text-white">{tier.name}</p>
                  <p className="text-xs text-zinc-500">{tier.tagline}</p>
                </div>
              </div>
              <p className="mt-4 font-mono text-2xl font-bold text-amber-200">
                {tier.priceLabel}
              </p>
              <ul className="mt-4 flex-1 space-y-2">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-xs text-zinc-300">
                    <Check className="mt-0.5 size-3.5 shrink-0 text-amber-400" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                type="button"
                disabled={isCurrent || busy !== null}
                onClick={() => void selectTier(tier.id)}
                className={cn(
                  "mt-5 w-full rounded-xl font-semibold",
                  tier.highlighted || isEmpire
                    ? "bg-gradient-to-r from-amber-500 to-amber-600 text-black hover:from-amber-400 hover:to-amber-500"
                    : "border border-white/15 bg-white/5 text-white hover:bg-white/10"
                )}
                variant={tier.highlighted || isEmpire ? "default" : "outline"}
              >
                {isCurrent
                  ? "Current plan"
                  : busy === tier.id
                    ? "Activating…"
                    : tier.priceZar === 0
                      ? "Downgrade"
                      : `Unlock ${tier.name}`}
              </Button>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}
