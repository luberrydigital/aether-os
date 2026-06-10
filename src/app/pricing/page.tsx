import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { PricingSection } from "@/components/marketing/pricing-section";
import { TrustBar } from "@/components/marketing/trust-bar";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Pricing — Luberry AI",
  description: "Choose the plan that builds your AI business empire. Pro, Elite, and Empire tiers.",
};

export default function PricingPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[oklch(0.06_0.02_55)] text-foreground">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,oklch(0.45_0.14_75_/_0.4),transparent_60%)]" />
      </div>

      <header className="mx-auto flex max-w-[90rem] items-center justify-between px-5 py-8 md:px-12">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl border border-amber-500/30 bg-amber-500/10">
            <Sparkles className="size-5 text-amber-300" />
          </span>
          <span className="text-sm font-bold uppercase tracking-[0.3em] text-amber-200">
            Luberry AI
          </span>
        </Link>
        <Link
          href="/login"
          className={cn(buttonVariants({ variant: "outline" }), "rounded-xl border-amber-500/30")}
        >
          Sign in
        </Link>
      </header>

      <main className="mx-auto max-w-[90rem] px-5 pb-32 md:px-12">
        <PricingSection />
        <div className="mt-20">
          <TrustBar />
        </div>
        <div className="mt-20 text-center">
          <Link
            href="/login"
            className={cn(
              buttonVariants({ size: "lg" }),
              "inline-flex gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 px-10 text-lg font-bold text-black"
            )}
          >
            Start Building Your Empire
            <ArrowRight className="size-5" />
          </Link>
        </div>
      </main>
    </div>
  );
}
