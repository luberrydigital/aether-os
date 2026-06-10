import type { BusinessDesignerOutput } from "@/lib/agents/orchestration-types";
import { generateAndStoreProductImage } from "@/lib/images/generate-product-image";
import { slugifyStoreSlug } from "@/lib/storefront/slug";
import {
  dbInsertProduct,
  dbUpsertStorefront,
  dbUpdateProduct,
} from "@/lib/db/local-db";
import {
  printfulCatalogProductWithVariants,
  printfulCatalogProducts,
  printfulCreateSyncProduct,
  printfulResolveStoreId,
} from "@/lib/printful/client";

async function pickUniqueSlug(
  baseSlug: string
): Promise<string> {
  const root = slugifyStoreSlug(baseSlug);
  // Local DB MVP: accept slug; append timestamp if needed.
  return `${root}-${Date.now().toString(36)}`;
}

export function shouldCreateStorefront(designer: BusinessDesignerOutput): boolean {
  return Boolean(designer.storefront?.products?.length);
}

export async function createStorefrontFromDesigner(
  params: {
    companyId: string;
    userId: string;
    designer: BusinessDesignerOutput;
  }
): Promise<
  | { ok: true; slug: string; storefrontId: string }
  | { ok: false; reason: string }
> {
  const sf = params.designer.storefront;
  if (!sf?.products?.length) {
    return { ok: false, reason: "No storefront payload on designer output." };
  }

  const slug = await pickUniqueSlug(sf.slug);
  const name = sf.brandName?.trim() || params.designer.businessName;
  const headline = sf.headline?.trim() || name;
  const description = sf.description?.trim() || params.designer.executiveSummary;

  const storefrontRow = await dbUpsertStorefront({
    company_id: params.companyId,
    slug,
    name,
    headline,
    description,
    theme: { accent: "violet", mode: "dark" },
    printful_store_id: null,
  });
  const storefrontId = storefrontRow.id;

  const storeId = await printfulResolveStoreId();
  if (storeId) await dbUpsertStorefront({ ...storefrontRow, printful_store_id: storeId });

  async function resolveCatalogProductId(kind: string): Promise<number | null> {
    // kind is a small label we put in pod.externalSku (e.g. "T-SHIRT", "HOODIE", "MUG", "PHONE_CASE")
    const target = kind.toUpperCase();
    for (let page = 0; page < 5; page += 1) {
      const rows = await printfulCatalogProducts({ offset: page * 100, limit: 100 });
      const hit = rows.find((p) => (p.type ?? "").toUpperCase() === target);
      if (hit?.id) return hit.id;
      if (!rows.length) break;
    }
    return null;
  }

  for (const p of sf.products) {
    const prod = await dbInsertProduct({
      storefront_id: storefrontId,
      title: p.title,
      description: p.description,
      price_cents: p.priceCents,
      currency: p.currency,
      image_url: null,
      tags: p.tags,
      pod: (p.pod ?? { provider: null }) as Record<string, unknown>,
    });
    const productId = prod.id;
    const imageUrl = await generateAndStoreProductImage({
      prompt: p.imagePrompt,
    });

    await dbUpdateProduct(productId, { image_url: imageUrl });

    if (p.pod?.provider === "printful" && storeId) {
      // Create a real synced Printful product with a few real variants.
      const kind = p.pod.externalSku?.trim() || "T-SHIRT";
      const catalogProductId = await resolveCatalogProductId(kind);
      if (!catalogProductId) continue;

      const cat = await printfulCatalogProductWithVariants(catalogProductId);
      const variantIds = (cat.variants ?? []).slice(0, 4).map((v) => v.id).filter(Boolean);
      if (!variantIds.length) continue;

      const externalProductId = `aether-${storefrontId}-${productId}`;
      const body = {
        sync_product: {
          external_id: externalProductId,
          name: p.title,
          thumbnail: imageUrl.startsWith("http") ? imageUrl : undefined,
        },
        sync_variants: variantIds.map((vid) => ({
          external_id: `${externalProductId}-${vid}`,
          variant_id: vid,
          retail_price: (p.priceCents / 100).toFixed(2),
          files: [{ type: "default", url: imageUrl }],
        })),
      };

      try {
        const synced = await printfulCreateSyncProduct(storeId, body);
        const syncProductId = synced.sync_product?.id;
        const syncVariantIds = synced.sync_variants?.map((v) => v.id) ?? [];
        await dbUpdateProduct(productId, {
          pod: {
            ...(p.pod ?? { provider: "printful" }),
            provider: "printful",
            externalSku: kind,
            printful: { storeId, syncProductId, syncVariantIds, catalogProductId },
          } as Record<string, unknown>,
        });
      } catch (e) {
        console.warn("Printful sync failed:", e);
      }
    }
  }

  return { ok: true, slug, storefrontId };
}
