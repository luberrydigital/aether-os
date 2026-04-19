import {
  Annotation,
  END,
  MemorySaver,
  START,
  StateGraph,
  interrupt,
} from "@langchain/langgraph";
import { generateLlmJson } from "@/lib/llm/chat-model";
import {
  heuristicBusinessDesigner,
  heuristicDelivery,
  heuristicFinance,
  heuristicMarketingSales,
  heuristicMonitor,
} from "./orchestration-heuristics";
import type {
  BusinessDesignerOutput,
  DeliveryFulfillmentOutput,
  FinancePaymentOutput,
  HumanApprovalStatus,
  MarketingSalesOutput,
  MonitorProfitOutput,
  OrchestrationPublicState,
  TreasuryInterruptPayload,
  TreasuryResume,
} from "./orchestration-types";

const OrchestrationState = Annotation.Root({
  sentence: Annotation<string>(),
  businessDesigner: Annotation<BusinessDesignerOutput | null>(),
  marketingSales: Annotation<MarketingSalesOutput | null>(),
  deliveryFulfillment: Annotation<DeliveryFulfillmentOutput | null>(),
  financePayment: Annotation<FinancePaymentOutput | null>(),
  humanApproval: Annotation<HumanApprovalStatus>(),
  humanApprovalNotes: Annotation<string | null>(),
  monitorProfit: Annotation<MonitorProfitOutput | null>(),
  errors: Annotation<string[]>({
    reducer: (a, b) => [...a, ...b],
    default: () => [],
  }),
});

function coerceBusinessDesigner(
  raw: unknown,
  sentence: string
): BusinessDesignerOutput {
  const fb = heuristicBusinessDesigner(sentence);
  if (!raw || typeof raw !== "object") return fb;
  const o = raw as Record<string, unknown>;
  const name = typeof o.businessName === "string" ? o.businessName : fb.businessName;
  const tagline = typeof o.tagline === "string" ? o.tagline : fb.tagline;
  const exec =
    typeof o.executiveSummary === "string" ? o.executiveSummary : fb.executiveSummary;
  const tc =
    typeof o.targetCustomer === "string" ? o.targetCustomer : fb.targetCustomer;
  const offer = typeof o.offer === "string" ? o.offer : fb.offer;
  const team = Array.isArray(o.agentTeam) ? o.agentTeam : fb.agentTeam;
  const safeTeam = team
    .map((row) => {
      if (!row || typeof row !== "object") return null;
      const r = row as Record<string, unknown>;
      const n = typeof r.name === "string" ? r.name : "";
      const m = typeof r.mandate === "string" ? r.mandate : "";
      if (!n || !m) return null;
      return { name: n, mandate: m };
    })
    .filter(Boolean) as BusinessDesignerOutput["agentTeam"];
  const risks = Array.isArray(o.risks)
    ? o.risks.filter((x): x is string => typeof x === "string")
    : fb.risks;
  return {
    businessName: name,
    tagline,
    executiveSummary: exec,
    targetCustomer: tc,
    offer,
    agentTeam: safeTeam.length >= 3 ? safeTeam : fb.agentTeam,
    risks: risks.length ? risks : fb.risks,
  };
}

function coerceMarketing(raw: unknown, sentence: string): MarketingSalesOutput {
  const fb = heuristicMarketingSales(sentence);
  if (!raw || typeof raw !== "object") return fb;
  const o = raw as Record<string, unknown>;
  return {
    positioning:
      typeof o.positioning === "string" ? o.positioning : fb.positioning,
    primaryChannels: Array.isArray(o.primaryChannels)
      ? o.primaryChannels.filter((x): x is string => typeof x === "string")
      : fb.primaryChannels,
    pipelineStages: Array.isArray(o.pipelineStages)
      ? o.pipelineStages.filter((x): x is string => typeof x === "string")
      : fb.pipelineStages,
    firstSevenDayPlan:
      typeof o.firstSevenDayPlan === "string"
        ? o.firstSevenDayPlan
        : fb.firstSevenDayPlan,
  };
}

function coerceDelivery(
  raw: unknown,
  sentence: string
): DeliveryFulfillmentOutput {
  const fb = heuristicDelivery(sentence);
  if (!raw || typeof raw !== "object") return fb;
  const o = raw as Record<string, unknown>;
  return {
    deliveryModel:
      typeof o.deliveryModel === "string" ? o.deliveryModel : fb.deliveryModel,
    sla: typeof o.sla === "string" ? o.sla : fb.sla,
    fulfillmentSteps: Array.isArray(o.fulfillmentSteps)
      ? o.fulfillmentSteps.filter((x): x is string => typeof x === "string")
      : fb.fulfillmentSteps,
    automationHooks: Array.isArray(o.automationHooks)
      ? o.automationHooks.filter((x): x is string => typeof x === "string")
      : fb.automationHooks,
  };
}

function coerceFinance(raw: unknown, sentence: string): FinancePaymentOutput {
  const fb = heuristicFinance(sentence);
  if (!raw || typeof raw !== "object") return fb;
  const o = raw as Record<string, unknown>;
  const gross = Number(o.projectedWeekOneGross);
  const rate = Number(o.platformFeeRate);
  if (!Number.isFinite(gross) || !Number.isFinite(rate)) return fb;
  const clampedRate = Math.min(0.22, Math.max(0.18, rate));
  const fee = Math.round(gross * clampedRate);
  return {
    currency: "USD",
    projectedWeekOneGross: Math.round(gross),
    platformFeeRate: clampedRate,
    platformFeeAmount: fee,
    netAfterPlatformFee: Math.round(gross - fee),
    feeBandLabel:
      typeof o.feeBandLabel === "string"
        ? o.feeBandLabel
        : `${(clampedRate * 100).toFixed(1)}% platform fee (18–22% band)`,
    treasuryNote:
      typeof o.treasuryNote === "string" ? o.treasuryNote : fb.treasuryNote,
  };
}

/**
 * Runs the same multi-agent LLM chain as the graph, but skips the LangGraph interrupt node:
 * treasury is auto-approved so launch can persist a complete blueprint in one request.
 */
export async function runOrchestrationSyncForLaunch(
  sentence: string
): Promise<OrchestrationPublicState> {
  const trimmed = sentence.trim();
  const state = {
    sentence: trimmed,
    businessDesigner: null,
    marketingSales: null,
    deliveryFulfillment: null,
    financePayment: null,
    humanApproval: "pending" as HumanApprovalStatus,
    humanApprovalNotes: null,
    monitorProfit: null,
    errors: [],
  } as typeof OrchestrationState.State;

  Object.assign(state, await businessDesignerAgent(state));
  Object.assign(state, await marketingSalesAgent(state));
  Object.assign(state, await deliveryFulfillmentAgent(state));
  Object.assign(state, await financePaymentAgent(state));
  state.humanApproval = "approved";
  state.humanApprovalNotes =
    "Launch pipeline: treasury gate auto-approved for sandbox (no live money movement).";
  Object.assign(state, await monitorProfitAgent(state));
  return toPublicOrchestrationState(state as unknown as Record<string, unknown>);
}

async function businessDesignerAgent(state: typeof OrchestrationState.State) {
  const raw = await generateLlmJson<unknown>(
    [
      {
        role: "system",
        content: `You are the Business Designer Agent. Turn the founder's one-liner into a crisp business plan JSON with keys:
businessName, tagline, executiveSummary, targetCustomer, offer, agentTeam (array of {name,mandate}), risks (string array of 2-4 items).
Keep mandates short. No markdown.`,
      },
      { role: "user", content: state.sentence },
    ],
    () => heuristicBusinessDesigner(state.sentence)
  );
  return { businessDesigner: coerceBusinessDesigner(raw, state.sentence) };
}

async function marketingSalesAgent(state: typeof OrchestrationState.State) {
  const raw = await generateLlmJson<unknown>(
    [
      {
        role: "system",
        content: `You are the Marketing & Sales Agent. JSON only with keys:
positioning, primaryChannels (array), pipelineStages (array), firstSevenDayPlan (string).`,
      },
      {
        role: "user",
        content: `Business context:\n${JSON.stringify(state.businessDesigner, null, 2)}`,
      },
    ],
    () => heuristicMarketingSales(state.sentence)
  );
  return { marketingSales: coerceMarketing(raw, state.sentence) };
}

async function deliveryFulfillmentAgent(
  state: typeof OrchestrationState.State
) {
  const raw = await generateLlmJson<unknown>(
    [
      {
        role: "system",
        content: `You are the Delivery & Fulfillment Agent. JSON only with keys:
deliveryModel, sla, fulfillmentSteps (array), automationHooks (array).`,
      },
      {
        role: "user",
        content: `Offer + marketing:\n${JSON.stringify(
          { m: state.marketingSales, b: state.businessDesigner },
          null,
          2
        )}`,
      },
    ],
    () => heuristicDelivery(state.sentence)
  );
  return { deliveryFulfillment: coerceDelivery(raw, state.sentence) };
}

async function financePaymentAgent(state: typeof OrchestrationState.State) {
  const raw = await generateLlmJson<unknown>(
    [
      {
        role: "system",
        content: `You are the Finance & Payment Agent. JSON only with keys:
projectedWeekOneGross (number USD), platformFeeRate (decimal between 0.18 and 0.22 inclusive), feeBandLabel (string), treasuryNote (string mentioning Aether OS platform fee and that live payouts require human approval).
Also include derived platformFeeAmount and netAfterPlatformFee if you want; otherwise they will be recomputed from gross and rate.`,
      },
      {
        role: "user",
        content: `Delivery model:\n${JSON.stringify(state.deliveryFulfillment, null, 2)}`,
      },
    ],
    () => heuristicFinance(state.sentence)
  );
  const finance = coerceFinance(raw, state.sentence);
  const fee = Math.round(finance.projectedWeekOneGross * finance.platformFeeRate);
  return {
    financePayment: {
      ...finance,
      platformFeeAmount: fee,
      netAfterPlatformFee: finance.projectedWeekOneGross - fee,
    },
  };
}

async function treasuryHumanGate(state: typeof OrchestrationState.State) {
  const finance = state.financePayment;
  if (!finance) {
    return { errors: ["FinancePayment missing before treasury gate."] };
  }

  const payload: TreasuryInterruptPayload = {
    gate: "treasury_before_money_movement",
    title: "Treasury human approval",
    message:
      "Aether OS will not connect live payouts, merchant capture, or production billing keys until a human explicitly approves. Approve only if you intend to move real money.",
    proposedActions: [
      "Attach live PayFast / Paystack merchant profile",
      "Raise weekly capture limits beyond pilot sandbox",
      "Enable ACH / wire settlement",
    ],
    financeSnapshot: finance,
  };

  const decision = interrupt<TreasuryInterruptPayload, TreasuryResume>(payload);

  if (!decision?.approved) {
    return {
      humanApproval: "rejected" as HumanApprovalStatus,
      humanApprovalNotes: decision?.notes ?? "Treasury gate rejected.",
    };
  }
  return {
    humanApproval: "approved" as HumanApprovalStatus,
    humanApprovalNotes: decision?.notes ?? null,
  };
}

async function monitorProfitAgent(state: typeof OrchestrationState.State) {
  const approval: "approved" | "rejected" | "pending" =
    state.humanApproval === "approved"
      ? "approved"
      : state.humanApproval === "rejected"
        ? "rejected"
        : "pending";

  const raw = await generateLlmJson<unknown>(
    [
      {
        role: "system",
        content: `You are the Monitor & Profit Agent. JSON only with keys:
mockEarningsPulse (string like "$47 earned"), rollingTotalUsd (number), alerts (string array, 1-3 items), status ("live" if treasury approved else "blocked_rejected" or "blocked_pending_human").`,
      },
      {
        role: "user",
        content: JSON.stringify(
          {
            sentence: state.sentence,
            humanApproval: state.humanApproval,
            finance: state.financePayment,
          },
          null,
          2
        ),
      },
    ],
    () => heuristicMonitor(state.sentence, approval)
  );

  const fb = heuristicMonitor(state.sentence, approval);
  if (!raw || typeof raw !== "object") {
    return { monitorProfit: fb };
  }
  const o = raw as Record<string, unknown>;
  const pulse =
    typeof o.mockEarningsPulse === "string" ? o.mockEarningsPulse : fb.mockEarningsPulse;
  const rolling = Number(o.rollingTotalUsd);
  const alerts = Array.isArray(o.alerts)
    ? o.alerts.filter((x): x is string => typeof x === "string")
    : fb.alerts;
  const forcedStatus: MonitorProfitOutput["status"] =
    state.humanApproval === "approved"
      ? "live"
      : state.humanApproval === "rejected"
        ? "blocked_rejected"
        : "blocked_pending_human";

  return {
    monitorProfit: {
      mockEarningsPulse: pulse,
      rollingTotalUsd: Number.isFinite(rolling) ? Math.round(rolling) : fb.rollingTotalUsd,
      alerts: alerts.length ? alerts : fb.alerts,
      status: forcedStatus,
      lastUpdatedIso: new Date().toISOString(),
    },
  };
}

function buildOrchestrationGraph() {
  return new StateGraph(OrchestrationState)
    .addNode("business_designer", businessDesignerAgent)
    .addNode("marketing_sales", marketingSalesAgent)
    .addNode("delivery_fulfillment", deliveryFulfillmentAgent)
    .addNode("finance_payment", financePaymentAgent)
    .addNode("treasury_human", treasuryHumanGate)
    .addNode("monitor_profit", monitorProfitAgent)
    .addEdge(START, "business_designer")
    .addEdge("business_designer", "marketing_sales")
    .addEdge("marketing_sales", "delivery_fulfillment")
    .addEdge("delivery_fulfillment", "finance_payment")
    .addEdge("finance_payment", "treasury_human")
    .addEdge("treasury_human", "monitor_profit")
    .addEdge("monitor_profit", END);
}

const globalRuntime = globalThis as unknown as {
  __aether_checkpointer?: MemorySaver;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  __aether_orchestration?: any;
};

function getCheckpointer(): MemorySaver {
  if (!globalRuntime.__aether_checkpointer) {
    globalRuntime.__aether_checkpointer = new MemorySaver();
  }
  return globalRuntime.__aether_checkpointer;
}

export function getOrchestrationGraph() {
  if (!globalRuntime.__aether_orchestration) {
    globalRuntime.__aether_orchestration = buildOrchestrationGraph().compile({
      checkpointer: getCheckpointer(),
    });
  }
  return globalRuntime.__aether_orchestration;
}

export function toPublicOrchestrationState(
  values: Record<string, unknown>
): OrchestrationPublicState {
  return {
    sentence: String(values.sentence ?? ""),
    businessDesigner: (values.businessDesigner ??
      null) as BusinessDesignerOutput | null,
    marketingSales: (values.marketingSales ?? null) as MarketingSalesOutput | null,
    deliveryFulfillment: (values.deliveryFulfillment ??
      null) as DeliveryFulfillmentOutput | null,
    financePayment: (values.financePayment ?? null) as FinancePaymentOutput | null,
    humanApproval: (values.humanApproval ?? "pending") as HumanApprovalStatus,
    humanApprovalNotes:
      typeof values.humanApprovalNotes === "string"
        ? values.humanApprovalNotes
        : undefined,
    monitorProfit: (values.monitorProfit ?? null) as MonitorProfitOutput | null,
    errors: Array.isArray(values.errors)
      ? values.errors.filter((x): x is string => typeof x === "string")
      : [],
  };
}

/** Cold resume when in-memory checkpoints are unavailable (e.g. new serverless instance). */
export function finalizeOrchestrationCold(
  base: OrchestrationPublicState,
  resume: TreasuryResume
): OrchestrationPublicState {
  const humanApproval: HumanApprovalStatus = resume.approved ? "approved" : "rejected";
  const monitorProfit = heuristicMonitor(
    base.sentence,
    resume.approved ? "approved" : "rejected"
  );
  return {
    ...base,
    humanApproval,
    humanApprovalNotes: resume.notes,
    monitorProfit,
  };
}
