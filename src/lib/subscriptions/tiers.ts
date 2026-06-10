export type SubscriptionTier = "free" | "pro" | "elite" | "empire";

export type EmpireFeature =
  | "unlimited_businesses"
  | "priority_agents"
  | "advanced_marketing"
  | "ai_ceo"
  | "auto_social"
  | "competitor_spy"
  | "one_click_clone"
  | "daily_coach"
  | "marketplace_buy"
  | "marketplace_sell"
  | "leaderboard"
  | "white_label"
  | "team_accounts"
  | "api_access"
  | "priority_fulfillment"
  | "support_247";

export type TierDefinition = {
  id: SubscriptionTier;
  name: string;
  priceZar: number;
  priceLabel: string;
  tagline: string;
  features: string[];
  highlighted?: boolean;
  badge?: string;
  features_unlocked: EmpireFeature[];
};

export const SUBSCRIPTION_TIERS: TierDefinition[] = [
  {
    id: "free",
    name: "Starter",
    priceZar: 0,
    priceLabel: "R0",
    tagline: "Taste the power of AI business creation",
    features: [
      "1 AI business launch",
      "3 agent generations / day",
      "Basic revenue dashboard",
      "PayFast & Paystack checkout",
    ],
    features_unlocked: ["leaderboard"],
  },
  {
    id: "pro",
    name: "Pro",
    priceZar: 299,
    priceLabel: "R299/mo",
    tagline: "Scale like a serious operator",
    highlighted: true,
    badge: "Most popular",
    features: [
      "Unlimited AI businesses",
      "Priority agent orchestration",
      "Advanced marketing tools",
      "Agent marketplace (buy)",
      "One-click business clone",
      "Daily AI business coach",
    ],
    features_unlocked: [
      "unlimited_businesses",
      "priority_agents",
      "advanced_marketing",
      "marketplace_buy",
      "one_click_clone",
      "daily_coach",
      "leaderboard",
    ],
  },
  {
    id: "elite",
    name: "Elite",
    priceZar: 999,
    priceLabel: "R999/mo",
    tagline: "Your dedicated AI executive team",
    badge: "High performer",
    features: [
      "Everything in Pro",
      "Dedicated AI CEO agent",
      "Auto social media posting (FB, IG, TikTok, X)",
      "Smart Competitor Spy",
      "Sell custom agents on marketplace",
      "24/7 priority support",
    ],
    features_unlocked: [
      "unlimited_businesses",
      "priority_agents",
      "advanced_marketing",
      "ai_ceo",
      "auto_social",
      "competitor_spy",
      "marketplace_buy",
      "marketplace_sell",
      "one_click_clone",
      "daily_coach",
      "leaderboard",
      "support_247",
    ],
  },
  {
    id: "empire",
    name: "Empire",
    priceZar: 2999,
    priceLabel: "R2,999/mo",
    tagline: "Full white-label AI business infrastructure",
    badge: "Ultimate",
    features: [
      "Everything in Elite",
      "Full white-label branding",
      "Team accounts (up to 10 seats)",
      "API access & webhooks",
      "Priority Printful fulfillment",
      "Dedicated success manager",
    ],
    features_unlocked: [
      "unlimited_businesses",
      "priority_agents",
      "advanced_marketing",
      "ai_ceo",
      "auto_social",
      "competitor_spy",
      "marketplace_buy",
      "marketplace_sell",
      "one_click_clone",
      "daily_coach",
      "leaderboard",
      "white_label",
      "team_accounts",
      "api_access",
      "priority_fulfillment",
      "support_247",
    ],
  },
];

const TIER_RANK: Record<SubscriptionTier, number> = {
  free: 0,
  pro: 1,
  elite: 2,
  empire: 3,
};

export function getTierDefinition(tier: SubscriptionTier): TierDefinition {
  return SUBSCRIPTION_TIERS.find((t) => t.id === tier) ?? SUBSCRIPTION_TIERS[0];
}

export function tierRank(tier: SubscriptionTier): number {
  return TIER_RANK[tier] ?? 0;
}

export function tierHasFeature(tier: SubscriptionTier, feature: EmpireFeature): boolean {
  const def = getTierDefinition(tier);
  return def.features_unlocked.includes(feature);
}

export function tierAgentGenerationLimit(tier: SubscriptionTier): number {
  if (tier === "free") return 3;
  return Infinity;
}

export function tierBusinessLimit(tier: SubscriptionTier): number {
  if (tier === "free") return 1;
  return Infinity;
}
