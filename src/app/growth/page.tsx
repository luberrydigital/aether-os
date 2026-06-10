import Link from "next/link";
import { Bot, Flame, Mail, Megaphone, PlayCircle, Radar, Sparkles } from "lucide-react";
import { SiteHeader } from "@/components/site/site-header";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const TOOLS = [
  {
    icon: Megaphone,
    title: "AI Ad Generator",
    desc: "Hooks, angles, creatives, landing copy. Built for Paystack/PayFast checkout funnels.",
    badge: "Launch-ready",
  },
  {
    icon: PlayCircle,
    title: "TikTok video scripts",
    desc: "Daily short-form scripts + shot lists + captions. (Video render is Phase 2).",
    badge: "Phase 1",
  },
  {
    icon: Mail,
    title: "Email campaigns",
    desc: "Welcome flows, abandon checkout nudges, and post-purchase upsell sequences.",
    badge: "Phase 1",
  },
  {
    icon: Radar,
    title: "Influencer outreach",
    desc: "Find niches, generate outreach DMs, and track replies. (CRM integrations later).",
    badge: "Phase 2",
  },
] as const;

export default function GrowthPage() {
  return (
    <div className="min-h-screen bg-[oklch(0.07_0.03_280)] text-foreground">
      <SiteHeader activeHref="/growth" />

      <main className="mx-auto max-w-[min(100%,90rem)] space-y-10 px-5 py-10 md:px-12 md:py-14">
        <header className="space-y-3">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.42em] text-cyan-200/90">
            Growth engine
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
            Your AI business is now marketing itself
          </h1>
          <p className="max-w-3xl text-pretty text-sm text-zinc-400 md:text-base">
            Stores fail because they don’t get customers. This surface is designed to automate the first sale: creative,
            distribution loops, and relentless iteration.
          </p>
        </header>

        <section className="grid gap-6 lg:grid-cols-3">
          <Card className="border-white/10 bg-black/20 lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white">
                <span className="flex size-10 items-center justify-center rounded-xl border border-cyan-500/25 bg-cyan-500/10">
                  <Bot className="size-5 text-cyan-100" aria-hidden />
                </span>
                Automation loops
              </CardTitle>
              <CardDescription>High-leverage growth tools (now + next).</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              {TOOLS.map((t) => (
                <div key={t.title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="flex size-10 items-center justify-center rounded-xl border border-white/10 bg-black/40">
                        <t.icon className="size-5 text-white" aria-hidden />
                      </span>
                      <div>
                        <div className="font-semibold text-white">{t.title}</div>
                        <div className="text-xs text-zinc-500">{t.badge}</div>
                      </div>
                    </div>
                    <Badge variant="secondary" className="border border-white/10 bg-white/5 text-zinc-200">
                      {t.badge}
                    </Badge>
                  </div>
                  <p className="mt-3 text-sm text-zinc-300">{t.desc}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-black/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white">
                <span className="flex size-10 items-center justify-center rounded-xl border border-amber-500/25 bg-amber-500/10">
                  <Flame className="size-5 text-amber-100" aria-hidden />
                </span>
                First sale automation
              </CardTitle>
              <CardDescription>The game-changer loop.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-zinc-300">
              <p>
                Goal: launch a store and generate the first sale through a repeatable playbook (creative → traffic → conversion → ledger).
              </p>
              <p className="text-xs text-zinc-500">
                Tonight’s launch: this page is a control surface. The webhook-backed “real money” loop is implemented server-side.
              </p>
              <Link
                href="/launch"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "w-full rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cyan-600 text-white"
                )}
              >
                Launch a business
              </Link>
              <Link
                href="/dashboard"
                className={cn(
                  buttonVariants({ variant: "outline", size: "default" }),
                  "w-full rounded-xl border-white/15 bg-white/5"
                )}
              >
                Open Dashboard
              </Link>
            </CardContent>
          </Card>
        </section>

        <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.04] via-transparent to-cyan-950/20 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-violet-200" aria-hidden />
                <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-zinc-500">Positioning</p>
              </div>
              <p className="text-lg font-semibold text-white md:text-xl">We don’t “build stores”. We create income streams.</p>
              <p className="max-w-3xl text-sm text-zinc-400">
                Your brand, products, and growth loops are generated as a single operating system. The dashboard is the addiction loop.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

