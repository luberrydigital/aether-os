import Link from "next/link";
import { Braces, PlugZap, Puzzle, Wrench } from "lucide-react";
import { SiteHeader } from "@/components/site/site-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function DevelopersPage() {
  return (
    <div className="min-h-screen bg-[oklch(0.07_0.03_280)] text-foreground">
      <SiteHeader activeHref="/developers" />

      <main className="mx-auto max-w-[min(100%,90rem)] space-y-10 px-5 py-10 md:px-12 md:py-14">
        <header className="space-y-3">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.42em] text-zinc-300/80">
            API & developer platform
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
            Phase 2: plugins, agents, integrations
          </h1>
          <p className="max-w-3xl text-pretty text-sm text-zinc-400 md:text-base">
            This is the platform wedge: let builders ship custom agents, growth plugins, and commerce integrations—an App Store model for income streams.
          </p>
        </header>

        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {[
            { icon: PlugZap, title: "Integrations", desc: "Paystack splits, PayFast ITN, Printful, analytics." },
            { icon: Puzzle, title: "Plugins", desc: "Storefront blocks, upsell widgets, experiments." },
            { icon: Braces, title: "Custom agents", desc: "Bring your own tools + eval harness." },
            { icon: Wrench, title: "Webhooks", desc: "Ledger writes from real money events." },
          ].map((x) => (
            <Card key={x.title} className="border-white/10 bg-black/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-white">
                  <span className="flex size-10 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                    <x.icon className="size-5 text-white" aria-hidden />
                  </span>
                  {x.title}
                </CardTitle>
                <CardDescription>{x.desc}</CardDescription>
              </CardHeader>
              <CardContent />
            </Card>
          ))}
        </section>

        <section className="rounded-3xl border border-white/10 bg-black/20 p-6">
          <Badge className="border border-cyan-500/25 bg-cyan-500/10 text-cyan-100">Developer preview</Badge>
          <p className="mt-3 max-w-3xl text-sm text-zinc-300">
            Tonight’s launch stays focused on core product value. Next: public API keys, plugin marketplace, and an agent registry.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/trust"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }), "rounded-xl border-white/15 bg-white/5")}
            >
              Trust & legal hub
            </Link>
            <Link
              href="/growth"
              className={cn(
                buttonVariants({ size: "lg" }),
                "rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cyan-600 text-white"
              )}
            >
              Growth engine
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}

