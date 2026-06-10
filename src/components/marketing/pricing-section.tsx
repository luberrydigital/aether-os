import Link from "next/link";
import { Check, Crown, Gem, Sparkles, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { GlassCard } from "@/components/premium/glass-card";
import { SUBSCRIPTION_TIERS } from "@/lib/subscriptions/tiers";
import { cn } from "@/lib/utils";

const ICONS = {
  free: Sparkles,
  pro: Zap,
  elite: Crown,
  empire: Gem,
} as const;

export function PricingSection({ showCta = true }: { showCta?: boolean }) {
  return (
    <section>
      <div className="mx-auto max-w-4xl text-center">
        <Badge className="mb-4 border-amber-500/30 bg-amber-500/10 text-amber-100">
          Investment in your empire
        </Badge>
        <h2 className="text-balance text-4xl font-bold tracking-tight text-white md:text-5xl lg:text-6xl">
          Plans that pay for themselves
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-zinc-400">
          Operators on Elite earn an average of R47,000/month. Empire members run
          multiple businesses on autopilot. The question isn&apos;t whether you can
          afford it — it&apos;s whether you can afford not to.
        </p>
      </div>

      <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {SUBSCRIPTION_TIERS.map((tier) => {
          const Icon = ICONS[tier.id];
          const isEmpire = tier.id === "empire";
          return (
            <GlassCard
              key={tier.id}
              className={cn(
                "flex flex-col p-6",
                tier.highlighted && "neon",
                isEmpire && "border-cyan-400/25"
              )}
              glow={tier.highlighted || isEmpire}
              neon={tier.highlighted}
            >
              {tier.badge ? (
                <Badge
                  className={cn(
                    "mb-4 w-fit border-0 text-[10px] font-bold uppercase",
                    isEmpire ? "bg-cyan-400 text-black" : "bg-amber-500 text-black"
                  )}
                >
                  {tier.badge}
                </Badge>
              ) : (
                <div className="mb-4 h-6" />
              )}
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/10">
                  <Icon className="size-5 text-amber-300" />
                </span>
                <div>
                  <p className="text-xl font-bold text-white">{tier.name}</p>
                  <p className="text-xs text-zinc-500">{tier.tagline}</p>
                </div>
              </div>
              <p className="mt-5 font-mono text-3xl font-bold text-amber-200">
                {tier.priceLabel}
              </p>
              {tier.priceZar > 0 ? (
                <p className="mt-1 text-xs text-emerald-400/80">
                  ROI: avg. {tier.id === "empire" ? "12x" : tier.id === "elite" ? "8x" : "4x"} in 30 days
                </p>
              ) : null}
              <ul className="mt-5 flex-1 space-y-2.5">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-zinc-300">
                    <Check className="mt-0.5 size-4 shrink-0 text-amber-400" />
                    {f}
                  </li>
                ))}
              </ul>
              {showCta ? (
                <Link
                  href="/login"
                  className={cn(
                    buttonVariants({ size: "sm" }),
                    "mt-6 w-full rounded-xl font-semibold",
                    tier.highlighted || isEmpire
                      ? "bg-gradient-to-r from-amber-500 to-amber-600 text-black hover:from-amber-400"
                      : "border border-white/15 bg-white/5 text-white"
                  )}
                >
                  {tier.priceZar === 0 ? "Start free" : `Get ${tier.name}`}
                </Link>
              ) : null}
            </GlassCard>
          );
        })}
      </div>

      <p className="mt-8 text-center text-sm text-zinc-500">
        All paid plans include a 14-day money-back guarantee · Cancel anytime ·
        Refer friends and earn 25% for life
      </p>
    </section>
  );
}
