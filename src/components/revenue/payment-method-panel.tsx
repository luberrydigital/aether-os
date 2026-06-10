"use client";

import { useEffect, useState } from "react";
import { ExternalLink, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  PAYMENT_GATEWAYS,
  type PaymentGatewayId,
  gatewayMeta,
} from "@/lib/payments/gateways";

type GatewayStatus = {
  configured: boolean;
};

type StatusPayload = {
  sandbox: boolean;
  gateways: Record<PaymentGatewayId, GatewayStatus>;
};

export function PaymentMethodPanel() {
  const [method, setMethod] = useState<PaymentGatewayId>("payfast");
  const [status, setStatus] = useState<StatusPayload | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/payments/status");
        if (!res.ok) {
          setStatusError("Could not load gateway status.");
          return;
        }
        const data = (await res.json()) as StatusPayload;
        if (!cancelled) setStatus(data);
      } catch {
        setStatusError("Could not load gateway status.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const meta = gatewayMeta(method);
  const configured = status?.gateways[method]?.configured ?? false;

  return (
    <Card className="relative overflow-hidden border-amber-500/20 bg-gradient-to-b from-zinc-950/90 via-black/70 to-amber-950/15 shadow-[0_0_50px_-18px_rgba(212,175,55,0.2)] backdrop-blur-xl">
      <div className="pointer-events-none absolute -right-16 top-0 size-48 rounded-full bg-amber-600/10 blur-3xl" />
      <CardHeader className="relative">
        <CardTitle className="flex items-center gap-3 text-xl font-bold text-white md:text-2xl">
          <span className="flex size-10 items-center justify-center rounded-xl border border-amber-500/30 bg-amber-500/15">
            <ShieldCheck className="size-5 text-amber-200" aria-hidden />
          </span>
          Settlement rails
        </CardTitle>
        <CardDescription className="text-base text-zinc-400">
          PayFast (South Africa) or Paystack (pan-Africa). Stays in{" "}
          <span className="font-medium text-zinc-200">sandbox / test</span> until
          keys land in{" "}
          <code className="rounded bg-white/5 px-1">.env.local</code>.
        </CardDescription>
      </CardHeader>
      <CardContent className="relative space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="payment-method">Select payment method</Label>
          <Select
            value={method}
            onValueChange={(v) => {
              if (v) setMethod(v as PaymentGatewayId);
            }}
          >
            <SelectTrigger
              id="payment-method"
              className="h-11 w-full min-w-0 max-w-full"
              size="default"
            >
              <SelectValue placeholder="Select payment method">
                {gatewayMeta(method).label} — {gatewayMeta(method).shortLabel}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="min-w-[var(--anchor-width)]">
              {PAYMENT_GATEWAYS.map((g) => (
                <SelectItem key={g.id} value={g.id}>
                  <span className="flex flex-col gap-0.5 py-0.5 text-left">
                    <span className="font-medium">{g.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {g.region}
                    </span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/45 p-4 text-sm shadow-inner">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium text-foreground">{meta.label}</p>
            {!status && !statusError ? (
              <Skeleton className="h-5 w-28 bg-muted/30" />
            ) : configured ? (
              <Badge className="bg-emerald-500/20 text-emerald-200">
                Keys detected
              </Badge>
            ) : (
              <Badge variant="secondary">Sandbox UI only</Badge>
            )}
          </div>
          <p className="mt-2 text-muted-foreground">{meta.region}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            Env: {meta.envKeys.join(", ")}
          </p>
          <div className="mt-4 space-y-2">
            <p className="text-xs font-medium text-foreground">
              Test keys for <span className="text-violet-200">{meta.label}</span>{" "}
              (paste into <code className="rounded bg-white/5 px-1">.env.local</code>)
            </p>
            <pre className="max-h-48 overflow-auto rounded-lg border border-white/10 bg-black/50 p-3 text-[11px] leading-relaxed text-muted-foreground">
              {meta.testEnvTemplate}
            </pre>
          </div>
          {statusError ? (
            <p className="mt-2 text-xs text-amber-200/90">{statusError}</p>
          ) : null}
          <a
            href={meta.docsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "mt-3 inline-flex items-center gap-1.5 border-white/15"
            )}
          >
            <ExternalLink className="size-3.5" />
            Open gateway docs
          </a>
        </div>

        <p className="text-xs leading-relaxed text-muted-foreground">
          PayFast fits South African checkout; Paystack covers cards and bank
          rails across Africa. This dashboard records gross, platform fee, and
          net in your ledger when you wire real webhooks (PayFast ITN / Paystack
          charge.success) to your server. To land your cut in your own bank
          balance, configure Paystack split/subaccounts or PayFast split rules in
          the gateway dashboard—otherwise funds settle to the merchant account
          that owns the keys.
        </p>
      </CardContent>
    </Card>
  );
}
