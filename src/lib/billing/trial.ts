import type { DbUser } from "@/lib/db/local-db";
import type { SubscriptionTier } from "@/lib/subscriptions/tiers";

export const TRIAL_DAYS = 10;
export const TRIAL_TIER: SubscriptionTier = "pro";

export type SubscriptionStatus = "trial" | "active" | "cancelled" | "free";

export type BillingSnapshot = {
  effectiveTier: SubscriptionTier;
  paidTier: SubscriptionTier | null;
  status: SubscriptionStatus;
  isOnTrial: boolean;
  trialDaysRemaining: number;
  trialEndsAt: string | null;
  trialStartedAt: string | null;
  cancelAtPeriodEnd: boolean;
  cancelEffectiveAt: string | null;
};

function addDays(iso: string, days: number): string {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

export function trialEndFromStart(startedAt: string): string {
  return addDays(startedAt, TRIAL_DAYS);
}

export function daysBetween(from: Date, to: Date): number {
  return Math.max(0, Math.ceil((to.getTime() - from.getTime()) / 86_400_000));
}

export function resolveBillingSnapshot(user: DbUser, now = new Date()): BillingSnapshot {
  const status = user.subscriptionStatus ?? "free";
  const trialEndsAt = user.trialEndsAt ?? null;
  const trialStartedAt = user.trialStartedAt ?? null;
  const paidTier = user.paidTier ?? null;
  const cancelAtPeriodEnd = Boolean(user.cancelAtPeriodEnd);
  const cancelEffectiveAt = user.cancelAtPeriodEnd ? (user.cancelEffectiveAt ?? null) : null;

  let effectiveTier: SubscriptionTier = user.subscriptionTier ?? "free";
  let isOnTrial = false;
  let trialDaysRemaining = 0;
  let resolvedStatus: SubscriptionStatus = status;

  if (status === "trial" && trialEndsAt) {
    const end = new Date(trialEndsAt);
    if (now >= end) {
      resolvedStatus = "free";
      effectiveTier = "free";
    } else {
      isOnTrial = true;
      effectiveTier = TRIAL_TIER;
      trialDaysRemaining = daysBetween(now, end);
      resolvedStatus = "trial";
    }
  } else if (status === "active") {
    effectiveTier = paidTier ?? user.subscriptionTier ?? "free";
    if (cancelAtPeriodEnd && cancelEffectiveAt) {
      const cancelDate = new Date(cancelEffectiveAt);
      if (now >= cancelDate) {
        resolvedStatus = "free";
        effectiveTier = "free";
      } else {
        resolvedStatus = "cancelled";
      }
    } else {
      resolvedStatus = "active";
    }
  } else {
    resolvedStatus = "free";
    effectiveTier = "free";
  }

  return {
    effectiveTier,
    paidTier,
    status: resolvedStatus,
    isOnTrial,
    trialDaysRemaining,
    trialEndsAt,
    trialStartedAt,
    cancelAtPeriodEnd,
    cancelEffectiveAt,
  };
}

export function shouldSendTrialReminder(user: DbUser, now = new Date()): boolean {
  if (user.subscriptionStatus !== "trial" || !user.trialEndsAt) return false;
  if (user.emailNotifications?.trialReminderSent) return false;
  const end = new Date(user.trialEndsAt);
  const daysLeft = daysBetween(now, end);
  return daysLeft <= 2 && daysLeft > 0 && now < end;
}

export function shouldSendTrialEnded(user: DbUser, now = new Date()): boolean {
  if (!user.trialEndsAt) return false;
  if (user.emailNotifications?.trialEndedSent) return false;
  if (user.subscriptionStatus !== "trial") return false;
  return now >= new Date(user.trialEndsAt);
}

export function billingPeriodEnd(now = new Date()): string {
  const d = new Date(now);
  d.setDate(d.getDate() + 30);
  return d.toISOString();
}
