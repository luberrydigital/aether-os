import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { hashResetToken, isResetTokenExpired } from "@/lib/auth/password-reset";
import {
  dbDeletePasswordReset,
  dbGetPasswordReset,
  dbGetUserByEmail,
  dbUpdateUserPassword,
} from "@/lib/db/local-db";

export const runtime = "nodejs";

const bodySchema = z.object({
  email: z.string().email(),
  resetToken: z.string().min(32),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export async function POST(request: Request) {
  let body: z.infer<typeof bodySchema>;
  try {
    body = bodySchema.parse(await request.json());
  } catch (e) {
    const msg =
      e instanceof z.ZodError
        ? e.issues[0]?.message ?? "Invalid request."
        : "Invalid request.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const email = body.email.trim().toLowerCase();
  const user = await dbGetUserByEmail(email);
  if (!user) {
    return NextResponse.json({ error: "Reset link expired. Start again." }, { status: 400 });
  }

  const row = await dbGetPasswordReset(email);
  if (!row?.reset_token_hash) {
    return NextResponse.json({ error: "Reset link expired. Start again." }, { status: 400 });
  }

  if (isResetTokenExpired(row.reset_token_expires_at)) {
    await dbDeletePasswordReset(email);
    return NextResponse.json({ error: "Reset session expired. Request a new code." }, { status: 400 });
  }

  if (hashResetToken(body.resetToken) !== row.reset_token_hash) {
    return NextResponse.json({ error: "Reset link expired. Start again." }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(body.password, 10);
  await dbUpdateUserPassword(user.id, passwordHash);
  await dbDeletePasswordReset(email);

  return NextResponse.json({
    ok: true,
    message: "Password updated. You can sign in with your new password.",
  });
}
