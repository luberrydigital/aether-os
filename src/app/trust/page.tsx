import Link from "next/link";
import { Shield, Scale, Truck, UserCheck } from "lucide-react";
import { SiteHeader } from "@/components/site/site-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ITEMS = [
  {
    icon: UserCheck,
    title: "Who owns the store?",
    body: "The store belongs to the user who launched it. Aether OS provides the software, templates, and orchestration layer.",
  },
  {
    icon: Truck,
    title: "Fulfillment & logistics",
    body: "When enabled, Printful can fulfill physical products. Shipping times, duties, and returns follow the fulfillment provider’s policies.",
  },
  {
    icon: Scale,
    title: "Refunds & disputes",
    body: "Refund handling depends on your payment gateway and merchant setup. You should publish a clear refund policy per storefront.",
  },
  {
    icon: Shield,
    title: "Privacy & data",
    body: "We only expose boolean env health in diagnostics. Do not log secrets. Rotate compromised keys immediately. Follow POPIA/GDPR where applicable.",
  },
] as const;

export default function TrustPage() {
  return (
    <div className="min-h-screen bg-[oklch(0.07_0.03_280)] text-foreground">
      <SiteHeader activeHref="/trust" />

      <main className="mx-auto max-w-[min(100%,90rem)] space-y-10 px-5 py-10 md:px-12 md:py-14">
        <header className="space-y-3">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.42em] text-amber-200/90">
            Trust & legal hub
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
            Serious users join when the rules are clear
          </h1>
          <p className="max-w-3xl text-pretty text-sm text-zinc-400 md:text-base">
            This page is your credibility layer. It sets expectations, reduces support load, and protects the platform.
          </p>
        </header>

        <section className="grid gap-6 md:grid-cols-2">
          {ITEMS.map((x) => (
            <Card key={x.title} className="border-white/10 bg-black/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-white">
                  <span className="flex size-10 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                    <x.icon className="size-5 text-white" aria-hidden />
                  </span>
                  {x.title}
                </CardTitle>
                <CardDescription>{x.body}</CardDescription>
              </CardHeader>
              <CardContent />
            </Card>
          ))}
        </section>

        <section className="rounded-3xl border border-white/10 bg-black/20 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-2">
              <Badge className="border border-violet-500/25 bg-violet-500/10 text-violet-100">Operational checklist</Badge>
              <ul className="list-disc space-y-1 pl-5 text-sm text-zinc-300">
                <li>Publish Terms + Privacy (POPIA/GDPR) and a Refund Policy.</li>
                <li>Configure PayFast ITN / Paystack webhooks and settlement splits for your platform fee.</li>
                <li>Enable Printful only when you’re ready for real fulfillment SLAs.</li>
              </ul>
            </div>
            <Link
              href="/earnings"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "rounded-xl border-white/15 bg-white/5"
              )}
            >
              Review earnings & payouts
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}

