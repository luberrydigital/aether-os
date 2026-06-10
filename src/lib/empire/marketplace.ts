export type MarketplaceAgent = {
  id: string;
  name: string;
  creator: string;
  lane: string;
  description: string;
  priceZar: number;
  rating: number;
  sales: number;
  badge?: string;
  tier_required: "pro" | "elite" | "empire";
};

export const MARKETPLACE_CATALOG: MarketplaceAgent[] = [
  {
    id: "agent-viral-growth",
    name: "Viral Growth Hacker",
    creator: "Luberry Labs",
    lane: "Growth",
    description: "Generates viral hooks, A/B test variants, and paid social creatives that convert at 3.2x industry average.",
    priceZar: 149,
    rating: 4.9,
    sales: 2840,
    badge: "Bestseller",
    tier_required: "pro",
  },
  {
    id: "agent-email-ninja",
    name: "Email Revenue Ninja",
    creator: "Marcus K.",
    lane: "Sales",
    description: "7-email sequences with 42% open rates. Trained on R12M+ in e-commerce revenue.",
    priceZar: 99,
    rating: 4.8,
    sales: 1920,
    tier_required: "pro",
  },
  {
    id: "agent-seo-beast",
    name: "SEO Domination Beast",
    creator: "Priya S.",
    lane: "Marketing",
    description: "Keyword research, meta optimization, and content clusters that rank on page 1 within 30 days.",
    priceZar: 199,
    rating: 4.9,
    sales: 1560,
    badge: "Top rated",
    tier_required: "pro",
  },
  {
    id: "agent-ceo-strategist",
    name: "AI CEO Strategist",
    creator: "Luberry Labs",
    lane: "Strategy",
    description: "Executive-level business decisions, quarterly planning, and competitive positioning. Your 24/7 board advisor.",
    priceZar: 499,
    rating: 5.0,
    sales: 890,
    badge: "Elite only",
    tier_required: "elite",
  },
  {
    id: "agent-social-auto",
    name: "Social Media Autopilot",
    creator: "Amara D.",
    lane: "Social",
    description: "Posts to Facebook, Instagram, TikTok, and X automatically. 4 platforms, 12 posts/week, zero manual work.",
    priceZar: 299,
    rating: 4.9,
    sales: 2100,
    badge: "Elite only",
    tier_required: "elite",
  },
  {
    id: "agent-competitor-spy",
    name: "Competitor Intelligence Spy",
    creator: "Luberry Labs",
    lane: "Intelligence",
    description: "Monitors competitors, extracts winning strategies, and delivers weekly battle plans to crush your market.",
    priceZar: 399,
    rating: 4.8,
    sales: 720,
    tier_required: "elite",
  },
  {
    id: "agent-fulfillment-pro",
    name: "Fulfillment Command Pro",
    creator: "Luberry Labs",
    lane: "Operations",
    description: "Priority Printful routing, inventory alerts, and shipping optimization. Empire-tier fulfillment speed.",
    priceZar: 799,
    rating: 5.0,
    sales: 340,
    badge: "Empire exclusive",
    tier_required: "empire",
  },
];
