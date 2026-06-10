import type { Session } from "next-auth";
import { getServerSession } from "next-auth";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";
import { authOptions } from "@/lib/auth/options";

/**
 * Route-handler-safe session helper.
 *
 * `getServerSession(authOptions)` can be unreliable in Next.js App Router route handlers
 * depending on runtime/bundling. We derive the session from the NextAuth JWT instead.
 */
/** Server component / non-request contexts. */
export async function getSession(): Promise<Session | null> {
  return await getServerSession(authOptions);
}

/** Route handler contexts (App Router). */
export async function getRouteSession(request: NextRequest): Promise<Session | null> {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) return null;

  const token = await getToken({ req: request as never, secret });
  if (!token?.sub) return null;

  return {
    user: {
      id: token.sub,
      email: typeof token.email === "string" ? token.email : undefined,
      name: typeof token.name === "string" ? token.name : undefined,
      image: typeof token.picture === "string" ? token.picture : undefined,
    },
    expires:
      typeof token.exp === "number"
        ? new Date(token.exp * 1000).toISOString()
        : new Date(Date.now() + 3600_000).toISOString(),
  } as Session;
}

