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
import type { PayoutRow } from "@/lib/payments/mock-payouts";
import { gatewayMeta } from "@/lib/payments/gateways";

type Props = {
  payouts: PayoutRow[];
};

export function PayoutHistoryTable({ payouts }: Props) {
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

  const fmt = (row: PayoutRow, cents: number) =>
    row.currency === "ZAR" ? zar.format(cents / 100) : usd.format(cents / 100);

  return (
    <Card className="relative overflow-hidden border-fuchsia-500/15 bg-gradient-to-br from-zinc-950/90 via-black/60 to-fuchsia-950/20 shadow-[0_0_60px_-20px_rgba(192,38,211,0.15)] backdrop-blur-xl">
      <div className="pointer-events-none absolute bottom-0 right-0 size-64 rounded-full bg-fuchsia-600/10 blur-3xl" />
      <CardHeader className="relative">
        <CardTitle className="flex flex-wrap items-center gap-3 text-xl font-bold text-white md:text-2xl">
          <span className="flex size-10 items-center justify-center rounded-xl border border-fuchsia-500/25 bg-fuchsia-500/10">
            <Table2 className="size-5 text-fuchsia-200" aria-hidden />
          </span>
          Payout ledger
        </CardTitle>
        <CardDescription className="text-base text-zinc-400">
          Gross inflow, Aether OS platform fee (18–22%), and net to you — all{" "}
          <span className="font-medium text-zinc-200">sandbox</span> for now.
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
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payouts.map((row) => (
              <TableRow
                key={row.id}
                className="border-white/10 transition hover:bg-white/[0.04]"
              >
                <TableCell className="whitespace-normal text-muted-foreground">
                  {new Date(row.at).toLocaleString()}
                </TableCell>
                <TableCell className="whitespace-normal">
                  <div className="font-medium">{gatewayMeta(row.gateway).label}</div>
                  <div className="text-xs text-muted-foreground">
                    {row.reference}
                  </div>
                </TableCell>
                <TableCell className="font-mono text-sm">
                  {fmt(row, row.grossCents)}
                </TableCell>
                <TableCell className="font-mono text-amber-200">
                  {(row.platformFeeRate * 100).toFixed(1)}%
                </TableCell>
                <TableCell className="font-mono text-sm text-amber-100/90">
                  {fmt(row, row.platformFeeCents)}
                </TableCell>
                <TableCell className="font-mono text-sm text-emerald-300">
                  {fmt(row, row.netCents)}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      row.status === "sandbox_settled" ? "secondary" : "outline"
                    }
                    className="capitalize"
                  >
                    {row.status.replaceAll("_", " ")}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
