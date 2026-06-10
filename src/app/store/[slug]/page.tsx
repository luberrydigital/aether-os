import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Sparkles } from "lucide-react";
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
import { dbGetStorefrontBySlug, dbListProducts } from "@/lib/db/local-db";

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

export default async function StorefrontPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const s = await dbGetStorefrontBySlug(slug);
  if (!s) notFound();
  const products = await dbListProducts(s.id);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[oklch(0.07_0.03_280)] text-foreground">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-25%,oklch(0.45_0.22_285_/_0.42),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_100%_0%,oklch(0.32_0.14_200_/_0.18),transparent_50%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,oklch(0.05_0.03_280_/_0.96))]" />
      </div>

      <header className="border-b border-white/[0.08] bg-black/35 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-6 md:px-10">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-violet-200/90">
              Aether OS · Storefront
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-white md:text-4xl">
              {s.name}
            </h1>
            {s.headline ? (
              <p className="mt-2 max-w-2xl text-pretty text-base text-zinc-400 md:text-lg">
                {s.headline}
              </p>
            ) : null}
          </div>
          <Badge className="border border-emerald-500/30 bg-emerald-500/10 text-emerald-100">
            Live preview
          </Badge>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-12 px-5 py-12 md:px-10 md:py-16">
        {s.description ? (
          <p className="max-w-3xl text-pretty text-lg leading-relaxed text-zinc-300 md:text-xl">
            {s.description}
          </p>
        ) : null}

        <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {products.map((p, index) => (
            <Card
              key={p.id}
              className="group relative overflow-hidden border-white/[0.1] bg-gradient-to-b from-white/[0.05] to-transparent shadow-[0_0_60px_-28px_rgba(139,92,246,0.35)] ring-1 ring-white/[0.08] transition hover:-translate-y-1 hover:ring-violet-400/25 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
            >
              <CardHeader className="pb-0">
                <CardTitle className="text-lg text-white md:text-xl">
                  {p.title}
                </CardTitle>
                <CardDescription className="line-clamp-3 text-sm md:text-base">
                  {p.description}
                </CardDescription>
              </CardHeader>
              <div className="relative mx-4 aspect-[4/3] overflow-hidden rounded-2xl border border-white/10 bg-black/40 md:mx-6">
                <ProductImage
                  src={p.image_url}
                  alt=""
                  priority={index < 3}
                  className="object-cover transition duration-700 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              </div>
              <CardContent className="space-y-4">
                <p className="font-mono text-2xl font-semibold text-emerald-200">
                  {money(p.price_cents, p.currency)}
                </p>
                <div className="flex flex-wrap gap-2">
                  {(p.tags ?? []).slice(0, 6).map((t) => (
                    <Badge
                      key={t}
                      variant="secondary"
                      className="border border-white/10 bg-white/5 text-xs text-zinc-200"
                    >
                      {t}
                    </Badge>
                  ))}
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                  <Link
                    href={`/store/${slug}/product/${p.id}`}
                    className={cn(
                      buttonVariants({ variant: "outline" }),
                      "border-white/15 bg-black/30 text-white hover:border-violet-400/40"
                    )}
                  >
                    Details
                    <ArrowRight className="ml-2 size-4" aria-hidden />
                  </Link>
                  <div className="flex flex-wrap gap-2">
                    {(["payfast", "paystack"] as const).map((gw) => (
                      <Link
                        key={gw}
                        href={buildSandboxCheckoutUrl({
                          gateway: gw,
                          slug,
                          storefrontId: s.id,
                          productId: p.id,
                          title: p.title,
                          priceCents: p.price_cents,
                          currency: p.currency,
                        })}
                        className={cn(
                          buttonVariants({ size: "sm" }),
                          "rounded-lg bg-gradient-to-r from-violet-600/80 to-cyan-600/70 text-xs font-semibold text-white"
                        )}
                      >
                        Buy · {gw}
                      </Link>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>

        <div className="flex items-center justify-center gap-2 text-xs text-zinc-500">
          <Sparkles className="size-3.5 text-violet-300" aria-hidden />
          Sandbox commerce — swap checkout routes for production capture when you
          are ready.
        </div>
      </main>
    </div>
  );
}
