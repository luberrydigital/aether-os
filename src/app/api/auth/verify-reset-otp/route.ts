import { NextResponse } from "next/server";
import { z } from "zod";
import {
  generateResetToken,
  hashOtp,
  hashResetToken,
  isOtpExpired,
  MAX_OTP_ATTEMPTS,
  RESET_TOKEN_TTL_MS,
} from "@/lib/auth/password-reset";
import {
  dbGetPasswordReset,
  dbGetUserByEmail,
  dbIncrementPasswordResetOtpAttempts,
  dbSetPasswordResetToken,
} from "@/lib/db/local-db";

export const runtime = "nodejs";

const bodySchema = z.object({
  email: z.string().email(),
  otp: z.string().regex(/^\d{6}$/, "Enter the 6-digit code from your email."),
});

export async function POST(request: Request) {
  let body: z.infer<typeof bodySchema>;
  try {
    body = bodySchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid verification code." }, { status: 400 });
  }

  const email = body.email.trim().toLowerCase();
  const user = await dbGetUserByEmail(email);
  if (!user) {
    return NextResponse.json({ error: "Invalid or expired code." }, { status: 400 });
  }

  const row = await dbGetPasswordReset(email);
  if (!row || !row.otp_hash) {
    return NextResponse.json({ error: "Invalid or expired code." }, { status: 400 });
  }

  if (isOtpExpired(row.otp_expires_at)) {
    return NextResponse.json({ error: "This code has expired. Request a new one." }, { status: 400 });
  }

  if (row.otp_attempts >= MAX_OTP_ATTEMPTS) {
    return NextResponse.json(
      { error: "Too many failed attempts. Request a new code." },
      { status: 429 }
    );
  }

  if (hashOtp(body.otp) !== row.otp_hash) {
    const attempts = await dbIncrementPasswordResetOtpAttempts(email);
    const remaining = Math.max(0, MAX_OTP_ATTEMPTS - attempts);
    return NextResponse.json(
      {
        error:
          remaining > 0
            ? `Incorrect code. ${remaining} attempt${remaining === 1 ? "" : "s"} left.`
            : "Too many failed attempts. Request a new code.",
      },
      { status: 400 }
    );
  }

  const resetToken = generateResetToken();
  const now = new Date();
  await dbSetPasswordResetToken({
    email,
    resetTokenHash: hashResetToken(resetToken),
    resetTokenExpiresAt: new Date(now.getTime() + RESET_TOKEN_TTL_MS).toISOString(),
  });

  return NextResponse.json({
    ok: true,
    resetToken,
    message: "Code verified. Choose your new password.",
  });
}
