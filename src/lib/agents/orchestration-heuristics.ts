import type {
  BusinessDesignerOutput,
  DeliveryFulfillmentOutput,
  FinancePaymentOutput,
  MarketingSalesOutput,
  MonitorProfitOutput,
  StorefrontDesignerPayload,
  StorefrontProductDesigner,
  PodHook,
} from "./orchestration-types";
import { defaultSlugFromSentence, slugifyStoreSlug } from "@/lib/storefront/slug";

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

export function isEcommerceSentence(sentence: string): boolean {
  const s = sentence.toLowerCase();
  const strong = [
    "ecommerce",
    "e-commerce",
    "shopify",
    "storefront",
    "dropship",
    "dropshipping",
    "merch",
    "t-shirt",
    "tees",
    "apparel",
    "sneaker",
    "jewelry",
    "jewellery",
    "cosmetic",
    "skincare",
    "supplement",
    "gadget",
    "earbuds",
    "headphones",
    "print on demand",
    "pod ",
    "woocommerce",
    "bigcommerce",
    "amazon fba",
    "dtc",
    "direct to consumer",
  ];
  if (strong.some((k) => s.includes(k))) return true;
  const combo =
    (s.includes("sell") && (s.includes("online") || s.includes("product"))) ||
    (s.includes("shop") && s.includes("online")) ||
    (s.includes("store") && (s.includes("open") || s.includes("launch")));
  return combo;
}

function buildHeuristicStorefront(
  sentence: string,
  brandStem: string
): StorefrontDesignerPayload {
  const trimmed = sentence.trim();
  const seed = hashSeed(trimmed);
  const slug = defaultSlugFromSentence(trimmed);
  const brand = titleCase(brandStem.split("—")[0]?.trim() || brandStem) || "AI Store";

  const mkProduct = (
    title: string,
    desc: string,
    priceCents: number,
    currency: StorefrontProductDesigner["currency"],
    imagePrompt: string,
    tags: string[],
    pod: PodHook
  ): StorefrontProductDesigner => ({
    title,
    description: desc,
    priceCents,
    currency,
    imagePrompt,
    tags,
    pod,
  });

  return {
    slug: slugifyStoreSlug(slug),
    brandName: brand,
    headline: `${brand} — launch capsule`,
    description: `A tight first collection inspired by: ${trimmed.slice(0, 180)}${trimmed.length > 180 ? "…" : ""}`,
    products: [
      mkProduct(
        `${brand} Signature`,
        "Hero SKU with premium positioning and repeatable packaging.",
        4900 + (seed % 25) * 100,
        "USD",
        `Ultra-premium product photography, ${brand} hero product on matte black pedestal, soft rim light, 8k detail`,
        ["signature", "hero"],
        { provider: "printful", externalSku: "T-SHIRT" }
      ),
      mkProduct(
        `${brand} Bundle`,
        "Bundle SKU for higher AOV with clear savings story.",
        8900 + (seed % 30) * 100,
        "USD",
        `Lifestyle flat lay bundle, ${brand} minimalist aesthetic, neutral tones, subtle reflections`,
        ["bundle", "aov"],
        { provider: "printful", externalSku: "HOODIE" }
      ),
      mkProduct(
        `${brand} Limited`,
        "Scarcity SKU for launch-week momentum (simulated inventory).",
        12900 + (seed % 20) * 100,
        "ZAR" as const,
        `Editorial product shot, ${brand} limited drop vibe, neon accent, cinematic depth`,
        ["limited", "drop"],
        { provider: "printful", externalSku: "MUG" }
      ),
    ],
  };
}

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

  const base: BusinessDesignerOutput = {
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

  if (isEcommerceSentence(trimmed)) {
    return {
      ...base,
      storefront: buildHeuristicStorefront(trimmed, stem),
    };
  }

  return base;
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
  const hooks = [
    "CRM webhook fan-out",
    "Calendar + billing state machine",
    "Slack / email escalation on SLA risk",
  ];
  if (isEcommerceSentence(sentence)) {
    hooks.push(
      "Printful integration hook (Phase 2): product sync + order fulfillment webhooks"
    );
    hooks.push(
      "Printify integration hook (Phase 2): variant mapping + supplier routing"
    );
  }
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
    automationHooks: hooks,
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
  if (approval === "rejected") {
    return {
      status: "blocked_rejected",
      earningsPulse: "Treasury closed — no live money movement.",
      rollingTotalUsd: 0,
      lastUpdatedIso: new Date().toISOString(),
      alerts: ["Human rejected treasury gate — revenue logging stays disabled."],
    };
  }

  if (approval === "pending") {
    return {
      status: "blocked_pending_human",
      earningsPulse: "Awaiting treasury approval — revenue logging disabled.",
      rollingTotalUsd: 0,
      lastUpdatedIso: new Date().toISOString(),
      alerts: ["Treasury gate open — approve before enabling live money movement."],
    };
  }

  return {
    status: "live",
    earningsPulse: "Live — revenue is sourced from your database ledger.",
    rollingTotalUsd: 0,
    lastUpdatedIso: new Date().toISOString(),
    alerts: ["Connect gateway webhooks to log real sales into revenue_logs."],
  };
}
