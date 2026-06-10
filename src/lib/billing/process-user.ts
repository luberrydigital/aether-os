import type { DbUser } from "@/lib/db/local-db";
import {
  billingPeriodEnd,
  resolveBillingSnapshot,
  shouldSendTrialEnded,
  shouldSendTrialReminder,
  type BillingSnapshot,
} from "@/lib/billing/trial";
import { sendEmail } from "@/lib/email/send";
import {
  trialEndedEmail,
  trialEndingSoonEmail,
  welcomeTrialEmail,
} from "@/lib/email/templates";
import type { SubscriptionTier } from "@/lib/subscriptions/tiers";

export type ProcessedUser = {
  user: DbUser;
  billing: BillingSnapshot;
  changed: boolean;
};

function applyBillingResolution(user: DbUser, billing: BillingSnapshot): boolean {
  let changed = false;

  if (user.subscriptionTier !== billing.effectiveTier) {
    user.subscriptionTier = billing.effectiveTier;
    changed = true;
  }
  if (user.subscriptionStatus !== billing.status) {
    user.subscriptionStatus = billing.status;
    changed = true;
  }
  if (billing.effectiveTier === "free" && user.paidTier) {
    user.paidTier = null;
    changed = true;
  }
  if (billing.effectiveTier === "free" && user.cancelAtPeriodEnd) {
    user.cancelAtPeriodEnd = false;
    user.cancelEffectiveAt = null;
    changed = true;
  }

  return changed;
}

async function sendBillingEmails(user: DbUser): Promise<boolean> {
  let changed = false;
  const notifications = { ...(user.emailNotifications ?? {}) };

  if (user.subscriptionStatus === "trial" && !notifications.welcomeSent && user.trialEndsAt) {
    const { subject, html } = welcomeTrialEmail({
      email: user.email,
      trialEndsAt: user.trialEndsAt,
    });
    const result = await sendEmail({ to: user.email, subject, html });
    if (result.ok) {
      notifications.welcomeSent = true;
      changed = true;
    }
  }

  if (shouldSendTrialReminder(user)) {
    const billing = resolveBillingSnapshot(user);
    const { subject, html } = trialEndingSoonEmail({
      daysRemaining: billing.trialDaysRemaining,
      trialEndsAt: user.trialEndsAt!,
    });
    const result = await sendEmail({ to: user.email, subject, html });
    if (result.ok) {
      notifications.trialReminderSent = true;
      changed = true;
    }
  }

  if (shouldSendTrialEnded(user)) {
    const { subject, html } = trialEndedEmail();
    const result = await sendEmail({ to: user.email, subject, html });
    if (result.ok) {
      notifications.trialEndedSent = true;
      changed = true;
    }
  }

  if (changed) {
    user.emailNotifications = notifications;
  }
  return changed;
}

/**
 * Resolves trial expiry / cancellation, syncs tier, and sends due lifecycle emails.
 */
export async function processUserBilling(user: DbUser): Promise<ProcessedUser> {
  const working = { ...user };
  let changed = false;

  const emailChanged = await sendBillingEmails(working);
  changed = changed || emailChanged;

  let billing = resolveBillingSnapshot(working);
  const tierChanged = applyBillingResolution(working, billing);
  changed = changed || tierChanged;

  billing = resolveBillingSnapshot(working);

  return { user: working, billing, changed };
}

export function startProTrialFields(now = new Date()): Partial<DbUser> {
  const started = now.toISOString();
  const ends = new Date(now);
  ends.setDate(ends.getDate() + 10);
  return {
    subscriptionTier: "pro",
    subscriptionStatus: "trial",
    trialStartedAt: started,
    trialEndsAt: ends.toISOString(),
    paidTier: null,
    cancelAtPeriodEnd: false,
    cancelEffectiveAt: null,
    emailNotifications: {},
  };
}

export function activatePaidPlan(tier: SubscriptionTier): Partial<DbUser> {
  return {
    subscriptionTier: tier,
    subscriptionStatus: "active",
    paidTier: tier,
    trialStartedAt: null,
    trialEndsAt: null,
    cancelAtPeriodEnd: false,
    cancelEffectiveAt: null,
  };
}

export function cancelTrialNow(): Partial<DbUser> {
  return {
    subscriptionTier: "free",
    subscriptionStatus: "free",
    trialStartedAt: null,
    trialEndsAt: null,
    paidTier: null,
    cancelAtPeriodEnd: false,
    cancelEffectiveAt: null,
  };
}

export function scheduleCancellation(now = new Date()): Partial<DbUser> {
  return {
    cancelAtPeriodEnd: true,
    cancelEffectiveAt: billingPeriodEnd(now),
    subscriptionStatus: "cancelled",
  };
}
