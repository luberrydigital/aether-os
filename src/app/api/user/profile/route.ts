import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { getRouteSession } from "@/lib/auth/session";
import { dbGetUserWithBilling, dbUpdateUserProfile } from "@/lib/db/local-db";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const session = await getRouteSession(request);
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await dbGetUserWithBilling(userId);
  if (!result) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({
    email: result.user.email,
    displayName: result.user.displayName ?? "",
    createdAt: result.user.createdAt,
    billing: result.billing,
  });
}

const patchSchema = z.object({
  displayName: z.string().max(80).optional(),
});

export async function PATCH(request: NextRequest) {
  const session = await getRouteSession(request);
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: z.infer<typeof patchSchema>;
  try {
    body = patchSchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const user = await dbUpdateUserProfile(userId, {
    displayName: body.displayName ?? null,
  });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    displayName: user.displayName ?? "",
  });
}
