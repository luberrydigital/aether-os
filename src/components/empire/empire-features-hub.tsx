"use client";

import { useEffect, useState } from "react";
import {
  Brain,
  Copy,
  Crown,
  Eye,
  Loader2,
  Lock,
  Share2,
  ShoppingBag,
  Sparkles,
  Trophy,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/premium/glass-card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { MarketplaceAgent } from "@/lib/empire/marketplace";
import type { CompetitorReport, CoachInsight } from "@/lib/empire/intelligence";
import type { LeaderboardEntry } from "@/lib/empire/leaderboard";

type Props = { businessName?: string | null; tier?: string };

const FEATURE_GATES: Record<string, string> = {
  marketplace: "pro",
  clone: "pro",
  coach: "pro",
  social: "elite",
  competitor: "elite",
};

function tierMeets(current: string, required: string): boolean {
  const ranks: Record<string, number> = { free: 0, pro: 1, elite: 2, empire: 3 };
  return (ranks[current] ?? 0) >= (ranks[required] ?? 99);
}

export function EmpireFeaturesHub({ businessName, tier = "free" }: Props) {
  const [marketplace, setMarketplace] = useState<{
    agents: MarketplaceAgent[];
    ownedAgentIds: string[];
    canBuy: boolean;
  } | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [coach, setCoach] = useState<CoachInsight | null>(null);
  const [competitor, setCompetitor] = useState("");
  const [report, setReport] = useState<CompetitorReport | null>(null);
  const [socialPosts, setSocialPosts] = useState<
    Array<{ platform: string; content: string; status: string; scheduled_at: string }>
  >([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    void Promise.all([
      fetch("/api/empire/marketplace").then((r) => r.json()),
      fetch("/api/empire/leaderboard").then((r) => r.json()),
    ]).then(([mp, lb]) => {
      setMarketplace(mp as typeof marketplace);
      setLeaderboard((lb as { entries: LeaderboardEntry[] }).entries ?? []);
    });
  }, []);

  async function buyAgent(agentId: string) {
    setBusy(`buy-${agentId}`);
    setMessage(null);
    const res = await fetch("/api/empire/marketplace", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ agentId }),
    });
    const json = (await res.json()) as { error?: string; message?: string };
    setMessage(json.message ?? json.error ?? "Done");
    if (res.ok) {
      const mp = await fetch("/api/empire/marketplace").then((r) => r.json());
      setMarketplace(mp as typeof marketplace);
    }
    setBusy(null);
  }

  async function runClone() {
    setBusy("clone");
    const res = await fetch("/api/empire/clone", { method: "POST" });
    const json = (await res.json()) as { error?: string; message?: string };
    setMessage(json.message ?? json.error ?? "Done");
    setBusy(null);
  }

  async function loadCoach() {
    setBusy("coach");
    const res = await fetch("/api/empire/coach");
    const json = (await res.json()) as { error?: string; insight?: CoachInsight };
    if (json.insight) setCoach(json.insight);
    else setMessage(json.error ?? "Coach unavailable");
    setBusy(null);
  }

  async function runCompetitorSpy() {
    if (!competitor.trim()) return;
    setBusy("competitor");
    const res = await fetch("/api/empire/competitor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ competitor }),
    });
    const json = (await res.json()) as { error?: string; report?: CompetitorReport };
    if (json.report) setReport(json.report);
    else setMessage(json.error ?? "Analysis failed");
    setBusy(null);
  }

  async function scheduleSocial() {
    setBusy("social");
    const res = await fetch("/api/empire/social", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ businessName }),
    });
    const json = (await res.json()) as {
      error?: string;
      message?: string;
      posts?: typeof socialPosts;
    };
    setMessage(json.message ?? json.error ?? "Done");
    if (json.posts) setSocialPosts(json.posts);
    setBusy(null);
  }

  const zar = new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    maximumFractionDigits: 0,
  });

  return (
    <div className="space-y-8">
      {message ? (
        <GlassCard className="border-amber-500/25 bg-amber-950/20 p-4" neon>
          <p className="text-sm text-amber-100">{message}</p>
        </GlassCard>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Agent Marketplace */}
        <GlassCard className="p-6" glow neon>
          <div className="mb-4 flex items-center gap-3">
            <ShoppingBag className="size-6 text-amber-400" />
            <h3 className="text-xl font-bold text-white">AI Agent Marketplace</h3>
            {!tierMeets(tier, FEATURE_GATES.marketplace) ? (
              <Badge variant="outline" className="border-amber-500/30 text-amber-200">
                <Lock className="mr-1 size-3" /> Pro+
              </Badge>
            ) : null}
          </div>
          <p className="mb-4 text-sm text-zinc-400">
            Buy battle-tested agents from top operators. Deploy in one click.
          </p>
          <div className="max-h-72 space-y-3 overflow-y-auto">
            {(marketplace?.agents ?? []).slice(0, 4).map((agent) => {
              const owned = marketplace?.ownedAgentIds?.includes(agent.id);
              return (
                <div
                  key={agent.id}
                  className="rounded-xl border border-white/8 bg-black/40 p-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-white">{agent.name}</p>
                      <p className="text-xs text-zinc-500">{agent.creator} · ⭐ {agent.rating}</p>
                    </div>
                    <span className="font-mono text-sm font-bold text-amber-300">
                      R{agent.priceZar}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-zinc-400 line-clamp-2">{agent.description}</p>
                  <Button
                    size="sm"
                    disabled={owned || busy !== null || !marketplace?.canBuy}
                    onClick={() => void buyAgent(agent.id)}
                    className="mt-3 rounded-lg bg-amber-500/20 text-amber-100 hover:bg-amber-500/30"
                    variant="outline"
                  >
                    {owned ? "Owned" : busy === `buy-${agent.id}` ? "Deploying…" : "Deploy Agent"}
                  </Button>
                </div>
              );
            })}
          </div>
        </GlassCard>

        {/* Leaderboard */}
        <GlassCard className="p-6" glow>
          <div className="mb-4 flex items-center gap-3">
            <Trophy className="size-6 text-amber-400" />
            <h3 className="text-xl font-bold text-white">Success Leaderboard</h3>
          </div>
          <div className="space-y-2">
            {leaderboard.slice(0, 8).map((entry) => (
              <div
                key={entry.rank}
                className={cn(
                  "flex items-center justify-between rounded-xl border px-4 py-3",
                  entry.isYou
                    ? "border-amber-400/40 bg-amber-950/30"
                    : "border-white/8 bg-black/30"
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm font-bold text-amber-400">
                    #{entry.rank}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-white">{entry.alias}</p>
                    <p className="text-xs text-zinc-500">
                      {entry.businesses} businesses · {entry.growth}
                    </p>
                  </div>
                </div>
                <span className="font-mono text-sm font-bold text-emerald-300">
                  {zar.format(entry.earningsZar)}
                </span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* One-Click Clone */}
        <GlassCard className="p-6" neon>
          <Copy className="mb-3 size-6 text-amber-400" />
          <h3 className="text-lg font-bold text-white">One-Click Clone</h3>
          <p className="mt-2 text-sm text-zinc-400">
            Duplicate your most successful business instantly.
          </p>
          <Button
            className="mt-4 w-full rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black"
            disabled={busy !== null || !tierMeets(tier, FEATURE_GATES.clone)}
            onClick={() => void runClone()}
          >
            {busy === "clone" ? <Loader2 className="animate-spin" /> : "Clone Business"}
          </Button>
        </GlassCard>

        {/* Daily Coach */}
        <GlassCard className="p-6" neon>
          <Brain className="mb-3 size-6 text-amber-400" />
          <h3 className="text-lg font-bold text-white">AI Business Coach</h3>
          <p className="mt-2 text-sm text-zinc-400">
            Personalized daily insights to maximize revenue.
          </p>
          <Button
            className="mt-4 w-full rounded-xl border-amber-500/30 text-amber-100"
            variant="outline"
            disabled={busy !== null || !tierMeets(tier, FEATURE_GATES.coach)}
            onClick={() => void loadCoach()}
          >
            {busy === "coach" ? "Loading…" : "Get Today&apos;s Insights"}
          </Button>
        </GlassCard>

        {/* Auto Social */}
        <GlassCard className="p-6" neon>
          <Share2 className="mb-3 size-6 text-amber-400" />
          <h3 className="text-lg font-bold text-white">Auto Social Manager</h3>
          <p className="mt-2 text-sm text-zinc-400">
            FB, Instagram, TikTok, X — posted automatically.
          </p>
          <Button
            className="mt-4 w-full rounded-xl border-amber-500/30 text-amber-100"
            variant="outline"
            disabled={busy !== null || !tierMeets(tier, FEATURE_GATES.social)}
            onClick={() => void scheduleSocial()}
          >
            {busy === "social" ? "Scheduling…" : "Schedule 4 Posts"}
          </Button>
        </GlassCard>
      </div>

      {coach ? (
        <GlassCard className="p-6" glow neon>
          <div className="flex items-center gap-3">
            <Sparkles className="size-5 text-amber-400" />
            <h3 className="text-lg font-bold text-amber-200">{coach.headline}</h3>
          </div>
          <ul className="mt-4 space-y-2">
            {coach.insights.map((i) => (
              <li key={i} className="text-sm text-zinc-300">• {i}</li>
            ))}
          </ul>
          <p className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-3 text-sm text-emerald-200">
            {coach.revenue_opportunity}
          </p>
          <p className="mt-3 text-sm italic text-amber-200/80">{coach.motivational}</p>
        </GlassCard>
      ) : null}

      {/* Competitor Spy */}
      <GlassCard className="p-6" glow neon>
        <div className="flex items-center gap-3">
          <Eye className="size-6 text-amber-400" />
          <h3 className="text-xl font-bold text-white">Smart Competitor Spy</h3>
          {!tierMeets(tier, FEATURE_GATES.competitor) ? (
            <Badge variant="outline" className="border-amber-500/30 text-amber-200">
              <Crown className="mr-1 size-3" /> Elite+
            </Badge>
          ) : null}
        </div>
        <div className="mt-4 flex gap-3">
          <Input
            value={competitor}
            onChange={(e) => setCompetitor(e.target.value)}
            placeholder="Enter competitor name…"
            className="border-white/10 bg-black/40"
          />
          <Button
            onClick={() => void runCompetitorSpy()}
            disabled={busy !== null || !tierMeets(tier, FEATURE_GATES.competitor)}
            className="shrink-0 bg-amber-500 text-black hover:bg-amber-400"
          >
            {busy === "competitor" ? "Analyzing…" : "Analyze"}
          </Button>
        </div>
        {report ? (
          <div className="mt-6 space-y-4">
            <Badge
              className={cn(
                report.threat_level === "high" && "bg-red-500/20 text-red-200",
                report.threat_level === "medium" && "bg-amber-500/20 text-amber-200",
                report.threat_level === "low" && "bg-emerald-500/20 text-emerald-200"
              )}
            >
              Threat: {report.threat_level}
            </Badge>
            <p className="text-sm text-zinc-300">{report.summary}</p>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-xs font-bold uppercase text-zinc-500">Winning moves</p>
                <ul className="mt-2 space-y-1">
                  {report.winning_moves.map((m) => (
                    <li key={m} className="text-sm text-emerald-200">→ {m}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs font-bold uppercase text-zinc-500">Their weaknesses</p>
                <ul className="mt-2 space-y-1">
                  {report.weaknesses.map((w) => (
                    <li key={w} className="text-sm text-red-200/80">✗ {w}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ) : null}
      </GlassCard>

      {socialPosts.length > 0 ? (
        <GlassCard className="p-6" glow>
          <h3 className="mb-4 text-lg font-bold text-white">Scheduled social posts</h3>
          <div className="space-y-3">
            {socialPosts.map((p, i) => (
              <div key={i} className="rounded-xl border border-white/8 bg-black/30 p-4">
                <Badge className="mb-2 capitalize">{p.platform}</Badge>
                <p className="text-sm text-zinc-300 whitespace-pre-wrap">{p.content}</p>
                <p className="mt-2 text-xs text-zinc-500">
                  {p.status} · {new Date(p.scheduled_at).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </GlassCard>
      ) : null}
    </div>
  );
}
