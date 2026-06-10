export type SendEmailParams = {
  to: string;
  subject: string;
  html: string;
};

export type SendEmailResult = {
  ok: boolean;
  provider: "resend" | "smtp" | "console";
  error?: string;
};

const RESEND_FALLBACK_FROM = "Luberry AI <onboarding@resend.dev>";

/** Domains Resend will not accept as a custom From (must verify your own domain instead). */
const UNVERIFIED_FROM_DOMAINS = new Set([
  "gmail.com",
  "googlemail.com",
  "yahoo.com",
  "hotmail.com",
  "outlook.com",
  "live.com",
  "icloud.com",
]);

function extractEmailAddress(from: string): string {
  const match = from.match(/<([^>]+)>/);
  return (match?.[1] ?? from).trim();
}

function configuredFromAddress(): string {
  return (
    process.env.EMAIL_FROM?.trim() ||
    process.env.RESEND_FROM?.trim() ||
    RESEND_FALLBACK_FROM
  );
}

function resendFromCandidates(): string[] {
  const configured = configuredFromAddress();
  const domain = extractEmailAddress(configured).split("@")[1]?.toLowerCase() ?? "";
  if (UNVERIFIED_FROM_DOMAINS.has(domain)) {
    return [RESEND_FALLBACK_FROM];
  }
  return [configured, RESEND_FALLBACK_FROM];
}

async function sendViaResend(params: SendEmailParams): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) return { ok: false, provider: "resend", error: "RESEND_API_KEY not set" };

  let lastError = "Resend request failed";
  for (const from of resendFromCandidates()) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [params.to],
        subject: params.subject,
        html: params.html,
      }),
    });

    if (res.ok) return { ok: true, provider: "resend" };

    const text = await res.text();
    lastError = text.slice(0, 400);
    const domainRejected =
      res.status === 403 &&
      (text.includes("domain is not verified") || text.includes("validation_error"));
    if (!domainRejected) {
      return { ok: false, provider: "resend", error: lastError };
    }
  }

  return { ok: false, provider: "resend", error: lastError };
}

async function sendViaSmtp(params: SendEmailParams): Promise<SendEmailResult> {
  const host = process.env.SMTP_HOST?.trim();
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();
  if (!host || !user || !pass) {
    return { ok: false, provider: "smtp", error: "SMTP not configured" };
  }

  try {
    const nodemailer = await import("nodemailer");
    const port = Number(process.env.SMTP_PORT ?? "587");
    const transport = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
    await transport.sendMail({
      from: configuredFromAddress(),
      to: params.to,
      subject: params.subject,
      html: params.html,
    });
    return { ok: true, provider: "smtp" };
  } catch (e) {
    return {
      ok: false,
      provider: "smtp",
      error: e instanceof Error ? e.message : "SMTP send failed",
    };
  }
}

/**
 * Sends email via Resend (preferred) or SMTP (Nodemailer). Logs to console in dev when neither is configured.
 */
export async function sendEmail(params: SendEmailParams): Promise<SendEmailResult> {
  if (process.env.RESEND_API_KEY?.trim()) {
    const result = await sendViaResend(params);
    if (result.ok) return result;
  }

  if (process.env.SMTP_HOST?.trim()) {
    const result = await sendViaSmtp(params);
    if (result.ok) return result;
  }

  if (process.env.NODE_ENV === "development") {
    const otpMatch = params.html.match(/>(\d{6})</);
    console.log("[Luberry AI email — dev mode]", {
      to: params.to,
      subject: params.subject,
      ...(otpMatch ? { otp: otpMatch[1] } : {}),
      preview: params.html.slice(0, 200),
    });
    return { ok: true, provider: "console" };
  }

  return {
    ok: false,
    provider: "console",
    error: "No email provider configured (set RESEND_API_KEY or SMTP_*).",
  };
}

export function isEmailConfigured(): boolean {
  return Boolean(
    process.env.RESEND_API_KEY?.trim() ||
      (process.env.SMTP_HOST?.trim() && process.env.SMTP_USER?.trim())
  );
}
