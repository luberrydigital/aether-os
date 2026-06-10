import { NextResponse } from "next/server";
import { z } from "zod";
import {
  generateOtp,
  hashOtp,
  OTP_TTL_MS,
  otpSendCountForWindow,
} from "@/lib/auth/password-reset";
import {
  dbGetPasswordReset,
  dbGetUserByEmail,
  dbUpsertPasswordResetOtp,
} from "@/lib/db/local-db";
import { sendEmail } from "@/lib/email/send";
import { passwordResetOtpEmail } from "@/lib/email/templates";

export const runtime = "nodejs";

const bodySchema = z.object({
  email: z.string().email(),
});

const GENERIC_OK = {
  ok: true,
  message: "If an account exists for that email, we sent a verification code.",
};

export async function POST(request: Request) {
  let body: z.infer<typeof bodySchema>;
  try {
    body = bodySchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
  }

  const email = body.email.trim().toLowerCase();
  const user = await dbGetUserByEmail(email);
  if (!user) {
    if (process.env.NODE_ENV === "development") {
      return NextResponse.json({
        ...GENERIC_OK,
        dev: {
          emailSent: false,
          hint:
            "No account exists for this email in your local database. Sign up at /login first, or use an email you already registered.",
        },
      });
    }
    return NextResponse.json(GENERIC_OK);
  }

  const now = new Date();
  const existing = await dbGetPasswordReset(email);
  const { allowed, nextCount } = otpSendCountForWindow(existing, now);
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many codes requested. Try again in about an hour." },
      { status: 429 }
    );
  }

  const otp = generateOtp();
  const otpExpiresAt = new Date(now.getTime() + OTP_TTL_MS).toISOString();
  await dbUpsertPasswordResetOtp({
    email,
    otpHash: hashOtp(otp),
    otpExpiresAt,
    lastOtpSentAt: now.toISOString(),
    otpSendCount: nextCount,
  });

  const mail = passwordResetOtpEmail({
    otp,
    expiresMinutes: Math.round(OTP_TTL_MS / 60000),
  });
  const sent = await sendEmail({
    to: email,
    subject: mail.subject,
    html: mail.html,
  });

  if (!sent.ok) {
    if (process.env.NODE_ENV === "development") {
      console.log("[password-reset] email send failed — use this OTP:", otp, "for", email, sent.error);
      return NextResponse.json({
        ...GENERIC_OK,
        dev: {
          otp,
          emailSent: false,
          hint: "Email failed to send. Use the OTP printed in your terminal (npm run dev).",
        },
      });
    }
    return NextResponse.json(
      { error: "Could not send email. Try again later or contact support." },
      { status: 503 }
    );
  }

  if (process.env.NODE_ENV === "development") {
    console.log("[password-reset] OTP sent to", email, "— code:", otp);
    return NextResponse.json({
      ...GENERIC_OK,
      dev: { emailSent: true, hint: "Check your inbox (and spam). Resend sandbox only delivers to your Resend account email until you verify a domain." },
    });
  }

  return NextResponse.json(GENERIC_OK);
}
