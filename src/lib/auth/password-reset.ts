import crypto from "crypto";

export const OTP_LENGTH = 6;
export const OTP_TTL_MS = 10 * 60 * 1000;
export const RESET_TOKEN_TTL_MS = 15 * 60 * 1000;
export const MAX_OTP_ATTEMPTS = 5;
export const MAX_OTP_SENDS_PER_HOUR = 3;
export const OTP_SEND_WINDOW_MS = 60 * 60 * 1000;

function pepper(): string {
  return process.env.NEXTAUTH_SECRET?.trim() || "aether-dev-pepper";
}

export function generateOtp(): string {
  const max = 10 ** OTP_LENGTH;
  const n = crypto.randomInt(0, max);
  return String(n).padStart(OTP_LENGTH, "0");
}

export function generateResetToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function hashOtp(otp: string): string {
  return crypto.createHash("sha256").update(`${otp}:${pepper()}`).digest("hex");
}

export function hashResetToken(token: string): string {
  return crypto.createHash("sha256").update(`${token}:${pepper()}`).digest("hex");
}

export function otpSendCountForWindow(
  existing: { last_otp_sent_at: string; otp_send_count: number } | null,
  now: Date
): { allowed: boolean; nextCount: number } {
  if (!existing) return { allowed: true, nextCount: 1 };

  const lastSent = new Date(existing.last_otp_sent_at).getTime();
  const withinWindow = now.getTime() - lastSent < OTP_SEND_WINDOW_MS;
  const count = withinWindow ? existing.otp_send_count : 0;

  if (withinWindow && count >= MAX_OTP_SENDS_PER_HOUR) {
    return { allowed: false, nextCount: count };
  }

  return { allowed: true, nextCount: count + 1 };
}

export function isOtpExpired(expiresAt: string, now = new Date()): boolean {
  return now.getTime() > new Date(expiresAt).getTime();
}

export function isResetTokenExpired(expiresAt: string | null, now = new Date()): boolean {
  if (!expiresAt) return true;
  return now.getTime() > new Date(expiresAt).getTime();
}
