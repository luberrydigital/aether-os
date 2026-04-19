export type BusinessDesignerOutput = {
  businessName: string;
  tagline: string;
  executiveSummary: string;
  targetCustomer: string;
  offer: string;
  agentTeam: { name: string; mandate: string }[];
  risks: string[];
};

export type MarketingSalesOutput = {
  positioning: string;
  primaryChannels: string[];
  pipelineStages: string[];
  firstSevenDayPlan: string;
};

export type DeliveryFulfillmentOutput = {
  deliveryModel: string;
  sla: string;
  fulfillmentSteps: string[];
  automationHooks: string[];
};

export type FinancePaymentOutput = {
  currency: "USD";
  /** Gross revenue assumption for week 1 (mock). */
  projectedWeekOneGross: number;
  /** Platform fee percentage (e.g. 0.20 for 20%). */
  platformFeeRate: number;
  platformFeeAmount: number;
  netAfterPlatformFee: number;
  /** Human-readable range source string. */
  feeBandLabel: string;
  treasuryNote: string;
};

export type MonitorProfitOutput = {
  status: "live" | "blocked_pending_human" | "blocked_rejected";
  mockEarningsPulse: string;
  rollingTotalUsd: number;
  lastUpdatedIso: string;
  alerts: string[];
};

export type TreasuryInterruptPayload = {
  gate: "treasury_before_money_movement";
  title: string;
  message: string;
  proposedActions: string[];
  financeSnapshot: FinancePaymentOutput;
};

export type TreasuryResume = {
  approved: boolean;
  actor?: string;
  notes?: string;
};

export type HumanApprovalStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "skipped";

export type OrchestrationPublicState = {
  sentence: string;
  businessDesigner: BusinessDesignerOutput | null;
  marketingSales: MarketingSalesOutput | null;
  deliveryFulfillment: DeliveryFulfillmentOutput | null;
  financePayment: FinancePaymentOutput | null;
  humanApproval: HumanApprovalStatus;
  humanApprovalNotes?: string;
  monitorProfit: MonitorProfitOutput | null;
  errors: string[];
};
