"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Building2,
  DollarSign,
  Mic,
  MicOff,
  Sparkles,
  Users,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { CreatorBlueprint } from "@/lib/creator/types";

type LaunchResponse = {
  blueprint?: CreatorBlueprint;
  agents?: unknown;
  narrative?: string;
  error?: string;
};

/** Minimal surface for Web Speech API (types vary by TS `lib` / browser). */
type BrowserSpeechRecognition = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: ((event: { results: Iterable<{ 0: { transcript: string } }> }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
};

function formatMoney(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

export function CreatorDashboard() {
  const [sentence, setSentence] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [voiceHint, setVoiceHint] = useState<string | null>(null);
  const [voicePulse, setVoicePulse] = useState(0);
  const [blueprint, setBlueprint] = useState<CreatorBlueprint | null>(null);
  const resultsRef = useRef<HTMLDivElement | null>(null);
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);

  useEffect(() => {
    if (blueprint && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [blueprint]);

  useEffect(() => {
    return () => {
      try {
        recognitionRef.current?.stop();
      } catch {
        /* ignore */
      }
    };
  }, []);

  const stopListening = useCallback(() => {
    try {
      recognitionRef.current?.stop();
    } catch {
      /* ignore */
    }
    recognitionRef.current = null;
    setListening(false);
  }, []);

  const toggleVoice = useCallback(() => {
    setVoiceHint(null);
    if (listening) {
      stopListening();
      return;
    }

    if (typeof window === "undefined") return;

    const win = window as Window & {
      webkitSpeechRecognition?: new () => BrowserSpeechRecognition;
      SpeechRecognition?: new () => BrowserSpeechRecognition;
    };

    const Ctor = win.webkitSpeechRecognition ?? win.SpeechRecognition;
    if (!Ctor) {
      setVoiceHint("Voice dictation works best in Chrome or Edge on desktop.");
      return;
    }

    const rec = new Ctor() as BrowserSpeechRecognition;
    recognitionRef.current = rec;
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = "en-US";

    rec.onresult = (event: { results: Iterable<{ 0: { transcript: string } }> }) => {
      const transcript = Array.from(event.results)
        .map((r) => r[0]?.transcript ?? "")
        .join(" ")
        .trim();
      if (transcript) {
        setSentence((prev) =>
          [prev.trim(), transcript].filter(Boolean).join(" ").trim()
        );
      }
    };

    rec.onerror = () => {
      setVoiceHint("Could not capture audio. Check the microphone permission.");
      stopListening();
    };

    rec.onend = () => {
      setListening(false);
      recognitionRef.current = null;
    };

    try {
      rec.start();
      setListening(true);
    } catch {
      setVoiceHint("Unable to start voice capture on this device.");
      setListening(false);
    }
  }, [listening, stopListening]);

  useEffect(() => {
    if (!listening) return;
    const id = window.setInterval(() => setVoicePulse((p) => p + 1), 350);
    return () => window.clearInterval(id);
  }, [listening]);

  async function onLaunch(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBlueprint(null);
    setLoading(true);
    try {
      const res = await fetch("/api/launch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sentence }),
      });
      const data = (await res.json()) as LaunchResponse;
      if (!res.ok) {
        throw new Error(data.error ?? "Launch failed");
      }
      if (data.blueprint) {
        setBlueprint(data.blueprint);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Launch failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-[2rem] border border-white/[0.06] bg-[linear-gradient(145deg,oklch(0.22_0.06_280_/_0.5),oklch(0.14_0.04_260_/_0.9)_45%,oklch(0.12_0.02_240_/_0.95))] shadow-[0_0_120px_-40px_oklch(0.55_0.2_280)]" />

      <form
        onSubmit={onLaunch}
        className="relative mx-auto flex max-w-3xl flex-col gap-8 px-1 py-2 md:px-4 md:py-6"
      >
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/25 bg-violet-500/10 px-4 py-1 text-xs font-medium uppercase tracking-[0.2em] text-violet-200/90">
            <Sparkles className="size-3.5" aria-hidden />
            Creator mode
          </div>
          <h2 className="mt-5 text-balance text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
            Drop one sentence. We spin up the company blueprint.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-pretty text-sm text-muted-foreground md:text-base">
            Voice or keyboard — then Aether OS synthesizes your name, story,
            autonomous agent roster, and a first-week revenue band you can take
            to investors or your team.
          </p>
        </div>

        <div className="relative">
          <Textarea
            id="creator-sentence"
            value={sentence}
            onChange={(e) => setSentence(e.target.value)}
            required
            minLength={10}
            rows={8}
            placeholder="Describe the AI business you want to launch in one sentence..."
            className="min-h-[min(52vh,420px)] resize-y rounded-2xl border-violet-500/20 bg-black/35 px-5 pb-16 pt-5 text-center text-lg leading-relaxed shadow-inner backdrop-blur-md placeholder:text-muted-foreground/70 md:text-xl md:leading-relaxed"
          />
          <div className="pointer-events-none absolute inset-x-4 bottom-4 flex items-center justify-between gap-3 md:inset-x-5">
            <p className="pointer-events-auto hidden text-xs text-muted-foreground sm:block">
              {sentence.length} characters
            </p>
            <Button
              type="button"
              variant={listening ? "destructive" : "secondary"}
              size="icon-lg"
              className={cn(
                "pointer-events-auto ml-auto size-12 rounded-full border border-white/10 shadow-lg md:size-14",
                listening &&
                  "animate-pulse border-red-400/40 bg-red-500/20 text-red-100"
              )}
              onClick={toggleVoice}
              aria-pressed={listening}
              aria-label={
                listening ? "Stop voice input" : "Start voice input"
              }
              title={
                listening ? "Stop listening" : "Speak your idea (Chrome/Edge)"
              }
            >
              {listening ? (
                <MicOff className="size-5 md:size-6" />
              ) : (
                <Mic className="size-5 md:size-6" />
              )}
            </Button>
          </div>
          {listening ? (
            <div className="pointer-events-none absolute inset-x-6 bottom-20">
              <div className="flex items-end justify-center gap-1 opacity-80">
                {Array.from({ length: 18 }).map((_, i) => {
                  const h = 6 + ((voicePulse + i * 3) % 18);
                  return (
                    <div
                      key={i}
                      className="w-1 rounded-full bg-violet-400/60"
                      style={{ height: `${h}px` }}
                    />
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>

        {voiceHint ? (
          <p className="text-center text-sm text-amber-200/90">{voiceHint}</p>
        ) : null}

        {error ? (
          <Alert
            className="border-white/10 bg-card/70 text-destructive backdrop-blur"
            variant="destructive"
          >
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <div className="flex flex-col items-center gap-4">
          <Button
            type="submit"
            disabled={loading}
            className="h-14 min-w-[min(100%,320px)] rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-violet-600 px-10 text-base font-semibold text-white shadow-[0_0_48px_-8px_rgba(167,139,250,0.75)] transition hover:brightness-110 disabled:opacity-60 md:h-16 md:text-lg"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Generating your company…
              </span>
            ) : (
              <>🚀 Launch My AI Company</>
            )}
          </Button>
          <p className="max-w-md text-center text-xs text-muted-foreground">
            Uses OpenAI when{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-[0.7rem]">
              OPENAI_API_KEY
            </code>{" "}
            is set; otherwise a fast on-device blueprint engine shapes your
            output from the sentence you provide.
          </p>
        </div>
      </form>

      {blueprint ? (
        <div
          ref={resultsRef}
          className="mt-16 space-y-8 border-t border-white/10 pt-12 opacity-100 transition-opacity duration-700"
        >
          <div className="text-center">
            <p className="text-xs font-medium uppercase tracking-[0.25em] text-emerald-300/90">
              Blueprint ready
            </p>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">
              {blueprint.businessName}
            </h3>
          </div>

          <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2">
            <Card className="border-white/10 bg-card/60 shadow-xl backdrop-blur-md md:col-span-2">
              <CardHeader className="flex flex-row items-start gap-3 space-y-0">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-violet-500/15 text-violet-200">
                  <Building2 className="size-5" aria-hidden />
                </div>
                <div>
                  <CardTitle className="text-lg">Positioning</CardTitle>
                  <CardDescription>Short description</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-pretty text-sm leading-relaxed text-muted-foreground md:text-base">
                  {blueprint.description}
                </p>
              </CardContent>
            </Card>

            <Card className="border-white/10 bg-card/60 shadow-xl backdrop-blur-md">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Users className="size-5 text-sky-300" aria-hidden />
                  <CardTitle className="text-lg">Autonomous agent team</CardTitle>
                </div>
                <CardDescription>
                  {blueprint.agentTeam.length} specialists assigned to your
                  launch
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-0">
                <ul className="divide-y divide-white/10">
                  {blueprint.agentTeam.map((agent) => (
                    <li key={agent.name} className="py-3 first:pt-0 last:pb-0">
                      <p className="font-medium text-foreground">{agent.name}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {agent.focus}
                      </p>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-white/10 bg-gradient-to-br from-emerald-950/40 to-card/80 shadow-xl backdrop-blur-md">
              <CardHeader>
                <div className="flex items-center gap-2 text-emerald-300">
                  <DollarSign className="size-5" aria-hidden />
                  <CardTitle className="text-lg">First week revenue</CardTitle>
                </div>
                <CardDescription>Mock projection band (USD)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="font-mono text-3xl font-semibold tracking-tight text-emerald-400 md:text-4xl">
                  {formatMoney(blueprint.firstWeekRevenue.low)} –{" "}
                  {formatMoney(blueprint.firstWeekRevenue.high)}
                </p>
                <p className="text-xs text-muted-foreground">
                  Synthetic range for narrative and pitch practice — replace with
                  your model or billing data when you go live.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="mx-auto flex max-w-lg flex-col items-center gap-3 text-center">
            <Separator className="bg-white/10" />
            <p className="text-sm text-muted-foreground">
              Saved to your mission log. Open the dashboard for live revenue
              mock and LangGraph operator status.
            </p>
            <Link
              href="/dashboard"
              className={cn(
                buttonVariants({ size: "lg" }),
                "w-full sm:w-auto bg-foreground text-background hover:bg-foreground/90"
              )}
            >
              Continue to Mission Control
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
