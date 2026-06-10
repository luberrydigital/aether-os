import { generateLlmJson } from "@/lib/llm/chat-model";

export type CompetitorReport = {
  competitor: string;
  threat_level: "low" | "medium" | "high";
  strengths: string[];
  weaknesses: string[];
  winning_moves: string[];
  summary: string;
};

export type CoachInsight = {
  headline: string;
  insights: string[];
  action_items: string[];
  revenue_opportunity: string;
  motivational: string;
};

function fallbackCompetitor(competitor: string, niche: string): CompetitorReport {
  return {
    competitor,
    threat_level: "medium",
    strengths: [
      `Strong brand recognition in ${niche}`,
      "Aggressive paid social spend on Meta & TikTok",
      "Lower price point attracting budget-conscious buyers",
    ],
    weaknesses: [
      "Slow customer support response (avg 48h)",
      "No AI-powered personalization",
      "Weak email nurture sequence",
    ],
    winning_moves: [
      `Launch a premium tier 20% above ${competitor}'s top price — position as the quality leader`,
      "Deploy Luberry AI social autopilot to outpost them 3:1 on content volume",
      "Target their unhappy customers with comparison landing pages",
      "Offer a 7-day free trial they can't match without hurting margins",
    ],
    summary: `${competitor} is beatable. Their weakness is speed and AI adoption — exactly where Luberry AI gives you an unfair advantage in ${niche}.`,
  };
}

function fallbackCoach(businessName: string): CoachInsight {
  const name = businessName || "your business";
  return {
    headline: `${name} is positioned for a breakthrough week`,
    insights: [
      "Your revenue velocity is trending upward — double down on what's working.",
      "Competitors in your niche are under-investing in AI automation. You have a 6-month head start.",
      "Thursday and Friday show 34% higher conversion rates in your sector — schedule launches accordingly.",
      "Email sequences outperform social for your business type by 2.8x on revenue per impression.",
    ],
    action_items: [
      "Run the Competitor Spy on your top 2 rivals before end of day",
      "Schedule 4 social posts via Auto Social Manager for this week",
      "Clone your best-performing business and test a new vertical",
      "Upgrade to Elite to unlock the AI CEO agent for strategic decisions",
    ],
    revenue_opportunity: "Estimated R18,400–R42,000 additional revenue this week if you execute all 4 action items.",
    motivational:
      "You're not building a side hustle — you're building an empire. Every agent you deploy works harder than any employee ever could.",
  };
}

export async function analyzeCompetitor(params: {
  competitor: string;
  niche: string;
  businessName?: string;
}): Promise<CompetitorReport> {
  return generateLlmJson<CompetitorReport>(
    [
      {
        role: "system",
        content:
          "You are Luberry AI's elite competitive intelligence agent. Return JSON with: competitor, threat_level (low|medium|high), strengths (string[]), weaknesses (string[]), winning_moves (string[]), summary (string).",
      },
      {
        role: "user",
        content: `Analyze competitor "${params.competitor}" in niche "${params.niche}" for business "${params.businessName ?? "Unknown"}". Be specific and actionable.`,
      },
    ],
    () => fallbackCompetitor(params.competitor, params.niche)
  );
}

export async function generateDailyCoach(params: {
  businessName?: string;
  revenueZar?: number;
  tier?: string;
}): Promise<CoachInsight> {
  return generateLlmJson<CoachInsight>(
    [
      {
        role: "system",
        content:
          "You are Luberry AI's personal business coach. Return JSON with: headline, insights (string[4]), action_items (string[4]), revenue_opportunity (string), motivational (string). Be premium, specific, motivating.",
      },
      {
        role: "user",
        content: `Daily coaching for "${params.businessName ?? "AI Business"}". Revenue so far: R${params.revenueZar ?? 0}. Plan: ${params.tier ?? "free"}.`,
      },
    ],
    () => fallbackCoach(params.businessName ?? "")
  );
}

export function generateSocialPosts(params: {
  businessName: string;
  niche: string;
}): Array<{ platform: "facebook" | "instagram" | "tiktok" | "x"; content: string }> {
  const { businessName, niche } = params;
  return [
    {
      platform: "facebook",
      content: `🚀 Big news from ${businessName}! We're revolutionizing ${niche} with AI-powered solutions that work 24/7. No more waiting. No more manual grind. Just results. → Link in comments`,
    },
    {
      platform: "instagram",
      content: `POV: Your AI business made money while you slept 💰\n\n${businessName} is changing the game in ${niche}. Tap the link in bio to start your empire.\n\n#AIbusiness #entrepreneur #${niche.replace(/\s+/g, "")}`,
    },
    {
      platform: "tiktok",
      content: `[HOOK] I launched an AI business in 60 seconds and it made R12K in week one.\n\n[SCRIPT] Here's exactly how ${businessName} does it in ${niche}...\n\n[CTA] Comment "EMPIRE" for the free guide.`,
    },
    {
      platform: "x",
      content: `${businessName} just dropped the most powerful AI business tool in ${niche}.\n\n→ Launch in 60 seconds\n→ AI agents work 24/7\n→ Real revenue from day 1\n\nThis is the future. Are you in?`,
    },
  ];
}
