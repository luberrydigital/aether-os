import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ProductImage } from "@/components/store/product-image";
import { buildSandboxCheckoutUrl } from "@/lib/payments/checkout-links";
import { cn } from "@/lib/utils";
import { dbGetProduct, dbGetStorefrontBySlug } from "@/lib/db/local-db";

function money(cents: number, currency: string) {
  try {
    return new Intl.NumberFormat(currency === "ZAR" ? "en-ZA" : "en-US", {
      style: "currency",
      currency: currency === "ZAR" ? "ZAR" : "USD",
      maximumFractionDigits: 2,
    }).format(cents / 100);
  } catch {
    return `${(cents / 100).toFixed(2)} ${currency}`;
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string; productId: string }>;
}) {
  const { slug, productId } = await params;
  const product = await dbGetProduct(productId);
  if (!product) notFound();
  const sf = await dbGetStorefrontBySlug(slug);
  if (!sf || sf.id !== product.storefront_id) notFound();

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[oklch(0.07_0.03_280)] text-foreground">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-25%,oklch(0.45_0.22_285_/_0.42),transparent_55%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,oklch(0.05_0.03_280_/_0.96))]" />
      </div>

      <main className="mx-auto max-w-5xl px-5 py-10 md:px-10 md:py-14">
        <Link
          href={`/store/${slug}`}
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "mb-8 text-violet-200 hover:text-white"
          )}
        >
          <ArrowLeft className="mr-2 size-4" aria-hidden />
          Back to {sf.name}
        </Link>

        <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-black/40 shadow-[0_0_80px_-30px_rgba(139,92,246,0.45)]">
            <ProductImage
              src={(product.image_url as string | null) ?? "/placeholder-product.svg"}
              alt={product.title}
              className="aspect-square w-full object-cover"
            />
          </div>

          <Card className="border-white/[0.1] bg-white/[0.03] shadow-[0_0_60px_-28px_rgba(34,211,238,0.18)] ring-1 ring-white/[0.08]">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-white md:text-4xl">
                {product.title}
              </CardTitle>
              {sf.headline ? (
                <CardDescription className="text-base text-zinc-400">
                  {sf.headline}
                </CardDescription>
              ) : null}
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-pretty text-base leading-relaxed text-zinc-300 md:text-lg">
                {product.description}
              </p>
              <p className="font-mono text-4xl font-semibold text-emerald-200">
                {money(product.price_cents, product.currency)}
              </p>
              <div className="flex flex-wrap gap-2">
                {(product.tags ?? []).map((t) => (
                  <Badge
                    key={t}
                    variant="secondary"
                    className="border border-white/10 bg-white/5"
                  >
                    {t}
                  </Badge>
                ))}
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                {(["payfast", "paystack"] as const).map((gw) => (
                  <Link
                    key={gw}
                    href={buildSandboxCheckoutUrl({
                      gateway: gw,
                      slug,
                      storefrontId: sf.id,
                      productId: product.id,
                      title: product.title,
                      priceCents: product.price_cents,
                      currency: product.currency,
                    })}
                    className={cn(
                      buttonVariants({ size: "lg" }),
                      "flex-1 rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cyan-600 font-semibold text-white shadow-[0_0_40px_-10px_rgba(167,139,250,0.65)]"
                    )}
                  >
                    Checkout · {gw}
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
