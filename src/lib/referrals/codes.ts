import crypto from "crypto";

export function generateReferralCode(userId: string): string {
  const hash = crypto.createHash("sha256").update(userId).digest("hex");
  return `LUB${hash.slice(0, 6).toUpperCase()}`;
}

/** 25% of referred users' subscription fees — for life */
export const REFERRAL_SUBSCRIPTION_COMMISSION_RATE = 0.25;

/** Legacy platform-fee commission (deprecated, kept for existing earnings) */
export const REFERRAL_PLATFORM_COMMISSION_RATE = 0.1;
