"use client";

import { useMemo, useState } from "react";
import { Sparkles } from "lucide-react";
import { SiteHeader } from "@/components/site/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Idea = { title: string; whyNow: string; firstOffer: string; firstChannel: string };

export default function IdeaLabPage() {
  const [market, setMarket] = useState("South Africa");
  const [count, setCount] = useState(10);
  const [busy, setBusy] = useState(false);
  const [ideas, setIdeas] = useState<Idea[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const capped = useMemo(() => Math.max(3, Math.min(20, Math.floor(Number(count) || 10))), [count]);

  async function generate() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ market: market.trim() || "South Africa", count: capped }),
      });
      const json = (await res.json()) as { ideas?: Idea[]; error?: string };
      if (!res.ok) {
        setError(json.error ?? "Failed to generate ideas.");
        return;
      }
      setIdeas(Array.isArray(json.ideas) ? json.ideas : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to generate ideas.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-[oklch(0.07_0.03_280)] text-foreground">
      <SiteHeader activeHref="/idea-lab" />

      <main className="mx-auto max-w-[min(100%,90rem)] space-y-10 px-5 py-10 md:px-12 md:py-14">
        <header className="space-y-3">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.42em] text-violet-200/90">
            Idea lab
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
            Give me business ideas that can actually sell
          </h1>
          <p className="max-w-3xl text-pretty text-sm text-zinc-400 md:text-base">
            Removes friction → more launches. Uses your configured LLM when available; otherwise falls back to a solid curated list.
          </p>
        </header>

        <Card className="border-white/10 bg-black/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-white">
              <span className="flex size-10 items-center justify-center rounded-xl border border-violet-500/25 bg-violet-500/10">
                <Sparkles className="size-5 text-violet-100" aria-hidden />
              </span>
              Generator
            </CardTitle>
            <CardDescription>Pick a market and generate ideas you can launch in minutes.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2 md:col-span-2">
              <Label>Target market</Label>
              <Input value={market} onChange={(e) => setMarket(e.target.value)} placeholder="South Africa" />
            </div>
            <div className="space-y-2">
              <Label>How many</Label>
              <Input value={String(count)} onChange={(e) => setCount(Number(e.target.value || "10"))} inputMode="numeric" />
            </div>

            <div className="md:col-span-3">
              <Button onClick={() => void generate()} disabled={busy} className="w-full rounded-xl">
                {busy ? "Generating…" : `Generate ${capped} ideas`}
              </Button>
              {error ? <p className="mt-3 text-xs text-amber-200/90">{error}</p> : null}
            </div>
          </CardContent>
        </Card>

        <section className="grid gap-4">
          {ideas?.length ? (
            ideas.map((i) => (
              <div key={i.title} className="rounded-3xl border border-white/10 bg-black/20 p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-lg font-bold text-white">{i.title}</h2>
                  <Badge className="border border-emerald-500/25 bg-emerald-500/10 text-emerald-100">
                    launchable
                  </Badge>
                </div>
                <div className="mt-3 grid gap-3 md:grid-cols-3">
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-[0.25em] text-zinc-500">Why now</div>
                    <div className="mt-1 text-sm text-zinc-300">{i.whyNow}</div>
                  </div>
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-[0.25em] text-zinc-500">First offer</div>
                    <div className="mt-1 text-sm text-zinc-300">{i.firstOffer}</div>
                  </div>
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-[0.25em] text-zinc-500">First channel</div>
                    <div className="mt-1 text-sm text-zinc-300">{i.firstChannel}</div>
                  </div>
                </div>
              </div>
            ))
          ) : ideas ? (
            <div className="rounded-3xl border border-white/10 bg-black/20 p-5 text-sm text-zinc-400">
              No ideas returned. Try a different market.
            </div>
          ) : (
            <div className="rounded-3xl border border-white/10 bg-black/20 p-5 text-sm text-zinc-400">
              Generate ideas to see results here.
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

