import type {
  BusinessDesignerOutput,
  DeliveryFulfillmentOutput,
  FinancePaymentOutput,
  MarketingSalesOutput,
  MonitorProfitOutput,
} from "./orchestration-types";

const STOP = new Set([
  "the",
  "and",
  "for",
  "with",
  "that",
  "this",
  "from",
  "your",
  "you",
  "are",
  "using",
  "into",
  "their",
  "they",
  "who",
  "will",
  "can",
  "has",
  "have",
  "about",
  "based",
  "business",
  "company",
  "launch",
  "agents",
  "agent",
]);

function tokenize(sentence: string): string[] {
  return sentence
    .toLowerCase()
    .replace(/[^a-z0-9\s'-]/g, " ")
    .split(/\s+/)
    .map((w) => w.replace(/^'+|'+$/g, ""))
    .filter((w) => w.length > 2 && !STOP.has(w));
}

function hashSeed(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i += 1) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function titleCase(phrase: string): string {
  return phrase
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

const SUFFIXES = [
  "Pulse Labs",
  "Vertex AI Co",
  "Helix Systems",
  "Prism Ventures",
  "Nimbus Ops",
];

export function heuristicBusinessDesigner(
  sentence: string
): BusinessDesignerOutput {
  const trimmed = sentence.trim();
  const words = tokenize(trimmed);
  const seed = hashSeed(trimmed);
  const suffix = SUFFIXES[seed % SUFFIXES.length];
  const meaningful = words.filter((w) => w.length > 3).slice(0, 3);
  const stem =
    meaningful.length >= 2
      ? titleCase(meaningful.slice(0, 2).join(" "))
      : titleCase(trimmed.slice(0, 28).trim());

  return {
    businessName: `${stem} — ${suffix}`,
    tagline: "Autonomous revenue loops with human-grade taste.",
    executiveSummary: `${stem} packages your thesis into an AI-operated business: “${trimmed}”. The plan sequences wedge validation, agent orchestration, and a tight GTM cadence for the first 30 days.`,
    targetCustomer:
      seed % 2 === 0
        ? "High-intent SMB buyers with repeatable workflows."
        : "Prosumer teams adopting AI copilots inside existing stacks.",
    offer:
      "Done-with-you launch: agents for research, outreach, fulfillment, and finance telemetry with guardrails.",
    agentTeam: [
      {
        name: "Business Designer Agent",
        mandate: "Owns narrative, scope, and operating cadence from one-liner to plan.",
      },
      {
        name: "Marketing & Sales Agent",
        mandate: "Generates pipeline hypotheses, sequences, and pricing experiments.",
      },
      {
        name: "Delivery & Fulfillment Agent",
        mandate: "Defines SLAs, automation hooks, and customer delivery playbooks.",
      },
      {
        name: "Finance & Payment Agent",
        mandate: "Models cash timing, platform economics, and treasury controls.",
      },
      {
        name: "Monitor & Profit Agent",
        mandate: "Streams mock earnings pulses and anomaly hints until live rails land.",
      },
    ],
    risks: [
      "Model drift on edge cases — add eval harness before scaling traffic.",
      "Vendor concentration — keep secondary model path for failover.",
    ],
  };
}

export function heuristicMarketingSales(
  sentence: string
): MarketingSalesOutput {
  const seed = hashSeed(sentence);
  return {
    positioning: `Sharp, founder-led wedge around: ${sentence.slice(0, 120)}${sentence.length > 120 ? "…" : ""}`,
    primaryChannels:
      seed % 3 === 0
        ? ["LinkedIn outbound", "Product-led landing", "Partner webinars"]
        : ["Community-led growth", "SEO topical clusters", "Lifecycle email"],
    pipelineStages: [
      "Signal capture",
      "Qualified intro",
      "Pilot / paid trial",
      "Expansion",
    ],
    firstSevenDayPlan:
      "Day 1–2: tighten ICP + offer. Day 3–4: ship two creative variants + outbound list. Day 5–7: run experiments, instrument conversions, kill losers fast.",
  };
}

export function heuristicDelivery(sentence: string): DeliveryFulfillmentOutput {
  const seed = hashSeed(sentence);
  return {
    deliveryModel:
      seed % 2 === 0
        ? "Hybrid: AI-first execution with human review on money-moving edges."
        : "Hybrid: AI-first execution with human-in-the-loop on regulated flows.",
    sla: "P95 customer-facing responses under 10 minutes during business hours (simulated).",
    fulfillmentSteps: [
      "Intake & scope lock",
      "Automated provisioning",
      "Quality gate + human spot-check",
      "Customer handoff + telemetry",
    ],
    automationHooks: [
      "CRM webhook fan-out",
      "Calendar + billing state machine",
      "Slack / email escalation on SLA risk",
    ],
  };
}

/** Platform fee between 18% and 22% inclusive, stable per sentence. */
export function heuristicFinance(sentence: string): FinancePaymentOutput {
  const seed = hashSeed(sentence);
  const basisPoints = 1800 + (seed % 401);
  const rate = basisPoints / 10_000;
  const gross = 12_000 + (seed % 18_000);
  const fee = Math.round(gross * rate);
  const net = gross - fee;
  return {
    currency: "USD",
    projectedWeekOneGross: gross,
    platformFeeRate: rate,
    platformFeeAmount: fee,
    netAfterPlatformFee: net,
    feeBandLabel: `${(rate * 100).toFixed(1)}% platform fee (18–22% band)`,
    treasuryNote:
      "No production payouts or merchant captures are enabled until a human approves treasury actions in Aether OS.",
  };
}

export function heuristicMonitor(
  sentence: string,
  approval: "approved" | "rejected" | "pending"
): MonitorProfitOutput {
  const seed = hashSeed(sentence + approval);
  const pulse = ["$47 earned", "$83 earned", "$120 earned", "$199 earned"][
    seed % 4
  ];
  const rolling = 420 + (seed % 2_800);

  if (approval === "rejected") {
    return {
      status: "blocked_rejected",
      mockEarningsPulse: "$0 — treasury closed",
      rollingTotalUsd: 0,
      lastUpdatedIso: new Date().toISOString(),
      alerts: ["Human rejected treasury gate — mock earnings frozen."],
    };
  }

  if (approval === "pending") {
    return {
      status: "blocked_pending_human",
      mockEarningsPulse: "$0 — awaiting approval",
      rollingTotalUsd: 0,
      lastUpdatedIso: new Date().toISOString(),
      alerts: ["Treasury gate open — confirm before simulating payouts."],
    };
  }

  return {
    status: "live",
    mockEarningsPulse: pulse,
    rollingTotalUsd: rolling,
    lastUpdatedIso: new Date().toISOString(),
    alerts: [
      "Synthetic telemetry only — swap for PayFast / Paystack webhooks when live.",
    ],
  };
}
