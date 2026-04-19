"use client";

import { useEffect, useMemo, useState } from "react";
import { Cpu, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
export type DashboardAgent = {
  id: string;
  name: string;
  lane: string;
  mandate: string;
};

const ACTIVITY_POOL: Record<string, string[]> = {
  strategy: [
    "Compressing ICP signals from live traffic…",
    "Rewriting wedge narrative for outbound v2…",
    "Scoring leads against fit matrix…",
  ],
  engineering: [
    "Hardening agent graph edges + eval harness…",
    "Patching tool auth scopes for CRM sync…",
    "Running regression on billing webhooks…",
  ],
  growth: [
    "Spinning creative variant C for paid social…",
    "Tuning bid caps on high-intent cohort…",
    "Drafting lifecycle email for trial → paid…",
  ],
  ops: [
    "Reconciling sandbox payouts vs ledger…",
    "Watching SLA timers for handoff queue…",
    "Rotating API keys on staging gateway…",
  ],
  default: [
    "Coordinating downstream tasks…",
    "Listening for operator overrides…",
    "Streaming telemetry to mission control…",
  ],
};

function poolForLane(lane: string): string[] {
  const k = lane.toLowerCase();
  if (k.includes("strateg") || k.includes("market")) return ACTIVITY_POOL.strategy;
  if (k.includes("engineer") || k.includes("product")) return ACTIVITY_POOL.engineering;
  if (k.includes("growth") || k.includes("sale")) return ACTIVITY_POOL.growth;
  if (k.includes("ops") || k.includes("finance") || k.includes("monitor"))
    return ACTIVITY_POOL.ops;
  return ACTIVITY_POOL.default;
}

export function ActiveAgentsPanel({ agents }: { agents: DashboardAgent[] }) {
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setPulse((p) => p + 1), 4_500);
    return () => window.clearInterval(id);
  }, []);

  const activities = useMemo(() => {
    return agents.map((a, idx) => {
      const pool = poolForLane(a.lane);
      return pool[(pulse + idx) % pool.length];
    });
  }, [agents, pulse]);

  return (
    <Card className="relative overflow-hidden border-cyan-500/20 bg-gradient-to-br from-zinc-950/80 via-black/60 to-violet-950/30 shadow-[0_0_60px_-20px_rgba(34,211,238,0.2)] backdrop-blur-xl">
      <div className="pointer-events-none absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-cyan-400/40 to-transparent" />
      <CardHeader className="relative pl-1 md:pl-2">
        <CardTitle className="flex flex-wrap items-center gap-3 text-2xl font-bold text-white md:text-3xl">
          <span className="flex size-11 items-center justify-center rounded-xl border border-cyan-500/25 bg-cyan-500/10 shadow-[0_0_24px_-4px_rgba(34,211,238,0.35)]">
            <Cpu className="size-6 text-cyan-300" aria-hidden />
          </span>
          Agent activity mesh
        </CardTitle>
        <CardDescription className="mt-2 max-w-2xl text-base text-zinc-400">
          Live-ish status rotation for the swarm bound to your last launch —
          tuned to feel like a trading floor.
        </CardDescription>
      </CardHeader>
      <CardContent className="relative space-y-4 pl-1 md:pl-2">
        {agents.length === 0 ? (
          <p className="rounded-2xl border border-white/10 bg-black/40 p-6 text-sm text-zinc-400">
            No agents yet. Run a launch from the creator console to populate
            this feed.
          </p>
        ) : (
          <ul className="space-y-4">
            {agents.map((agent, i) => (
              <li
                key={agent.id}
                className="group relative overflow-hidden rounded-2xl border border-white/[0.1] bg-black/45 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition hover:border-violet-400/25 hover:shadow-[0_0_40px_-16px_rgba(139,92,246,0.25)]"
              >
                <div className="absolute right-4 top-4 flex items-center gap-1.5">
                  <span className="relative flex size-2.5">
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400/50 opacity-75" />
                    <span className="relative inline-flex size-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399]" />
                  </span>
                  <Badge className="border-0 bg-emerald-500/20 text-[10px] font-bold uppercase tracking-wider text-emerald-100">
                    Live
                  </Badge>
                </div>
                <div className="flex flex-wrap items-center gap-2 pr-24">
                  <Sparkles className="size-4 text-violet-400" aria-hidden />
                  <p className="text-lg font-semibold text-white">{agent.name}</p>
                  <Badge
                    variant="secondary"
                    className="border border-white/10 bg-white/5 capitalize text-zinc-200"
                  >
                    {agent.lane}
                  </Badge>
                </div>
                <p className="mt-2 text-sm text-zinc-400 md:text-base">
                  {agent.mandate}
                </p>
                <div className="mt-4 rounded-xl border border-cyan-500/20 bg-cyan-950/20 px-4 py-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-300/80">
                    Stream
                  </p>
                  <p className="mt-1 font-mono text-sm font-medium text-cyan-100/95 md:text-base">
                    {activities[i]}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
