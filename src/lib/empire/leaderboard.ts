import type { CompanyRow } from "@/lib/db/local-db";

export type LeaderboardEntry = {
  rank: number;
  alias: string;
  earningsZar: number;
  businesses: number;
  tier: string;
  growth: string;
  isYou?: boolean;
};

const SEEDED_ENTRIES: Omit<LeaderboardEntry, "rank" | "isYou">[] = [
  { alias: "Operator #7X2", earningsZar: 2840000, businesses: 12, tier: "Empire", growth: "+47%" },
  { alias: "Founder #K9M", earningsZar: 1920000, businesses: 8, tier: "Elite", growth: "+38%" },
  { alias: "Builder #P4R", earningsZar: 1450000, businesses: 6, tier: "Elite", growth: "+52%" },
  { alias: "Creator #N8L", earningsZar: 980000, businesses: 5, tier: "Pro", growth: "+29%" },
  { alias: "Hustler #W3T", earningsZar: 720000, businesses: 4, tier: "Pro", growth: "+41%" },
  { alias: "Mogul #F6J", earningsZar: 540000, businesses: 3, tier: "Pro", growth: "+33%" },
  { alias: "Scaler #B1Q", earningsZar: 380000, businesses: 2, tier: "Pro", growth: "+22%" },
];

function anonymize(userId: string): string {
  const hash = userId.slice(0, 4).toUpperCase();
  return `You #${hash}`;
}

export function buildLeaderboard(
  companies: CompanyRow[],
  userId?: string
): LeaderboardEntry[] {
  const userEarnings = companies
    .filter((c) => c.user_id === userId)
    .reduce((s, c) => s + (c.total_net_zar_cents ?? 0) / 100, 0);

  const userBusinessCount = companies.filter((c) => c.user_id === userId).length;

  const entries: LeaderboardEntry[] = SEEDED_ENTRIES.map((e, i) => ({
    ...e,
    rank: i + 1,
  }));

  if (userId && (userEarnings > 0 || userBusinessCount > 0)) {
    entries.push({
      rank: 0,
      alias: anonymize(userId),
      earningsZar: Math.round(userEarnings),
      businesses: userBusinessCount,
      tier: "You",
      growth: userEarnings > 50000 ? "+18%" : "+12%",
      isYou: true,
    });
  }

  entries.sort((a, b) => b.earningsZar - a.earningsZar);
  return entries.map((e, i) => ({ ...e, rank: i + 1 }));
}
