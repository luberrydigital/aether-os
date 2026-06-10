import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  // Never expose this in production.
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) return NextResponse.json({ ok: false, error: "NEXTAUTH_SECRET missing" }, { status: 500 });

  const token = await getToken({ req: request as never, secret });

  return NextResponse.json({
    ok: true,
    hasToken: Boolean(token),
    sub: token?.sub ?? null,
    email: (token as { email?: unknown } | null)?.email ?? null,
  });
}

