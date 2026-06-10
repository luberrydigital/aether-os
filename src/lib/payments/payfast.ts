import crypto from "crypto";

function enc(v: string): string {
  return encodeURIComponent(v).replace(/%20/g, "+");
}

export function payfastModeFromEnv(): "live" | "sandbox" {
  const m = (process.env.PAYFAST_MODE ?? "").toLowerCase().trim();
  return m === "live" ? "live" : "sandbox";
}

export function payfastProcessUrl(): string {
  return payfastModeFromEnv() === "live"
    ? "https://www.payfast.co.za/eng/process"
    : "https://sandbox.payfast.co.za/eng/process";
}

export function payfastValidateUrl(): string {
  return payfastModeFromEnv() === "live"
    ? "https://www.payfast.co.za/eng/query/validate"
    : "https://sandbox.payfast.co.za/eng/query/validate";
}

export function payfastPassphraseFromEnv(): string {
  return process.env.PAYFAST_PASSPHRASE?.trim() ?? "";
}

export function payfastMerchantIdFromEnv(): string {
  return process.env.PAYFAST_MERCHANT_ID?.trim() ?? "";
}

export function payfastMerchantKeyFromEnv(): string {
  return process.env.PAYFAST_MERCHANT_KEY?.trim() ?? "";
}

export function toPayfastAmount(amount: number): string {
  // PayFast expects 2dp decimal string.
  return amount.toFixed(2);
}

export function buildPayfastParamString(params: Record<string, string>): string {
  // PayFast signature uses sorted params; exclude "signature".
  const keys = Object.keys(params)
    .filter((k) => k !== "signature")
    .sort((a, b) => a.localeCompare(b));
  return keys.map((k) => `${k}=${enc(params[k] ?? "")}`).join("&");
}

export function payfastSignature(params: Record<string, string>, passphrase: string): string {
  const base = buildPayfastParamString(params);
  const toHash = passphrase ? `${base}&passphrase=${enc(passphrase)}` : base;
  return crypto.createHash("md5").update(toHash).digest("hex");
}

export async function payfastValidateItN(body: string): Promise<boolean> {
  const res = await fetch(payfastValidateUrl(), {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const raw = await res.text();
  return res.ok && raw.trim().toUpperCase() === "VALID";
}

