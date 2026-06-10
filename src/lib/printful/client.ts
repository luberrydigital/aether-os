export type PrintfulStore = { id: number; name?: string };

type PrintfulResponse<T> = { code: number; result: T };

function pfBase() {
  return "https://api.printful.com";
}

function getKey(): string {
  const key = process.env.PRINTFUL_API_KEY?.trim();
  if (!key) {
    throw new Error("Missing PRINTFUL_API_KEY");
  }
  return key;
}

async function pfFetch<T>(
  path: string,
  opts?: { method?: string; body?: unknown; storeId?: string | number }
): Promise<T> {
  const key = getKey();
  const headers: Record<string, string> = {
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
  };
  if (opts?.storeId != null) {
    headers["X-PF-Store-Id"] = String(opts.storeId);
  }
  const res = await fetch(`${pfBase()}${path}`, {
    method: opts?.method ?? "GET",
    headers,
    body: opts?.body == null ? undefined : JSON.stringify(opts.body),
  });
  const raw = await res.text();
  if (!res.ok) {
    throw new Error(`Printful ${res.status}: ${raw.slice(0, 500)}`);
  }
  const json = JSON.parse(raw) as PrintfulResponse<T>;
  return json.result;
}

export async function printfulListStores(): Promise<PrintfulStore[]> {
  // Printful docs: account-level tokens require store context; store-level tokens can call without.
  // This endpoint works for account-level tokens.
  return await pfFetch<PrintfulStore[]>("/stores");
}

export async function printfulResolveStoreId(): Promise<string | null> {
  const explicit = process.env.PRINTFUL_STORE_ID?.trim();
  if (explicit) return explicit;
  try {
    const stores = await printfulListStores();
    const first = stores?.[0]?.id;
    return first != null ? String(first) : null;
  } catch {
    return null;
  }
}

export type PrintfulCatalogProduct = {
  id: number;
  type: string;
  title: string;
  variant_count: number;
};

export async function printfulCatalogProducts(params?: {
  offset?: number;
  limit?: number;
}): Promise<PrintfulCatalogProduct[]> {
  const qs = new URLSearchParams();
  qs.set("offset", String(params?.offset ?? 0));
  qs.set("limit", String(params?.limit ?? 100));
  return await pfFetch<PrintfulCatalogProduct[]>(`/products?${qs.toString()}`);
}

export type PrintfulCatalogVariant = { id: number; name: string };
export async function printfulCatalogProductWithVariants(productId: number): Promise<{
  product: PrintfulCatalogProduct;
  variants: PrintfulCatalogVariant[];
}> {
  return await pfFetch<{ product: PrintfulCatalogProduct; variants: PrintfulCatalogVariant[] }>(
    `/products/${productId}`
  );
}

export type PrintfulSyncVariantInput = {
  external_id: string;
  variant_id: number;
  retail_price: string;
  sku?: string;
  files: { type?: string; url: string }[];
};

export type PrintfulCreateSyncProductInput = {
  sync_product: { external_id: string; name: string; thumbnail?: string };
  sync_variants: PrintfulSyncVariantInput[];
};

export async function printfulCreateSyncProduct(
  storeId: string | number | null,
  body: PrintfulCreateSyncProductInput
): Promise<{
  sync_product: { id: number; external_id: string; name: string; thumbnail_url?: string };
  sync_variants: { id: number; external_id: string; variant_id: number; retail_price: string }[];
}> {
  return await pfFetch(`/store/products`, {
    method: "POST",
    body,
    storeId: storeId ?? undefined,
  });
}

export type PrintfulCreateOrderInput = {
  external_id: string;
  recipient: Record<string, unknown>;
  items: Array<
    | { sync_variant_id: number; quantity: number }
    | { variant_id: number; quantity: number; files: { url: string; type?: string }[] }
  >;
};

export async function printfulCreateOrder(
  storeId: string | number | null,
  body: PrintfulCreateOrderInput,
  confirm = true
): Promise<{ id: number; external_id: string; status: string }> {
  const qs = new URLSearchParams();
  if (confirm) qs.set("confirm", "1");
  return await pfFetch(`/orders?${qs.toString()}`, {
    method: "POST",
    body,
    storeId: storeId ?? undefined,
  });
}

export async function printfulGetOrder(
  storeId: string | number | null,
  id: number | string
): Promise<{ id: number; external_id?: string; status: string; shipments?: unknown[] }> {
  return await pfFetch(`/orders/${id}`, { storeId: storeId ?? undefined });
}

