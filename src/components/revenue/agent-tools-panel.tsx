"use client";

import { useState } from "react";
import { FileText, Loader2, Mail, Share2, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { ContentType, GeneratedContent } from "@/lib/agents/content-generator";

const TOOLS: { type: ContentType; label: string; icon: typeof Share2; desc: string }[] = [
  {
    type: "social",
    label: "Social posts",
    icon: Share2,
    desc: "5 platform-ready posts for LinkedIn, X, and Instagram",
  },
  {
    type: "email",
    label: "Email sequence",
    icon: Mail,
    desc: "5-email welcome-to-conversion nurture flow",
  },
  {
    type: "product",
    label: "Product copy",
    icon: FileText,
    desc: "Full descriptions, SEO, and bullet points",
  },
];

type Props = {
  businessName?: string | null;
};

export function AgentToolsPanel({ businessName }: Props) {
  const [context, setContext] = useState(
    businessName
      ? `AI-powered ${businessName} helping entrepreneurs launch and scale revenue-generating businesses.`
      : "AI business platform for entrepreneurs who want to launch revenue-generating companies in minutes."
  );
  const [activeType, setActiveType] = useState<ContentType | null>(null);
  const [result, setResult] = useState<GeneratedContent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [usage, setUsage] = useState<{ count: number; limit: number | null } | null>(null);

  async function generate(type: ContentType) {
    setActiveType(type);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/agents/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, context, businessName: businessName ?? undefined }),
      });
      const json = (await res.json()) as {
        error?: string;
        content?: GeneratedContent;
        usage?: { count: number; limit: number | null };
      };
      if (!res.ok) {
        setError(json.error ?? "Generation failed.");
        return;
      }
      setResult(json.content ?? null);
      if (json.usage) setUsage(json.usage);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed.");
    } finally {
      setActiveType(null);
    }
  }

  return (
    <Card className="relative overflow-hidden border-amber-500/20 bg-gradient-to-br from-zinc-950/80 via-black/60 to-amber-950/20 backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-2xl font-bold text-white">
          <span className="flex size-11 items-center justify-center rounded-xl border border-amber-500/25 bg-amber-500/10">
            <Sparkles className="size-6 text-amber-300" aria-hidden />
          </span>
          AI agent tools
        </CardTitle>
        <CardDescription className="max-w-2xl text-zinc-400">
          Generate real marketing assets — social posts, email sequences, and product
          descriptions powered by Luberry AI agents.
        </CardDescription>
        {usage ? (
          <Badge variant="outline" className="w-fit border-amber-500/30 text-amber-200">
            {usage.limit
              ? `${usage.count}/${usage.limit} generations today`
              : "Unlimited generations"}
          </Badge>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
            Business context
          </label>
          <Textarea
            value={context}
            onChange={(e) => setContext(e.target.value)}
            rows={3}
            className="mt-2 border-white/10 bg-black/40 text-zinc-200"
            placeholder="Describe your business, audience, and value proposition…"
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {TOOLS.map((tool) => {
            const Icon = tool.icon;
            const busy = activeType === tool.type;
            return (
              <button
                key={tool.type}
                type="button"
                disabled={busy || activeType !== null}
                onClick={() => void generate(tool.type)}
                className={cn(
                  "group rounded-2xl border border-white/10 bg-black/40 p-5 text-left transition hover:border-amber-500/35 hover:bg-amber-950/20",
                  busy && "border-amber-500/40 ring-2 ring-amber-400/30"
                )}
              >
                <div className="flex items-center gap-3">
                  {busy ? (
                    <Loader2 className="size-5 animate-spin text-amber-400" aria-hidden />
                  ) : (
                    <Icon className="size-5 text-amber-400" aria-hidden />
                  )}
                  <span className="font-semibold text-white">{tool.label}</span>
                </div>
                <p className="mt-2 text-sm text-zinc-500">{tool.desc}</p>
              </button>
            );
          })}
        </div>

        {error ? (
          <p className="rounded-xl border border-red-500/30 bg-red-950/20 px-4 py-3 text-sm text-red-200">
            {error}
          </p>
        ) : null}

        {result ? (
          <div className="rounded-2xl border border-amber-500/20 bg-black/50 p-5">
            {result.subject ? (
              <p className="mb-3 text-sm font-semibold text-amber-200">
                Subject: {result.subject}
              </p>
            ) : null}
            {result.preview ? (
              <p className="mb-4 text-sm text-zinc-400">{result.preview}</p>
            ) : null}
            <div className="max-h-96 space-y-4 overflow-y-auto">
              {result.items.map((item, i) => (
                <pre
                  key={i}
                  className="whitespace-pre-wrap rounded-xl border border-white/8 bg-zinc-950/80 p-4 font-sans text-sm leading-relaxed text-zinc-300"
                >
                  {item}
                </pre>
              ))}
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
