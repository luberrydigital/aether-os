import Link from "next/link";
import {
  ArrowRight,
  Brain,
  CheckCircle2,
  Copy,
  Crown,
  Eye,
  Quote,
  Share2,
  ShoppingBag,
  Sparkles,
  Star,
  Trophy,
  Zap,
} from "lucide-react";
import { PricingSection } from "@/components/marketing/pricing-section";
import { TrustBar } from "@/components/marketing/trust-bar";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { GlassCard } from "@/components/premium/glass-card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

function HeroDashboardMock() {
  const bars = [32, 48, 42, 65, 58, 82, 74, 95, 88, 100, 92, 98, 85, 96, 72, 94];
  return (
    <div className="animate-luberry-float relative w-full max-w-2xl motion-reduce:animate-none">
      <div className="absolute -inset-8 rounded-[2.5rem] bg-gradient-to-br from-amber-500/30 via-amber-400/15 to-cyan-400/10 blur-3xl animate-luberry-neon-pulse" />
      <GlassCard className="overflow-hidden p-1" glow neon>
        <div className="relative rounded-2xl bg-black/60 px-5 pb-6 pt-5 md:px-7">
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="animate-luberry-scan absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-amber-400/10 to-transparent" />
          </div>
          <div className="mb-5 flex items-center justify-between">
            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-emerald-200">
              Empire · Live
            </span>
            <span className="font-mono text-xs text-amber-300/80">UTC 14:32:08</span>
          </div>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500">
            Net revenue · 30-day
          </p>
          <p className="mt-1 bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-400 bg-clip-text font-mono text-5xl font-bold text-transparent md:text-6xl">
            R1,284,900
          </p>
          <p className="mt-1 text-xs text-emerald-400">+47% · 18 AI agents active</p>
          <div className="mt-6 flex h-28 items-end gap-1 md:h-32">
            {bars.map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-t bg-gradient-to-t from-amber-800/60 via-amber-500/70 to-amber-300/90"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
          <div className="mt-5 grid grid-cols-3 gap-3">
            {["Marketing AI", "CEO Agent", "Social Auto"].map((l) => (
              <div key={l} className="rounded-xl border border-white/8 bg-black/50 px-3 py-2 text-center text-[10px] font-semibold text-zinc-300">
                <span className="mr-1 inline-block size-1.5 rounded-full bg-emerald-400" />
                {l}
              </div>
            ))}
          </div>
        </div>
      </GlassCard>
    </div>
  );
}

const KILLER_FEATURES = [
  {
    icon: ShoppingBag,
    title: "AI Agent Marketplace",
    desc: "Buy battle-tested agents from top operators. Deploy revenue-generating specialists in one click.",
    tier: "Pro+",
  },
  {
    icon: Share2,
    title: "Auto Social Manager",
    desc: "Posts to Facebook, Instagram, TikTok, and X automatically. 12 posts/week, zero manual work.",
    tier: "Elite",
  },
  {
    icon: Eye,
    title: "Competitor Spy",
    desc: "AI analyzes competitors and delivers weekly battle plans to crush your market.",
    tier: "Elite",
  },
  {
    icon: Copy,
    title: "One-Click Clone",
    desc: "Duplicate your most successful business instantly. Scale what works.",
    tier: "Pro+",
  },
  {
    icon: Trophy,
    title: "Success Leaderboard",
    desc: "See real earnings from top operators. Anonymized, verified, motivating.",
    tier: "All plans",
  },
  {
    icon: Brain,
    title: "Daily AI Coach",
    desc: "Personalized business insights every morning. Know exactly what to do today.",
    tier: "Pro+",
  },
] as const;

const TESTIMONIALS = [
  {
    quote:
      "I upgraded to Empire and now run 4 businesses on autopilot. R1.2M in 90 days. Luberry AI is the single best investment I've ever made.",
    name: "Thabo M.",
    role: "Empire member · Johannesburg",
    rating: 5,
  },
  {
    quote:
      "The Competitor Spy alone is worth R999/mo. It found a gap in our market that generated R340K in new revenue within 6 weeks.",
    name: "Lisa K.",
    role: "Elite member · Cape Town",
    rating: 5,
  },
  {
    quote:
      "My referral link earned me R4,700 last month — just from friends upgrading to Pro. The 25% lifetime commission is insane.",
    name: "David R.",
    role: "Pro member · Durban",
    rating: 5,
  },
] as const;

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[oklch(0.06_0.02_55)] text-foreground">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_140%_100%_at_50%_-35%,oklch(0.48_0.14_75_/_0.45),transparent_58%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_100%_20%,oklch(0.35_0.1_200_/_0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,oklch(0.04_0.02_55_/_0.98))]" />
      </div>

      <div className="relative z-10 mx-auto max-w-[min(100%,90rem)] px-5 pb-32 pt-8 md:px-12 md:pb-40 md:pt-12">
        <header className="flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex size-12 items-center justify-center rounded-2xl border border-amber-500/35 bg-gradient-to-br from-amber-500/30 to-amber-600/15 shadow-[0_0_50px_-8px_rgba(212,175,55,0.6)]">
              <Sparkles className="size-6 text-amber-200" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.45em] text-amber-200/95">Luberry AI</p>
              <p className="text-sm text-zinc-400">AI Business Empire Platform</p>
            </div>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/pricing" className="text-sm text-zinc-400 transition hover:text-amber-200">
              Pricing
            </Link>
            <Link
              href="/login"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "rounded-xl border-amber-500/25 bg-white/[0.03] hover:border-amber-400/40"
              )}
            >
              Sign in
            </Link>
          </nav>
        </header>

        {/* Hero */}
        <section className="mt-20 grid items-center gap-16 lg:mt-28 lg:grid-cols-2 lg:gap-12">
          <div className="text-center lg:text-left">
            <Badge className="mb-6 border-amber-400/35 bg-amber-500/15 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.25em] text-amber-50">
              The AI company that works harder than any employee
            </Badge>
            <h1 className="text-balance font-bold leading-[0.95] tracking-tight text-white">
              <span className="block text-[clamp(2.5rem,8vw,5.5rem)]">Own Your</span>
              <span className="mt-2 block bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-400 bg-clip-text text-[clamp(2.75rem,9vw,6.5rem)] text-transparent">
                AI Business Empire.
              </span>
            </h1>
            <p className="mx-auto mt-8 max-w-xl text-pretty text-lg leading-relaxed text-zinc-400 md:text-xl lg:mx-0">
              Luberry AI launches, markets, sells, and scales your business 24/7 —
              with agents so powerful you&apos;ll wonder why you ever hired humans.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4 lg:justify-start">
              {["No code", "PayFast ready", "25% referral rewards"].map((t) => (
                <span key={t} className="flex items-center gap-2 text-sm text-zinc-400">
                  <CheckCircle2 className="size-4 text-amber-400" />
                  {t}
                </span>
              ))}
            </div>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start">
              <Link
                href="/login"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "h-14 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-500 to-amber-600 px-8 text-base font-bold text-black shadow-[0_0_80px_-15px_rgba(212,175,55,0.7)] hover:brightness-110"
                )}
              >
                Start Your Empire Free
                <ArrowRight className="ml-2 size-5" />
              </Link>
              <Link
                href="/pricing"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "h-14 rounded-2xl border-amber-500/30 px-8"
                )}
              >
                View Plans
              </Link>
            </div>
            <p className="mt-4 text-sm text-zinc-500">
              4,800+ empires built · Avg. Elite member earns R47K/mo
            </p>
          </div>
          <HeroDashboardMock />
        </section>

        <div className="mt-20">
          <TrustBar />
        </div>

        <Separator className="my-24 border-white/[0.06]" />

        {/* Killer features */}
        <section>
          <div className="mx-auto max-w-3xl text-center">
            <Badge className="mb-4 border-cyan-400/30 bg-cyan-500/10 text-cyan-100">Killer features</Badge>
            <h2 className="text-4xl font-bold text-white md:text-5xl">
              Tools that make upgrading irresistible
            </h2>
            <p className="mt-4 text-lg text-zinc-400">
              Every feature is designed to make your AI company work harder — so you work less.
            </p>
          </div>
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {KILLER_FEATURES.map(({ icon: Icon, title, desc, tier }) => (
              <GlassCard key={title} className="p-6 transition hover:border-amber-400/25" glow>
                <div className="mb-4 flex items-center justify-between">
                  <span className="flex size-12 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/10">
                    <Icon className="size-6 text-amber-300" />
                  </span>
                  <Badge variant="outline" className="border-amber-500/25 text-[10px] text-amber-200">
                    {tier}
                  </Badge>
                </div>
                <h3 className="text-lg font-bold text-white">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">{desc}</p>
              </GlassCard>
            ))}
          </div>
        </section>

        <Separator className="my-24 border-white/[0.06]" />

        <PricingSection />

        <Separator className="my-24 border-white/[0.06]" />

        {/* Testimonials */}
        <section>
          <h2 className="text-center text-4xl font-bold text-white md:text-5xl">
            Operators who upgraded never looked back
          </h2>
          <div className="mt-14 grid gap-8 lg:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <Card key={t.name} className="border-white/10 bg-white/[0.03]">
                <CardContent className="relative pt-8">
                  <Quote className="absolute right-4 top-4 size-16 text-amber-500/10" />
                  <div className="mb-4 flex gap-1">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} className="size-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-base leading-relaxed text-zinc-300">&ldquo;{t.quote}&rdquo;</p>
                  <div className="mt-6 flex items-center gap-3">
                    <div className="flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-amber-600/50 to-amber-700/30 font-bold text-white">
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-white">{t.name}</p>
                      <p className="text-xs text-zinc-500">{t.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="mt-28">
          <GlassCard className="p-12 text-center md:p-20" glow neon>
            <Crown className="mx-auto size-14 text-amber-400" />
            <h2 className="mt-6 text-4xl font-bold text-white md:text-5xl">
              Your empire is one click away.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-zinc-400">
              Free to start. Pro at R299. Elite at R999. Empire at R2,999.
              Earn 25% on every referral — for life.
            </p>
            <Link
              href="/login"
              className={cn(
                buttonVariants({ size: "lg" }),
                "mt-8 inline-flex h-16 gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 px-12 text-lg font-bold text-black"
              )}
            >
              Build My AI Empire
              <Zap className="size-5" />
            </Link>
          </GlassCard>
        </section>

        <footer className="mt-20 flex flex-col items-center justify-between gap-4 border-t border-white/[0.08] pt-12 text-center text-sm text-zinc-500 md:flex-row md:text-left">
          <span>© 2026 Luberry AI · AI Business Empire Platform</span>
          <span>PayFast · Paystack · LangGraph · Built in South Africa</span>
        </footer>
      </div>
    </div>
  );
}
