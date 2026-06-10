"use client";

import { useMemo } from "react";
import { Table2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { gatewayMeta, type PaymentGatewayId } from "@/lib/payments/gateways";
import type { RevenueLogRow } from "@/components/revenue-dashboard-client";

type Props = {
  logs: RevenueLogRow[];
  loading: boolean;
};

export function PayoutHistoryTable({ logs, loading }: Props) {
  const zar = useMemo(
    () =>
      new Intl.NumberFormat("en-ZA", {
        style: "currency",
        currency: "ZAR",
        maximumFractionDigits: 0,
      }),
    []
  );
  const usd = useMemo(
    () =>
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }),
    []
  );

  const fmt = (row: RevenueLogRow, cents: number) =>
    row.currency === "ZAR" ? zar.format(cents / 100) : usd.format(cents / 100);

  function gatewayDisplayName(id: string): string {
    if (id === "payfast" || id === "paystack") return gatewayMeta(id as PaymentGatewayId).label;
    return id;
  }

  return (
    <Card className="relative overflow-hidden border-fuchsia-500/15 bg-gradient-to-br from-zinc-950/90 via-black/60 to-fuchsia-950/20 shadow-[0_0_60px_-20px_rgba(192,38,211,0.15)] backdrop-blur-xl">
      <div className="pointer-events-none absolute bottom-0 right-0 size-64 rounded-full bg-fuchsia-600/10 blur-3xl" />
      <CardHeader className="relative">
        <CardTitle className="flex flex-wrap items-center gap-3 text-xl font-bold text-white md:text-2xl">
          <span className="flex size-10 items-center justify-center rounded-xl border border-fuchsia-500/25 bg-fuchsia-500/10">
            <Table2 className="size-5 text-fuchsia-200" aria-hidden />
          </span>
          Revenue ledger
        </CardTitle>
        <CardDescription className="text-base text-zinc-400">
          Every sale is written to <span className="font-mono">revenue_logs</span>{" "}
          with the platform fee deducted (18–22%).
        </CardDescription>
      </CardHeader>
      <CardContent className="relative overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-white/10 hover:bg-white/[0.03]">
              <TableHead>When</TableHead>
              <TableHead>Gateway</TableHead>
              <TableHead>Gross</TableHead>
              <TableHead>Fee %</TableHead>
              <TableHead>Platform fee</TableHead>
              <TableHead>Net</TableHead>
              <TableHead>Type</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((row) => (
              <TableRow
                key={row.id}
                className="border-white/10 transition hover:bg-white/[0.04]"
              >
                <TableCell className="whitespace-normal text-muted-foreground">
                  {new Date(row.created_at).toLocaleString()}
                </TableCell>
                <TableCell className="whitespace-normal">
                  <div className="font-medium">{gatewayDisplayName(row.gateway)}</div>
                  <div className="text-xs text-muted-foreground">
                    {row.reference ?? "—"}
                  </div>
                </TableCell>
                <TableCell className="font-mono text-sm">
                  {fmt(row, row.gross_cents)}
                </TableCell>
                <TableCell className="font-mono text-amber-200">
                  {(row.platform_fee_rate * 100).toFixed(1)}%
                </TableCell>
                <TableCell className="font-mono text-sm text-amber-100/90">
                  {fmt(row, row.platform_fee_cents)}
                </TableCell>
                <TableCell className="font-mono text-sm text-emerald-300">
                  {fmt(row, row.net_cents)}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={row.note?.includes("Simulated") ? "outline" : "secondary"}
                    className="capitalize"
                  >
                    {row.note?.includes("Simulated") ? "simulated sale" : "sale"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
            {logs.length === 0 ? (
              <TableRow className="border-white/10">
                <TableCell colSpan={7} className="py-10 text-center text-sm text-zinc-500">
                  {loading ? "Loading revenue logs…" : "No revenue yet. Click “Simulate Real Sale” to generate a real ledger entry."}
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
