"use client";

import Link from "next/link";
import { Clock, Sparkles, X } from "lucide-react";
import { useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  daysRemaining: number;
  trialEndsAt: string | null;
  onCancelTrial?: () => void;
  cancelling?: boolean;
};

export function TrialBanner({
  daysRemaining,
  trialEndsAt,
  onCancelTrial,
  cancelling,
}: Props) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  const endLabel = trialEndsAt
    ? new Date(trialEndsAt).toLocaleDateString("en-ZA", {
        month: "short",
        day: "numeric",
      })
    : null;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-950/50 via-amber-900/30 to-black/50 px-5 py-4 backdrop-blur-xl">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_left,rgba(212,175,55,0.12),transparent_60%)]" />
      <div className="relative flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-amber-500/30 bg-amber-500/15">
            <Sparkles className="size-5 text-amber-300" aria-hidden />
          </span>
          <div>
            <p className="font-semibold text-amber-100">
              Pro trial active — {daysRemaining} day{daysRemaining === 1 ? "" : "s"} left
            </p>
            <p className="mt-0.5 flex items-center gap-1.5 text-sm text-zinc-400">
              <Clock className="size-3.5" aria-hidden />
              {endLabel ? `Ends ${endLabel}` : "Full Pro access"} · Cancel anytime, no charge
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/settings/billing"
            className={cn(
              buttonVariants({ size: "sm" }),
              "rounded-lg bg-amber-500 text-black hover:bg-amber-400"
            )}
          >
            Upgrade to keep Pro
          </Link>
          {onCancelTrial ? (
            <button
              type="button"
              onClick={onCancelTrial}
              disabled={cancelling}
              className="rounded-lg border border-white/15 px-3 py-1.5 text-xs text-zinc-400 transition hover:text-white"
            >
              {cancelling ? "Cancelling…" : "Cancel trial"}
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="rounded-lg p-1.5 text-zinc-500 hover:bg-white/5 hover:text-white"
            aria-label="Dismiss"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
