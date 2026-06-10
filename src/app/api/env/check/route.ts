import { NextResponse } from "next/server";
import { getEnvCheckSnapshot } from "@/lib/env/env-status";

export const runtime = "nodejs";

/**
 * Public diagnostics: which env vars are present (booleans only, no values).
 * Open when logged out: `GET /api/env/check`
 */
export async function GET() {
  return NextResponse.json(getEnvCheckSnapshot());
}
