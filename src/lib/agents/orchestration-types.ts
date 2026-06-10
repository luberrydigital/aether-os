export type PodHook = {
  provider: "printful" | "printify" | null;
  externalSku?: string | null;
};

export type StorefrontProductDesigner = {
  title: string;
  description: string;
  priceCents: number;
  currency: "USD" | "ZAR";
  /** Prompt for AI image generation (OpenAI DALL·E when configured). */
  imagePrompt: string;
  tags: string[];
  /** Phase 2: Print-on-demand integration (Printful / Printify). */
  pod?: PodHook;
};

export type StorefrontDesignerPayload = {
  /** URL-safe unique slug for /store/<slug> */
  slug: string;
  brandName: string;
  headline: string;
  description: string;
  products: StorefrontProductDesigner[];
};

export type BusinessDesignerOutput = {
  businessName: string;
  tagline: string;
  executiveSummary: string;
  targetCustomer: string;
  offer: string;
  agentTeam: { name: string; mandate: string }[];
  risks: string[];
  /** Present for ecommerce / DTC launches — drives real storefront + products. */
  storefront?: StorefrontDesignerPayload | null;
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
  /** Gross revenue assumption for week 1 (planning estimate). */
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
  /** Human-readable monitor line (must not invent money). */
  earningsPulse: string;
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
