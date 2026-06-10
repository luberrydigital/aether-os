import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";
import {
  generateReferralCode,
  REFERRAL_PLATFORM_COMMISSION_RATE,
  REFERRAL_SUBSCRIPTION_COMMISSION_RATE,
} from "@/lib/referrals/codes";
import {
  activatePaidPlan,
  cancelTrialNow,
  processUserBilling,
  scheduleCancellation,
  startProTrialFields,
} from "@/lib/billing/process-user";
import type { BillingSnapshot } from "@/lib/billing/trial";
import { getTierDefinition } from "@/lib/subscriptions/tiers";
import type { SubscriptionTier } from "@/lib/subscriptions/tiers";

export type SubscriptionStatus = "trial" | "active" | "cancelled" | "free";

export type DbUser = {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: string;
  displayName?: string | null;
  subscriptionTier?: SubscriptionTier;
  subscriptionStatus?: SubscriptionStatus;
  paidTier?: SubscriptionTier | null;
  trialStartedAt?: string | null;
  trialEndsAt?: string | null;
  cancelAtPeriodEnd?: boolean;
  cancelEffectiveAt?: string | null;
  emailNotifications?: {
    welcomeSent?: boolean;
    trialReminderSent?: boolean;
    trialEndedSent?: boolean;
  };
  referralCode?: string;
  referredByUserId?: string | null;
  agentGenerationsToday?: number;
  agentGenerationsDate?: string;
  ownedAgentIds?: string[];
  coachLastDate?: string;
};

export type ReferralEarningRow = {
  id: string;
  referrer_user_id: string;
  referred_user_id: string;
  revenue_log_id: string | null;
  platform_fee_cents: number;
  referral_earning_cents: number;
  currency: "USD" | "ZAR";
  earning_type: "platform_fee" | "subscription";
  subscription_tier?: string;
  created_at: string;
};

export type SocialPostRow = {
  id: string;
  user_id: string;
  company_id: string | null;
  platform: "facebook" | "instagram" | "tiktok" | "x";
  content: string;
  status: "scheduled" | "posted" | "draft";
  scheduled_at: string;
  created_at: string;
};

export type CompanyRow = {
  id: string;
  user_id: string;
  sentence: string;
  agent_plan: unknown;
  creator_blueprint: unknown;
  created_at: string;
  total_revenue_usd_cents: number;
  total_revenue_zar_cents: number;
  total_platform_fee_usd_cents: number;
  total_platform_fee_zar_cents: number;
  total_net_usd_cents: number;
  total_net_zar_cents: number;
};

export type RevenueLogRow = {
  id: string;
  company_id: string;
  user_id: string;
  gateway: string;
  currency: "USD" | "ZAR";
  gross_cents: number;
  platform_fee_rate: number;
  platform_fee_cents: number;
  net_cents: number;
  reference: string | null;
  note: string | null;
  created_at: string;
};

export type StorefrontRow = {
  id: string;
  company_id: string;
  slug: string;
  name: string;
  headline: string | null;
  description: string | null;
  theme: Record<string, unknown>;
  printful_store_id: string | null;
  created_at: string;
};

export type ProductRow = {
  id: string;
  storefront_id: string;
  title: string;
  description: string;
  price_cents: number;
  currency: string;
  image_url: string | null;
  tags: string[];
  pod: Record<string, unknown>;
  created_at: string;
};

export type PrintfulOrderRow = {
  id: string;
  company_id: string;
  storefront_id: string;
  product_id: string;
  user_id: string | null;
  currency: "USD" | "ZAR";
  gross_cents: number;
  platform_fee_rate: number;
  platform_fee_cents: number;
  net_cents: number;
  customer_email: string | null;
  recipient: Record<string, unknown>;
  printful_order_id: string | null;
  printful_status: string | null;
  tracking_number: string | null;
  tracking_url: string | null;
  created_at: string;
  updated_at: string;
};

type PasswordResetRow = {
  email: string;
  otp_hash: string;
  otp_expires_at: string;
  otp_attempts: number;
  last_otp_sent_at: string;
  otp_send_count: number;
  reset_token_hash: string | null;
  reset_token_expires_at: string | null;
  updated_at: string;
};

type DbShape = {
  users: DbUser[];
  companies: CompanyRow[];
  revenue_logs: RevenueLogRow[];
  storefronts: StorefrontRow[];
  products: ProductRow[];
  printful_orders: PrintfulOrderRow[];
  referral_earnings: ReferralEarningRow[];
  social_posts: SocialPostRow[];
  orchestration_sessions: Array<{
    thread_id: string;
    user_id: string;
    status: "awaiting_approval" | "complete";
    state: unknown;
    result?: unknown;
    interrupt?: unknown;
    updated_at: string;
  }>;
  password_resets: PasswordResetRow[];
};

const DEFAULT_DB: DbShape = {
  users: [],
  companies: [],
  revenue_logs: [],
  storefronts: [],
  products: [],
  printful_orders: [],
  referral_earnings: [],
  social_posts: [],
  orchestration_sessions: [],
  password_resets: [],
};

function dbPath() {
  return process.env.AETHER_DB_PATH?.trim()
    ? path.resolve(process.env.AETHER_DB_PATH.trim())
    : path.resolve(process.cwd(), "data", "aether-db.json");
}

function parseDbShape(raw: string): DbShape {
  const json = JSON.parse(raw) as Partial<DbShape>;
  const anyJson = json as unknown as Record<string, unknown>;
  const sessionsRaw = anyJson.orchestration_sessions;
  const resetsRaw = anyJson.password_resets;
  return {
    ...DEFAULT_DB,
    ...json,
    users: Array.isArray(json.users) ? json.users : [],
    companies: Array.isArray(json.companies) ? json.companies : [],
    revenue_logs: Array.isArray(json.revenue_logs) ? json.revenue_logs : [],
    storefronts: Array.isArray(json.storefronts) ? json.storefronts : [],
    products: Array.isArray(json.products) ? json.products : [],
    printful_orders: Array.isArray(json.printful_orders) ? json.printful_orders : [],
    referral_earnings: Array.isArray(json.referral_earnings) ? json.referral_earnings : [],
    social_posts: Array.isArray(json.social_posts) ? json.social_posts : [],
    orchestration_sessions: Array.isArray(sessionsRaw)
      ? (sessionsRaw as DbShape["orchestration_sessions"])
      : [],
    password_resets: Array.isArray(resetsRaw)
      ? (resetsRaw as PasswordResetRow[])
      : [],
  };
}

/** In-memory DB + serialized I/O: one JSON parse per process, safe under concurrent requests. */
let memory: DbShape | null = null;
let ioQueue: Promise<void> = Promise.resolve();

function withStorage<T>(fn: (db: DbShape) => Promise<T>): Promise<T> {
  const job = ioQueue.then(() => runStorage(fn));
  ioQueue = job.then(() => {}).catch(() => {});
  return job;
}

async function runStorage<T>(fn: (db: DbShape) => Promise<T>): Promise<T> {
  if (!memory) {
    const p = dbPath();
    try {
      const raw = await fs.readFile(p, "utf8");
      memory = parseDbShape(raw);
    } catch {
      await fs.mkdir(path.dirname(p), { recursive: true });
      memory = structuredClone(DEFAULT_DB);
      await fs.writeFile(p, JSON.stringify(memory, null, 2), "utf8");
    }
  }
  return await fn(memory);
}

async function flushDb(): Promise<void> {
  if (!memory) return;
  const p = dbPath();
  await fs.mkdir(path.dirname(p), { recursive: true });
  await fs.writeFile(p, JSON.stringify(memory, null, 2), "utf8");
}

async function readDb(): Promise<DbShape> {
  return withStorage(async (db) => db);
}

async function writeDb(next: DbShape): Promise<void> {
  await withStorage(async () => {
    memory = next;
    await flushDb();
  });
}

export function newId(): string {
  return crypto.randomUUID();
}

function normalizeUser(user: DbUser): DbUser {
  if (!user.subscriptionTier) user.subscriptionTier = "free";
  if (!user.subscriptionStatus) {
    user.subscriptionStatus = user.trialEndsAt ? "trial" : "free";
  }
  if (!user.referralCode) user.referralCode = generateReferralCode(user.id);
  return user;
}

async function persistUserIfChanged(
  db: DbShape,
  userId: string,
  processed: Awaited<ReturnType<typeof processUserBilling>>
): Promise<DbUser> {
  const idx = db.users.findIndex((u) => u.id === userId);
  if (idx < 0) return processed.user;
  if (processed.changed) {
    db.users[idx] = processed.user;
    await writeDb(db);
  }
  return normalizeUser(db.users[idx]);
}

export async function dbGetUserByEmail(email: string): Promise<DbUser | null> {
  const db = await readDb();
  const e = email.trim().toLowerCase();
  const user = db.users.find((u) => u.email.toLowerCase() === e) ?? null;
  return user ? normalizeUser(user) : null;
}

export async function dbGetUserById(id: string): Promise<DbUser | null> {
  const db = await readDb();
  const user = db.users.find((u) => u.id === id) ?? null;
  return user ? normalizeUser(user) : null;
}

export async function dbGetUserWithBilling(id: string): Promise<{
  user: DbUser;
  billing: BillingSnapshot;
} | null> {
  const db = await readDb();
  const raw = db.users.find((u) => u.id === id);
  if (!raw) return null;
  const processed = await processUserBilling(normalizeUser({ ...raw }));
  const user = await persistUserIfChanged(db, id, processed);
  return { user, billing: processed.billing };
}

export async function dbGetUserByReferralCode(code: string): Promise<DbUser | null> {
  const db = await readDb();
  const normalized = code.trim().toUpperCase();
  const user = db.users.find((u) => (u.referralCode ?? generateReferralCode(u.id)) === normalized) ?? null;
  return user ? normalizeUser(user) : null;
}

export async function dbCreateUser(params: {
  email: string;
  passwordHash: string;
  referredByUserId?: string | null;
}): Promise<DbUser> {
  const db = await readDb();
  const id = newId();
  const row: DbUser = {
    id,
    email: params.email.trim().toLowerCase(),
    passwordHash: params.passwordHash,
    createdAt: new Date().toISOString(),
    referralCode: generateReferralCode(id),
    referredByUserId: params.referredByUserId ?? null,
    agentGenerationsToday: 0,
    agentGenerationsDate: new Date().toISOString().slice(0, 10),
    displayName: null,
    ...startProTrialFields(),
  };
  db.users.push(row);
  await writeDb(db);
  const processed = await processUserBilling(row);
  if (processed.changed) {
    const idx = db.users.findIndex((u) => u.id === id);
    if (idx >= 0) {
      db.users[idx] = processed.user;
      await writeDb(db);
    }
  }
  return processed.user;
}

export async function dbCreateOAuthUser(params: {
  email: string;
  displayName?: string | null;
  referredByUserId?: string | null;
}): Promise<DbUser> {
  const unusable = await import("bcryptjs").then((b) =>
    b.hash(crypto.randomUUID(), 10)
  );
  return dbCreateUser({
    email: params.email,
    passwordHash: unusable,
    referredByUserId: params.referredByUserId,
  }).then(async (user) => {
    if (params.displayName) {
      return (await dbUpdateUserProfile(user.id, { displayName: params.displayName })) ?? user;
    }
    return user;
  });
}

export async function dbUpdateUserProfile(
  userId: string,
  patch: { displayName?: string | null; email?: string }
): Promise<DbUser | null> {
  const db = await readDb();
  const user = db.users.find((u) => u.id === userId);
  if (!user) return null;
  if (patch.displayName !== undefined) user.displayName = patch.displayName;
  if (patch.email?.trim()) user.email = patch.email.trim().toLowerCase();
  await writeDb(db);
  return normalizeUser(user);
}

function creditSubscriptionReferral(
  db: DbShape,
  referredUser: DbUser,
  tier: SubscriptionTier
): void {
  const referrerId = referredUser.referredByUserId;
  if (!referrerId || referrerId === referredUser.id) return;
  if (tier === "free") return;

  const tierDef = getTierDefinition(tier);
  const earningCents = Math.round(tierDef.priceZar * 100 * REFERRAL_SUBSCRIPTION_COMMISSION_RATE);
  if (earningCents <= 0) return;

  db.referral_earnings.push({
    id: newId(),
    referrer_user_id: referrerId,
    referred_user_id: referredUser.id,
    revenue_log_id: null,
    platform_fee_cents: tierDef.priceZar * 100,
    referral_earning_cents: earningCents,
    currency: "ZAR",
    earning_type: "subscription",
    subscription_tier: tier,
    created_at: new Date().toISOString(),
  });
}

export async function dbSetUserSubscription(userId: string, tier: SubscriptionTier): Promise<DbUser | null> {
  const db = await readDb();
  const user = db.users.find((u) => u.id === userId);
  if (!user) return null;
  const prevPaid = user.paidTier ?? user.subscriptionTier ?? "free";

  if (tier === "free") {
    Object.assign(user, cancelTrialNow());
  } else {
    Object.assign(user, activatePaidPlan(tier));
    if (tier !== prevPaid) {
      creditSubscriptionReferral(db, user, tier);
    }
  }

  await writeDb(db);
  const processed = await processUserBilling(normalizeUser(user));
  return persistUserIfChanged(db, userId, processed);
}

export async function dbCancelUserSubscription(userId: string): Promise<{
  user: DbUser;
  billing: BillingSnapshot;
  immediate: boolean;
} | null> {
  const db = await readDb();
  const user = db.users.find((u) => u.id === userId);
  if (!user) return null;

  let immediate = false;
  if (user.subscriptionStatus === "trial") {
    Object.assign(user, cancelTrialNow());
    immediate = true;
  } else if (user.subscriptionStatus === "active" || user.paidTier) {
    Object.assign(user, scheduleCancellation());
    immediate = false;
  } else {
    Object.assign(user, cancelTrialNow());
    immediate = true;
  }

  await writeDb(db);
  const processed = await processUserBilling(normalizeUser(user));
  const saved = await persistUserIfChanged(db, userId, processed);
  return { user: saved, billing: processed.billing, immediate };
}

export async function dbAddOwnedAgent(userId: string, agentId: string): Promise<void> {
  const db = await readDb();
  const user = db.users.find((u) => u.id === userId);
  if (!user) return;
  const owned = new Set(user.ownedAgentIds ?? []);
  owned.add(agentId);
  user.ownedAgentIds = [...owned];
  await writeDb(db);
}

export async function dbListUserCompanies(userId: string): Promise<CompanyRow[]> {
  const db = await readDb();
  return db.companies
    .filter((c) => c.user_id === userId)
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export async function dbCloneCompany(sourceId: string, userId: string): Promise<CompanyRow | null> {
  const db = await readDb();
  const source = db.companies.find((c) => c.id === sourceId && c.user_id === userId);
  if (!source) return null;

  const clone: CompanyRow = {
    ...structuredClone(source),
    id: newId(),
    sentence: `${source.sentence} (Clone)`,
    created_at: new Date().toISOString(),
    total_revenue_usd_cents: 0,
    total_revenue_zar_cents: 0,
    total_platform_fee_usd_cents: 0,
    total_platform_fee_zar_cents: 0,
    total_net_usd_cents: 0,
    total_net_zar_cents: 0,
  };
  db.companies.push(clone);
  await writeDb(db);
  return clone;
}

export async function dbInsertSocialPosts(
  rows: Omit<SocialPostRow, "id" | "created_at">[]
): Promise<SocialPostRow[]> {
  const db = await readDb();
  const created: SocialPostRow[] = rows.map((row) => ({
    ...row,
    id: newId(),
    created_at: new Date().toISOString(),
  }));
  db.social_posts.push(...created);
  await writeDb(db);
  return created;
}

export async function dbListSocialPosts(userId: string, limit = 20): Promise<SocialPostRow[]> {
  const db = await readDb();
  return db.social_posts
    .filter((p) => p.user_id === userId)
    .sort((a, b) => b.scheduled_at.localeCompare(a.scheduled_at))
    .slice(0, limit);
}

export async function dbIncrementAgentGeneration(userId: string): Promise<{ count: number; date: string }> {
  const db = await readDb();
  const user = db.users.find((u) => u.id === userId);
  if (!user) return { count: 0, date: new Date().toISOString().slice(0, 10) };
  const today = new Date().toISOString().slice(0, 10);
  if (user.agentGenerationsDate !== today) {
    user.agentGenerationsDate = today;
    user.agentGenerationsToday = 0;
  }
  user.agentGenerationsToday = (user.agentGenerationsToday ?? 0) + 1;
  await writeDb(db);
  return { count: user.agentGenerationsToday, date: today };
}

export async function dbInsertCompany(row: Omit<CompanyRow, "id" | "created_at">) {
  const db = await readDb();
  const r: CompanyRow = {
    ...row,
    id: newId(),
    created_at: new Date().toISOString(),
  };
  db.companies.push(r);
  await writeDb(db);
  return r;
}

export async function dbLatestCompanyForUser(userId: string): Promise<CompanyRow | null> {
  const db = await readDb();
  return (
    db.companies
      .filter((c) => c.user_id === userId)
      .sort((a, b) => b.created_at.localeCompare(a.created_at))[0] ?? null
  );
}

export async function dbGetCompanyById(id: string): Promise<CompanyRow | null> {
  const db = await readDb();
  return db.companies.find((c) => c.id === id) ?? null;
}

export async function dbListCompanies(limit = 200): Promise<CompanyRow[]> {
  const db = await readDb();
  return db.companies
    .slice()
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, limit);
}

export async function dbSetStorefrontPrintfulStoreId(
  storefrontId: string,
  printful_store_id: string | null
): Promise<void> {
  const db = await readDb();
  const s = db.storefronts.find((x) => x.id === storefrontId);
  if (!s) return;
  s.printful_store_id = printful_store_id;
  await writeDb(db);
}

function creditReferralEarning(
  db: DbShape,
  r: RevenueLogRow,
  referredUser: DbUser
): void {
  const referrerId = referredUser.referredByUserId;
  if (!referrerId || referrerId === referredUser.id) return;
  const referrer = db.users.find((u) => u.id === referrerId);
  if (!referrer) return;

  const referralEarningCents = Math.round(
    r.platform_fee_cents * REFERRAL_PLATFORM_COMMISSION_RATE
  );
  if (referralEarningCents <= 0) return;

  db.referral_earnings.push({
    id: newId(),
    referrer_user_id: referrerId,
    referred_user_id: referredUser.id,
    revenue_log_id: r.id,
    platform_fee_cents: r.platform_fee_cents,
    referral_earning_cents: referralEarningCents,
    currency: r.currency,
    earning_type: "platform_fee",
    created_at: r.created_at,
  });
}

export async function dbInsertRevenueLog(row: Omit<RevenueLogRow, "id" | "created_at">) {
  const db = await readDb();
  const r: RevenueLogRow = { ...row, id: newId(), created_at: new Date().toISOString() };
  db.revenue_logs.push(r);
  const company = db.companies.find((c) => c.id === r.company_id);
  if (company) {
    if (r.currency === "USD") {
      company.total_revenue_usd_cents += r.gross_cents;
      company.total_platform_fee_usd_cents += r.platform_fee_cents;
      company.total_net_usd_cents += r.net_cents;
    } else {
      company.total_revenue_zar_cents += r.gross_cents;
      company.total_platform_fee_zar_cents += r.platform_fee_cents;
      company.total_net_zar_cents += r.net_cents;
    }
  }
  const seller = db.users.find((u) => u.id === r.user_id);
  if (seller) creditReferralEarning(db, r, seller);
  await writeDb(db);
  return r;
}

export async function dbListReferralEarnings(referrerUserId: string, limit = 50): Promise<ReferralEarningRow[]> {
  const db = await readDb();
  return db.referral_earnings
    .filter((e) => e.referrer_user_id === referrerUserId)
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, limit);
}

export async function dbCountReferrals(referrerUserId: string): Promise<number> {
  const db = await readDb();
  return db.users.filter((u) => u.referredByUserId === referrerUserId).length;
}

export async function dbReferralEarningsTotals(referrerUserId: string): Promise<{
  usdCents: number;
  zarCents: number;
}> {
  const db = await readDb();
  let usdCents = 0;
  let zarCents = 0;
  for (const e of db.referral_earnings) {
    if (e.referrer_user_id !== referrerUserId) continue;
    if (e.currency === "USD") usdCents += e.referral_earning_cents;
    else zarCents += e.referral_earning_cents;
  }
  return { usdCents, zarCents };
}

export async function dbListRevenueLogs(companyId: string, limit = 25): Promise<RevenueLogRow[]> {
  const db = await readDb();
  return db.revenue_logs
    .filter((r) => r.company_id === companyId)
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, limit);
}

export async function dbGetRevenueLogByReference(reference: string): Promise<RevenueLogRow | null> {
  const db = await readDb();
  const ref = reference.trim();
  if (!ref) return null;
  return db.revenue_logs.find((r) => (r.reference ?? "") === ref) ?? null;
}

export async function dbUpsertStorefront(row: Omit<StorefrontRow, "id" | "created_at">) {
  const db = await readDb();
  const existing = db.storefronts.find((s) => s.slug === row.slug);
  if (existing) {
    Object.assign(existing, row);
    await writeDb(db);
    return existing;
  }
  const r: StorefrontRow = { ...row, id: newId(), created_at: new Date().toISOString() };
  db.storefronts.push(r);
  await writeDb(db);
  return r;
}

export async function dbGetStorefrontBySlug(slug: string): Promise<StorefrontRow | null> {
  const db = await readDb();
  return db.storefronts.find((s) => s.slug === slug) ?? null;
}

export async function dbListStorefronts(limit = 200): Promise<StorefrontRow[]> {
  const db = await readDb();
  return db.storefronts
    .slice()
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, limit);
}

export async function dbGetStorefrontById(id: string): Promise<StorefrontRow | null> {
  const db = await readDb();
  return db.storefronts.find((s) => s.id === id) ?? null;
}

export async function dbInsertProduct(row: Omit<ProductRow, "id" | "created_at">) {
  const db = await readDb();
  const r: ProductRow = { ...row, id: newId(), created_at: new Date().toISOString() };
  db.products.push(r);
  await writeDb(db);
  return r;
}

export async function dbUpdateProduct(id: string, patch: Partial<ProductRow>) {
  const db = await readDb();
  const p = db.products.find((x) => x.id === id);
  if (!p) return null;
  Object.assign(p, patch);
  await writeDb(db);
  return p;
}

export async function dbListProducts(storefrontId: string): Promise<ProductRow[]> {
  const db = await readDb();
  return db.products
    .filter((p) => p.storefront_id === storefrontId)
    .sort((a, b) => a.created_at.localeCompare(b.created_at));
}

export async function dbGetProduct(id: string): Promise<ProductRow | null> {
  const db = await readDb();
  return db.products.find((p) => p.id === id) ?? null;
}

export async function dbInsertPrintfulOrder(row: Omit<PrintfulOrderRow, "id" | "created_at" | "updated_at">) {
  const db = await readDb();
  const now = new Date().toISOString();
  const r: PrintfulOrderRow = { ...row, id: newId(), created_at: now, updated_at: now };
  db.printful_orders.push(r);
  await writeDb(db);
  return r;
}

export async function dbListPrintfulOrders(companyId: string, limit = 25): Promise<PrintfulOrderRow[]> {
  const db = await readDb();
  return db.printful_orders
    .filter((o) => o.company_id === companyId)
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, limit);
}

export async function dbUpsertOrchestrationSession(row: {
  thread_id: string;
  user_id: string;
  status: "awaiting_approval" | "complete";
  state: unknown;
  result?: unknown;
  interrupt?: unknown;
}): Promise<void> {
  const db = await readDb();
  const existing = db.orchestration_sessions.find(
    (s) => s.thread_id === row.thread_id && s.user_id === row.user_id
  );
  const updated_at = new Date().toISOString();
  if (existing) {
    Object.assign(existing, row, { updated_at });
  } else {
    db.orchestration_sessions.push({ ...row, updated_at });
  }
  await writeDb(db);
}

export async function dbGetOrchestrationSession(params: {
  thread_id: string;
  user_id: string;
}): Promise<DbShape["orchestration_sessions"][number] | null> {
  const db = await readDb();
  return (
    db.orchestration_sessions.find(
      (s) => s.thread_id === params.thread_id && s.user_id === params.user_id
    ) ?? null
  );
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function dbGetPasswordReset(email: string): Promise<PasswordResetRow | null> {
  const db = await readDb();
  const e = normalizeEmail(email);
  return db.password_resets.find((r) => r.email === e) ?? null;
}

export async function dbUpsertPasswordResetOtp(params: {
  email: string;
  otpHash: string;
  otpExpiresAt: string;
  lastOtpSentAt: string;
  otpSendCount: number;
}): Promise<void> {
  const db = await readDb();
  const e = normalizeEmail(params.email);
  const now = new Date().toISOString();
  const idx = db.password_resets.findIndex((r) => r.email === e);
  const row: PasswordResetRow = {
    email: e,
    otp_hash: params.otpHash,
    otp_expires_at: params.otpExpiresAt,
    otp_attempts: 0,
    last_otp_sent_at: params.lastOtpSentAt,
    otp_send_count: params.otpSendCount,
    reset_token_hash: null,
    reset_token_expires_at: null,
    updated_at: now,
  };
  if (idx >= 0) {
    db.password_resets[idx] = row;
  } else {
    db.password_resets.push(row);
  }
  await writeDb(db);
}

export async function dbIncrementPasswordResetOtpAttempts(email: string): Promise<number> {
  const db = await readDb();
  const e = normalizeEmail(email);
  const row = db.password_resets.find((r) => r.email === e);
  if (!row) return 0;
  row.otp_attempts += 1;
  row.updated_at = new Date().toISOString();
  await writeDb(db);
  return row.otp_attempts;
}

export async function dbSetPasswordResetToken(params: {
  email: string;
  resetTokenHash: string;
  resetTokenExpiresAt: string;
}): Promise<void> {
  const db = await readDb();
  const e = normalizeEmail(params.email);
  const row = db.password_resets.find((r) => r.email === e);
  if (!row) return;
  row.reset_token_hash = params.resetTokenHash;
  row.reset_token_expires_at = params.resetTokenExpiresAt;
  row.otp_hash = "";
  row.otp_expires_at = new Date(0).toISOString();
  row.updated_at = new Date().toISOString();
  await writeDb(db);
}

export async function dbDeletePasswordReset(email: string): Promise<void> {
  const db = await readDb();
  const e = normalizeEmail(email);
  db.password_resets = db.password_resets.filter((r) => r.email !== e);
  await writeDb(db);
}

export async function dbUpdateUserPassword(
  userId: string,
  passwordHash: string
): Promise<DbUser | null> {
  const db = await readDb();
  const user = db.users.find((u) => u.id === userId);
  if (!user) return null;
  user.passwordHash = passwordHash;
  await writeDb(db);
  return normalizeUser(user);
}

