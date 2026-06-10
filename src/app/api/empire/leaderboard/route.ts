import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { buildLeaderboard } from "@/lib/empire/leaderboard";
import { getRouteSession } from "@/lib/auth/session";
import { dbListCompanies } from "@/lib/db/local-db";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const session = await getRouteSession(request);
  const userId = session?.user?.id;

  const companies = await dbListCompanies(500);
  const entries = buildLeaderboard(companies, userId ?? undefined);

  return NextResponse.json({ entries });
}
