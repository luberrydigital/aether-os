import Link from "next/link";
import { Crown, Rocket, Trophy } from "lucide-react";
import { SiteHeader } from "@/components/site/site-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { dbListCompanies, dbListStorefronts } from "@/lib/db/local-db";
import { cn } from "@/lib/utils";

function moneyZar(cents: number) {
  return new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR", maximumFractionDigits: 0 }).format(cents / 100);
}

export default async function CommunityPage() {
  const [companies, storefronts] = await Promise.all([dbListCompanies(200), dbListStorefronts(200)]);
  const storefrontByCompany = new Map(storefronts.map((s) => [s.company_id, s]));

  const leaderboard = companies
    .map((c) => {
      const net = (c.total_net_zar_cents ?? 0) + Math.round((c.total_net_usd_cents ?? 0) * 18);
      return { company: c, storefront: storefrontByCompany.get(c.id) ?? null, netScore: net };
    })
    .sort((a, b) => b.netScore - a.netScore)
    .slice(0, 10);

  return (
    <div className="min-h-screen bg-[oklch(0.07_0.03_280)] text-foreground">
      <SiteHeader activeHref="/community" />

      <main className="mx-auto max-w-[min(100%,90rem)] space-y-10 px-5 py-10 md:px-12 md:py-14">
        <header className="space-y-3">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.42em] text-fuchsia-200/90">
            Community + viral loop
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
            Competition creates velocity
          </h1>
          <p className="max-w-3xl text-pretty text-sm text-zinc-400 md:text-base">
            Leaderboards, challenges, and shared wins. The goal is productive pressure: build, launch, earn.
          </p>
        </header>

        <section className="grid gap-6 lg:grid-cols-3">
          <Card className="border-white/10 bg-black/20 lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white">
                <Trophy className="size-5 text-amber-200" aria-hidden />
                Top earners (demo)
              </CardTitle>
              <CardDescription>Backed by the same revenue ledger that powers Mission Control.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              {leaderboard.map((row, idx) => {
                const sf = row.storefront;
                return (
                  <div
                    key={row.company.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-xl border border-white/10 bg-black/40 font-mono text-sm text-zinc-200">
                        {idx + 1}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate font-semibold text-white">{sf?.name ?? "Aether Company"}</div>
                        <div className="truncate text-xs text-zinc-400">{sf?.slug ?? row.company.id}</div>
                      </div>
                      {idx === 0 ? (
                        <Badge className="border border-amber-500/25 bg-amber-500/10 text-amber-100">
                          <Crown className="mr-1 size-3.5" /> champion
                        </Badge>
                      ) : null}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="border border-emerald-500/25 bg-emerald-500/10 text-emerald-100">
                        net {moneyZar(row.netScore)}
                      </Badge>
                      {sf ? (
                        <Link
                          href={`/store/${sf.slug}`}
                          className={cn(buttonVariants({ variant: "outline", size: "sm" }), "rounded-xl border-white/15 bg-white/5")}
                        >
                          View store
                        </Link>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-black/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white">
                <Rocket className="size-5 text-violet-200" aria-hidden />
                Challenges
              </CardTitle>
              <CardDescription>Virality with a purpose.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-zinc-300">
              <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                <div className="font-semibold text-white">First R1,000 challenge</div>
                <div className="mt-1 text-xs text-zinc-500">Launch → first sale → iterate daily.</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                <div className="font-semibold text-white">7-day storefront sprint</div>
                <div className="mt-1 text-xs text-zinc-500">A/B price, hooks, and landing changes.</div>
              </div>
              <Link
                href="/explore"
                className={cn(buttonVariants({ size: "lg" }), "w-full rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cyan-600 text-white")}
              >
                Explore launches
              </Link>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}

