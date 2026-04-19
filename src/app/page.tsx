import Link from "next/link";
import {
  Bot,
  Clock,
  Cpu,
  Quote,
  Shield,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

function OrbitingAgentCore() {
  const angles = [0, 120, 240];
  const labels = ["Strategist", "Growth", "Treasury"];
  return (
    <div
      className="relative mx-auto flex size-[min(100%,17rem)] items-center justify-center md:size-[21rem]"
      aria-hidden
    >
      <div className="absolute inset-[6%] rounded-full border border-violet-400/25 bg-[radial-gradient(circle_at_50%_30%,oklch(0.35_0.2_280_/_0.38),transparent_65%)] shadow-[inset_0_0_60px_rgba(139,92,246,0.14)]" />
      <div className="absolute inset-[18%] rounded-full border border-cyan-500/20" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="absolute size-28 rounded-full bg-gradient-to-br from-violet-600/60 via-fuchsia-500/40 to-cyan-400/50 blur-2xl motion-reduce:animate-none animate-aether-pulse-glow" />
        <div className="relative flex size-24 items-center justify-center rounded-full border border-white/20 bg-black/60 shadow-[0_0_40px_-8px_rgba(167,139,250,0.6)] backdrop-blur-md md:size-28">
          <Cpu className="size-11 text-white drop-shadow-[0_0_18px_rgba(167,139,250,0.9)] md:size-12" />
        </div>
      </div>
      <div className="absolute inset-0 motion-reduce:animate-none animate-[spin_28s_linear_infinite]">
        {angles.map((deg) => (
          <div
            key={deg}
            className="absolute left-1/2 top-1/2 size-0 [--orbit-r:-5rem] md:[--orbit-r:-6.25rem]"
            style={{
              transform: `translate(-50%, -50%) rotate(${deg}deg) translateY(var(--orbit-r))`,
            }}
          >
            <div className="size-3 -translate-x-1/2 rounded-full bg-gradient-to-br from-cyan-300 to-violet-400 shadow-[0_0_22px_rgba(34,211,238,0.95)]" />
          </div>
        ))}
      </div>
      <div
        className="pointer-events-none absolute inset-0 motion-reduce:animate-none animate-[spin_32s_linear_infinite]"
        style={{ animationDirection: "reverse" }}
      >
        {angles.map((deg, i) => (
          <div
            key={`lbl-${deg}`}
            className="absolute left-1/2 top-1/2 size-0 [--orbit-r2:-6rem] md:[--orbit-r2:-7.25rem]"
            style={{
              transform: `translate(-50%, -50%) rotate(${deg + 60}deg) translateY(var(--orbit-r2))`,
            }}
          >
            <div className="-translate-x-1/2 whitespace-nowrap rounded-md border border-white/15 bg-black/80 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.18em] text-violet-100/95 shadow-[0_0_16px_rgba(139,92,246,0.35)] md:text-[10px]">
              {labels[i]}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function HeroDashboardMock() {
  const bars = [32, 58, 42, 72, 48, 86, 64, 92, 54, 88, 76, 100, 68, 94, 52, 84];
  return (
    <div
      className="animate-aether-float relative w-full max-w-2xl motion-reduce:animate-none"
      aria-hidden
    >
      <div className="absolute -inset-6 rounded-[2rem] bg-gradient-to-br from-violet-600/30 via-fuchsia-500/20 to-cyan-500/25 blur-3xl motion-reduce:opacity-60" />
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.14] bg-gradient-to-b from-zinc-900/98 to-black/95 p-1 shadow-[0_0_0_1px_rgba(255,255,255,0.05)_inset,0_32px_100px_-28px_rgba(139,92,246,0.55),0_24px_80px_-24px_rgba(34,211,238,0.25)] backdrop-blur-2xl md:rounded-3xl">
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[0.875rem] md:rounded-[1.375rem]">
          <div className="animate-aether-shimmer-line absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
        </div>
        <div className="relative rounded-xl bg-black/55 px-4 pb-5 pt-4 md:rounded-2xl md:px-6 md:pb-6 md:pt-5">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-2">
              <span className="size-3 rounded-full bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.6)]" />
              <span className="size-3 rounded-full bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.5)]" />
              <span className="size-3 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.55)]" />
            </div>
            <div className="flex items-center gap-2">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400/60 opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
              </span>
              <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.25em] text-emerald-100 md:text-[11px]">
                Live stream · Sandbox
              </span>
            </div>
          </div>
          <div className="grid gap-4 lg:grid-cols-5">
            <div className="rounded-2xl border border-white/[0.1] bg-gradient-to-br from-white/[0.08] via-transparent to-violet-950/20 p-5 lg:col-span-3">
              <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-zinc-500">
                Empire treasury (rolling)
              </p>
              <p className="mt-2 bg-gradient-to-r from-emerald-300 via-cyan-200 to-violet-200 bg-clip-text font-mono text-4xl font-bold tabular-nums tracking-tight text-transparent md:text-5xl lg:text-6xl">
                $2,847,190
              </p>
              <p className="mt-1 text-xs text-violet-300/80 md:text-sm">
                Synthetic preview — scales with your orchestration graph
              </p>
              <div className="mt-6 flex h-24 items-end gap-0.5 md:h-28 md:gap-1">
                {bars.map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t-sm bg-gradient-to-t from-violet-700/40 via-fuchsia-500/50 to-cyan-400/90 opacity-90 shadow-[0_0_12px_-2px_rgba(34,211,238,0.35)] transition-all duration-700 hover:opacity-100"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-3 lg:col-span-2">
              <div className="rounded-2xl border border-white/[0.1] bg-white/[0.04] p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-500">
                  Agent mesh
                </p>
                <div className="mt-3 space-y-2">
                  {["Orchestrator", "Revenue AI", "Risk core"].map((label, i) => (
                    <div
                      key={label}
                      className="flex items-center justify-between gap-2 rounded-xl border border-white/[0.06] bg-black/50 px-3 py-2 text-xs md:text-sm"
                    >
                      <span className="truncate font-medium text-zinc-100">
                        {label}
                      </span>
                      <span
                        className={cn(
                          "size-2 shrink-0 rounded-full shadow-lg",
                          i === 0 &&
                            "animate-pulse bg-emerald-400 shadow-emerald-400/50",
                          i === 1 && "bg-cyan-400 shadow-cyan-400/40",
                          i === 2 && "bg-violet-400 shadow-violet-400/40"
                        )}
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-1 flex-col justify-center rounded-2xl border border-fuchsia-500/25 bg-gradient-to-br from-fuchsia-950/40 to-violet-950/30 p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-fuchsia-200/80">
                  Velocity pulse
                </p>
                <p className="mt-1 font-mono text-lg font-bold text-white md:text-xl">
                  +$18,420 <span className="text-sm font-normal text-fuchsia-200/90">/ hr</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const benefits = [
  {
    title: "Passive income at scale",
    description:
      "Autonomous revenue engines compound while you sleep — pipelines, follow-ups, and settlement signals never idle.",
    icon: TrendingUp,
  },
  {
    title: "24/7 planetary uptime",
    description:
      "Strategy, fulfillment, and treasury monitoring run as a coordinated mesh, not a single brittle bot.",
    icon: Clock,
  },
  {
    title: "Zero headcount drag",
    description:
      "Replace org charts with orchestrated specialists. Human gates only where capital actually moves.",
    icon: Bot,
  },
  {
    title: "Instant empire launch",
    description:
      "One sentence becomes blueprint, economics, agent roster, and a cockpit worthy of a closing room.",
    icon: Zap,
  },
] as const;

const testimonials = [
  {
    quote:
      "We went from idea to investor-ready narrative in one evening. The scale of the UI alone signals seriousness.",
    name: "Marcus V.",
    role: "GP, emerging tech fund",
  },
  {
    quote:
      "This is the first ‘AI OS’ that feels like mission control, not a toy. Our pilot clients assume we raised a mega-round.",
    name: "Amara K.",
    role: "CEO, distributed commerce",
  },
  {
    quote:
      "The treasury interrupt is the killer feature — autonomous until money moves, then humans stay in the loop.",
    name: "Thomas L.",
    role: "CFO, fintech scale-up",
  },
] as const;

const revolutionStats = [
  { label: "Agent lanes", value: "∞", hint: "LangGraph-native" },
  { label: "Uptime posture", value: "24/7", hint: "Always-on mesh" },
  { label: "Capital gates", value: "Human", hint: "Treasury-safe" },
  { label: "Rails", value: "ZA + Pan-Africa", hint: "PayFast · Paystack" },
] as const;

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[oklch(0.08_0.03_280)] text-foreground">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_140%_100%_at_50%_-35%,oklch(0.48_0.24_285_/_0.5),transparent_58%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_55%_at_110%_15%,oklch(0.4_0.16_200_/_0.28),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_-10%_70%,oklch(0.42_0.2_320_/_0.22),transparent_48%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,oklch(0.05_0.03_280_/_0.97))]" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 256 256%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22 opacity=%220.04%22/%3E%3C/svg%3E')]" />
      </div>

      <div className="relative z-10 mx-auto max-w-[min(100%,90rem)] px-5 pb-32 pt-8 md:px-12 md:pb-40 md:pt-12">
        <header className="flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex size-11 items-center justify-center rounded-2xl border border-white/15 bg-gradient-to-br from-violet-500/40 to-cyan-500/25 shadow-[0_0_40px_-6px_rgba(139,92,246,0.65)] md:size-12">
              <Sparkles className="size-5 text-white md:size-6" aria-hidden />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.45em] text-violet-200/90 md:text-xs">
                Aether OS
              </p>
              <p className="text-sm text-zinc-400 md:text-base">
                Autonomous revenue operating system
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge
              variant="outline"
              className="hidden border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-100 sm:inline-flex"
            >
              Private beta
            </Badge>
            <Link
              href="/login"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "h-10 rounded-xl border-white/20 bg-white/[0.04] px-5 text-sm backdrop-blur-xl transition hover:border-violet-400/45 hover:bg-white/[0.08] md:h-11 md:px-6"
              )}
            >
              Sign in
            </Link>
          </div>
        </header>

        {/* Hero */}
        <section className="mt-20 grid items-center gap-16 lg:mt-28 lg:grid-cols-[1.08fr_0.92fr] lg:gap-10 xl:gap-16">
          <div className="text-center lg:text-left">
            <Badge className="mb-8 border-violet-400/35 bg-gradient-to-r from-violet-600/25 to-cyan-600/20 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.28em] text-violet-50 shadow-[0_0_32px_-8px_rgba(139,92,246,0.5)] md:text-xs">
              The AI business revolution is here
            </Badge>
            <h1 className="text-balance font-sans font-bold leading-[0.92] tracking-[-0.02em] text-white">
              <span className="block text-[clamp(2.75rem,10vw,7rem)]">One Sentence.</span>
              <span className="mt-2 block bg-gradient-to-r from-white via-violet-100 to-cyan-200 bg-clip-text text-[clamp(2.5rem,9vw,6.5rem)] text-transparent">
                Your AI Empire.
              </span>
              <span className="mt-2 block text-[clamp(2.25rem,8vw,5.5rem)] text-zinc-100">
                Real Revenue.
              </span>
            </h1>
            <p className="mx-auto mt-8 max-w-2xl text-pretty text-lg leading-relaxed text-zinc-400 md:mx-0 md:text-xl md:leading-relaxed lg:text-2xl lg:leading-relaxed">
              Aether OS instantly builds, launches, and runs a complete autonomous
              AI business that generates money 24/7. No code. No team. Just
              profits.
            </p>

            <div className="mt-12 flex flex-col items-stretch gap-4 sm:items-center lg:items-stretch">
              <Link
                href="/login"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "relative h-16 min-h-[4rem] w-full overflow-hidden rounded-2xl border border-white/15 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cyan-500 px-6 text-center text-base font-bold tracking-tight text-white shadow-[0_0_80px_-12px_rgba(167,139,250,0.9),0_20px_60px_-20px_rgba(34,211,238,0.45)] transition duration-300 hover:scale-[1.01] hover:brightness-110 active:scale-[0.995] motion-reduce:transition-none motion-reduce:hover:scale-100 sm:max-w-xl md:h-[4.25rem] md:text-lg lg:max-w-none"
                )}
                aria-label="Launch my first AI company free"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  🚀 Launch My First AI Company Free
                </span>
                <span className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent opacity-0 transition-opacity duration-500 hover:opacity-100 motion-reduce:hidden" />
              </Link>
              <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
                <Link
                  href="/login"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "lg" }),
                    "h-12 rounded-xl border-white/20 bg-white/[0.03] px-8 text-sm backdrop-blur-xl transition hover:border-violet-400/40 hover:bg-white/[0.07] md:h-14 md:text-base"
                  )}
                >
                  Get Started Free
                </Link>
                <Link
                  href="/login"
                  className="text-sm text-violet-300/90 underline-offset-4 transition hover:text-violet-200 hover:underline md:text-base"
                >
                  I already have an account →
                </Link>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-12 lg:items-end">
            <OrbitingAgentCore />
            <HeroDashboardMock />
          </div>
        </section>

        <Separator className="my-24 border-white/[0.06] bg-transparent md:my-36" />

        {/* Benefits */}
        <section>
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-balance text-4xl font-bold tracking-tight text-white md:text-5xl lg:text-6xl">
              Infrastructure-grade leverage
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-zinc-400 md:text-xl">
              Every surface is tuned for conviction: dense data, cinematic depth,
              and motion that whispers scale.
            </p>
          </div>
          <div className="mt-16 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {benefits.map(({ title, description, icon: Icon }) => (
              <Card
                key={title}
                className="group relative overflow-hidden border-white/[0.1] bg-white/[0.03] shadow-none ring-1 ring-white/[0.08] transition duration-500 hover:-translate-y-2 hover:border-violet-400/30 hover:shadow-[0_24px_80px_-32px_rgba(139,92,246,0.35)] motion-reduce:transition-none motion-reduce:hover:translate-y-0"
              >
                <div className="pointer-events-none absolute -right-8 -top-8 size-32 rounded-full bg-violet-500/10 blur-2xl transition group-hover:bg-violet-500/20" />
                <CardHeader className="relative pb-2">
                  <div className="mb-4 flex size-14 items-center justify-center rounded-2xl border border-white/15 bg-gradient-to-br from-violet-500/35 to-cyan-500/20 text-violet-100 shadow-[0_0_28px_-6px_rgba(139,92,246,0.5)] transition group-hover:from-violet-500/50 group-hover:to-cyan-500/35">
                    <Icon className="size-7" aria-hidden />
                  </div>
                  <CardTitle className="text-xl font-bold text-white md:text-2xl">
                    {title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative pt-0">
                  <CardDescription className="text-base leading-relaxed text-zinc-400">
                    {description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Join revolution */}
        <section className="mt-28 md:mt-40">
          <div className="relative overflow-hidden rounded-[2rem] border border-white/[0.12] bg-gradient-to-br from-violet-950/50 via-zinc-950/80 to-cyan-950/40 p-10 shadow-[0_0_100px_-30px_rgba(139,92,246,0.45)] md:rounded-[2.5rem] md:p-16 lg:p-20">
            <div className="pointer-events-none absolute -left-20 top-0 size-96 rounded-full bg-violet-600/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 right-0 size-80 rounded-full bg-cyan-500/15 blur-3xl" />
            <div className="relative mx-auto max-w-4xl text-center">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/30 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-violet-200/90">
                <Shield className="size-4 text-cyan-300" aria-hidden />
                Sovereign-grade control
              </div>
              <h2 className="text-balance text-4xl font-bold tracking-tight text-white md:text-5xl lg:text-6xl xl:text-7xl">
                Join the AI Business Revolution
              </h2>
              <p className="mx-auto mt-6 max-w-3xl text-pretty text-lg leading-relaxed text-zinc-400 md:text-xl lg:text-2xl">
                Operators are replacing entire GTM orgs with orchestrated
                intelligence. Aether OS is the cockpit where strategy, capital,
                and execution converge — in one obsessive dark interface.
              </p>
            </div>
            <div className="relative mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {revolutionStats.map((s) => (
                <div
                  key={s.label}
                  className="rounded-2xl border border-white/[0.1] bg-black/40 p-6 text-center backdrop-blur-md transition hover:border-violet-400/25"
                >
                  <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-zinc-500">
                    {s.label}
                  </p>
                  <p className="mt-3 font-mono text-3xl font-bold text-white md:text-4xl">
                    {s.value}
                  </p>
                  <p className="mt-2 text-xs text-violet-300/80">{s.hint}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Social proof */}
        <section className="mt-28 md:mt-40">
          <div className="flex flex-col items-center gap-3 text-center">
            <Badge
              variant="outline"
              className="border-white/20 bg-white/[0.04] px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400"
            >
              Signal from the edge
            </Badge>
            <h2 className="max-w-4xl text-balance text-4xl font-bold tracking-tight text-white md:text-5xl lg:text-6xl">
              Built for people who move markets
            </h2>
          </div>
          <div className="mt-16 grid gap-8 lg:grid-cols-3">
            {testimonials.map((t) => (
              <Card
                key={t.name}
                className="relative overflow-hidden border-white/[0.1] bg-gradient-to-b from-white/[0.06] to-transparent ring-1 ring-white/[0.08] transition hover:ring-violet-500/25"
              >
                <Quote
                  className="absolute -right-2 -top-2 size-24 text-violet-500/[0.15] md:size-28"
                  aria-hidden
                />
                <CardContent className="relative pt-10 md:pt-12">
                  <p className="text-base leading-relaxed text-zinc-300 md:text-lg">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div className="mt-8 flex items-center gap-4">
                    <div className="flex size-12 items-center justify-center rounded-2xl border border-white/15 bg-gradient-to-br from-violet-600/50 to-fuchsia-600/35 text-lg font-bold text-white">
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-base font-semibold text-white">
                        {t.name}
                      </p>
                      <p className="text-sm text-zinc-500">{t.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="mt-28 md:mt-40">
          <div className="relative overflow-hidden rounded-[2rem] border border-white/[0.12] bg-gradient-to-br from-black via-violet-950/60 to-cyan-950/50 p-12 text-center shadow-[0_0_120px_-40px_rgba(34,211,238,0.35)] md:rounded-[2.5rem] md:p-20">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,oklch(0.55_0.22_285_/_0.35),transparent_55%)]" />
            <div className="relative mx-auto max-w-3xl space-y-8">
              <h2 className="text-balance text-4xl font-bold tracking-tight text-white md:text-5xl lg:text-6xl">
                One sentence away from your next empire.
              </h2>
              <p className="text-lg text-zinc-400 md:text-xl">
                No pitch deck required. Launch the cockpit, bind your rails, and
                let the mesh hunt revenue while you sleep.
              </p>
              <Link
                href="/login"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "inline-flex h-16 min-w-[min(100%,22rem)] items-center justify-center rounded-2xl bg-white px-10 text-lg font-bold text-zinc-950 shadow-[0_0_60px_-12px_rgba(255,255,255,0.4)] transition hover:scale-[1.02] hover:bg-zinc-100 motion-reduce:hover:scale-100"
                )}
              >
                🚀 Launch My First AI Company Free
              </Link>
            </div>
          </div>
        </section>

        <footer className="mt-20 flex flex-col items-center justify-between gap-6 border-t border-white/[0.08] pt-14 text-center text-sm text-zinc-500 md:flex-row md:text-left">
          <span className="max-w-md">
            Built with Next.js 15, Supabase, LangGraph, and shadcn/ui.
          </span>
          <span className="max-w-md text-balance">
            Dark-first · Treasury-aware · PayFast & Paystack ready
          </span>
        </footer>
      </div>
    </div>
  );
}
