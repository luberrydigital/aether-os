function baseUrl(): string {
  return (
    process.env.NEXTAUTH_URL?.trim() ||
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    "http://localhost:3000"
  );
}

function layout(content: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#111;border:1px solid rgba(212,175,55,0.2);border-radius:16px;overflow:hidden;">
        <tr><td style="padding:32px 40px 16px;text-align:center;">
          <span style="font-size:11px;font-weight:700;letter-spacing:0.3em;color:#d4af37;text-transform:uppercase;">Luberry AI</span>
        </td></tr>
        <tr><td style="padding:8px 40px 32px;color:#e4e4e7;font-size:15px;line-height:1.7;">
          ${content}
        </td></tr>
        <tr><td style="padding:20px 40px;border-top:1px solid rgba(255,255,255,0.06);text-align:center;">
          <span style="font-size:12px;color:#71717a;">© Luberry AI · AI Business Empire Platform</span>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function cta(href: string, label: string): string {
  return `<p style="margin:28px 0 8px;text-align:center;">
    <a href="${href}" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#d4af37,#b8860b);color:#000;font-weight:700;text-decoration:none;border-radius:10px;font-size:15px;">${label}</a>
  </p>`;
}

export function welcomeTrialEmail(params: {
  email: string;
  trialEndsAt: string;
}): { subject: string; html: string } {
  const end = new Date(params.trialEndsAt).toLocaleDateString("en-ZA", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const billingUrl = `${baseUrl()}/settings/billing`;
  const dashboardUrl = `${baseUrl()}/dashboard`;

  return {
    subject: "Welcome to Luberry AI — Your 10-day Pro trial has started",
    html: layout(`
      <h1 style="margin:0 0 16px;font-size:24px;color:#fafafa;text-align:center;">Welcome to your empire</h1>
      <p>Hi there,</p>
      <p>Your <strong style="color:#d4af37;">10-day free Pro trial</strong> is now active. You have full access to unlimited businesses, priority agents, the agent marketplace, and advanced marketing tools.</p>
      <p style="background:rgba(212,175,55,0.08);border:1px solid rgba(212,175,55,0.2);border-radius:10px;padding:16px;margin:20px 0;">
        <strong style="color:#d4af37;">Trial ends:</strong> ${end}<br>
        <span style="color:#a1a1aa;font-size:13px;">Cancel anytime — no charge until you choose to upgrade.</span>
      </p>
      ${cta(dashboardUrl, "Open Your Dashboard")}
      <p style="text-align:center;font-size:13px;color:#71717a;">
        <a href="${billingUrl}" style="color:#d4af37;">Manage billing & trial</a>
      </p>
    `),
  };
}

export function trialEndingSoonEmail(params: {
  daysRemaining: number;
  trialEndsAt: string;
}): { subject: string; html: string } {
  const end = new Date(params.trialEndsAt).toLocaleDateString("en-ZA", {
    month: "long",
    day: "numeric",
  });
  const upgradeUrl = `${baseUrl()}/settings/billing`;

  return {
    subject: `Your Luberry AI trial ends in ${params.daysRemaining} day${params.daysRemaining === 1 ? "" : "s"}`,
    html: layout(`
      <h1 style="margin:0 0 16px;font-size:24px;color:#fafafa;text-align:center;">Your trial ends soon</h1>
      <p>Your Pro trial expires on <strong style="color:#d4af37;">${end}</strong>. After that, your account moves to the Free plan unless you upgrade.</p>
      <p>Don't lose access to:</p>
      <ul style="color:#a1a1aa;padding-left:20px;">
        <li>Unlimited AI business launches</li>
        <li>Agent marketplace & one-click clone</li>
        <li>Daily AI business coach</li>
        <li>Priority agent orchestration</li>
      </ul>
      ${cta(upgradeUrl, "Upgrade Now — Keep Pro")}
      <p style="text-align:center;font-size:13px;color:#71717a;">Or cancel anytime with no charge.</p>
    `),
  };
}

export function trialEndedEmail(): { subject: string; html: string } {
  const upgradeUrl = `${baseUrl()}/settings/billing`;

  return {
    subject: "Your Luberry AI trial has ended",
    html: layout(`
      <h1 style="margin:0 0 16px;font-size:24px;color:#fafafa;text-align:center;">Trial ended</h1>
      <p>Your 10-day Pro trial has ended and your account is now on the <strong>Free plan</strong>.</p>
      <p>Your data and businesses are safe. Upgrade anytime to unlock Pro features again.</p>
      ${cta(upgradeUrl, "Upgrade to Pro — R299/mo")}
      <p style="text-align:center;font-size:13px;color:#71717a;">Questions? Reply to this email or visit Help & Support in your account menu.</p>
    `),
  };
}
