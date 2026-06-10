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

function fromAddress(): string {
  return (
    process.env.EMAIL_FROM?.trim() ||
    process.env.RESEND_FROM?.trim() ||
    "Luberry AI <onboarding@luberry.ai>"
  );
}

async function sendViaResend(params: SendEmailParams): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) return { ok: false, provider: "resend", error: "RESEND_API_KEY not set" };

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromAddress(),
      to: [params.to],
      subject: params.subject,
      html: params.html,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    return { ok: false, provider: "resend", error: text.slice(0, 400) };
  }
  return { ok: true, provider: "resend" };
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
      from: fromAddress(),
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
    console.log("[Luberry AI email — dev mode]", {
      to: params.to,
      subject: params.subject,
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
