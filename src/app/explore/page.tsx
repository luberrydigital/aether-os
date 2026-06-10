import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SiteHeader } from "@/components/site/site-header";
import { ProductImage } from "@/components/store/product-image";
import { dbListCompanies, dbListProducts, dbListStorefronts } from "@/lib/db/local-db";
import { cn } from "@/lib/utils";

function money(cents: number, currency: string) {
  try {
    return new Intl.NumberFormat(currency === "ZAR" ? "en-ZA" : "en-US", {
      style: "currency",
      currency: currency === "ZAR" ? "ZAR" : "USD",
      maximumFractionDigits: 0,
    }).format(cents / 100);
  } catch {
    return `${Math.round(cents / 100)} ${currency}`;
  }
}

export default async function ExplorePage() {
  const [storefronts, companies] = await Promise.all([dbListStorefronts(60), dbListCompanies(200)]);
  const companyById = new Map(companies.map((c) => [c.id, c]));

  const withMetrics = await Promise.all(
    storefronts.map(async (s) => {
      const c = companyById.get(s.company_id) ?? null;
      const products = await dbListProducts(s.id);
      const hero = products[0] ?? null;
      const netZar = c?.total_net_zar_cents ?? 0;
      const netUsd = c?.total_net_usd_cents ?? 0;
      const score = netZar + Math.round(netUsd * 18); // crude blend for ranking
      return { storefront: s, company: c, products, hero, score };
    })
  );

  const trending = withMetrics.slice().sort((a, b) => b.score - a.score).slice(0, 8);
  const newest = withMetrics.slice().sort((a, b) => b.storefront.created_at.localeCompare(a.storefront.created_at)).slice(0, 12);

  return (
    <div className="min-h-screen bg-[oklch(0.07_0.03_280)] text-foreground">
      <SiteHeader activeHref="/explore" />

      <main className="mx-auto max-w-[min(100%,90rem)] space-y-10 px-5 py-10 md:px-12 md:py-14">
        <header className="space-y-3">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.42em] text-violet-300/90">
            Marketplace
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
            Explore stores that launched from one sentence
          </h1>
          <p className="max-w-2xl text-pretty text-sm text-zinc-400 md:text-base">
            Trending launches, new drops, and operator dashboards. This page builds trust fast—everything here is backed by
            the same revenue ledger you see in Mission Control.
          </p>
        </header>

        <section className="grid gap-6 lg:grid-cols-3">
          <Card className="border-white/10 bg-black/20 lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-white">Trending now</CardTitle>
              <CardDescription>Top launches by net revenue (demo ranking).</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              {trending.map((row) => (
                <Link
                  key={row.storefront.id}
                  href={`/store/${row.storefront.slug}`}
                  className="group rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:bg-white/[0.05]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate font-semibold text-white">{row.storefront.name}</div>
                      <div className="truncate text-xs text-zinc-400">{row.storefront.headline ?? "—"}</div>
                    </div>
                    <Badge className="border border-emerald-500/25 bg-emerald-500/10 text-emerald-100">
                      net{" "}
                      {money(
                        (row.company?.total_net_zar_cents ?? 0) + (row.company?.total_net_usd_cents ?? 0),
                        row.company?.total_net_zar_cents ? "ZAR" : "USD"
                      )}
                    </Badge>
                  </div>
                  <div className="mt-4 grid gap-2">
                    <div className="text-[11px] font-bold uppercase tracking-[0.25em] text-zinc-500">Preview</div>
                    <div className="line-clamp-2 text-sm text-zinc-300">
                      {row.storefront.description ?? "Aether storefront preview"}
                    </div>
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-black/20">
            <CardHeader>
              <CardTitle className="text-white">Categories</CardTitle>
              <CardDescription>Seeded for early trust.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {["AI merch", "Fitness", "Beauty", "Kids", "Accessories", "Education", "Food", "Home"].map((c) => (
                <Badge key={c} variant="secondary" className="border border-white/10 bg-white/5 text-zinc-200">
                  {c}
                </Badge>
              ))}
              <div className="w-full pt-3 text-xs text-zinc-500">
                Soon: filters, search, verified badges, and “Top earners this week”.
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-white md:text-2xl">New launches</h2>
              <p className="text-sm text-zinc-400">Fresh storefronts—tap in.</p>
            </div>
            <Link
              href="/launch"
              className={cn(
                buttonVariants({ size: "lg" }),
                "rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cyan-600 text-white"
              )}
            >
              Launch your business
            </Link>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {newest.map((row, index) => (
              <Link
                key={row.storefront.id}
                href={`/store/${row.storefront.slug}`}
                className="group overflow-hidden rounded-3xl border border-white/10 bg-black/25 shadow-[0_0_60px_-28px_rgba(139,92,246,0.25)] transition hover:-translate-y-0.5"
              >
                <div className="relative aspect-[4/3] bg-white/[0.03]">
                  <ProductImage
                    src={row.hero?.image_url ?? "/placeholder-product.svg"}
                    alt=""
                    priority={index < 4}
                    className="object-cover"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3 flex flex-wrap gap-2">
                    <Badge className="border border-white/10 bg-black/60 text-zinc-200">new</Badge>
                    {row.products.length ? (
                      <Badge className="border border-violet-500/25 bg-violet-500/10 text-violet-100">
                        {row.products.length} products
                      </Badge>
                    ) : null}
                  </div>
                </div>
                <div className="p-4">
                  <div className="truncate font-semibold text-white">{row.storefront.name}</div>
                  <div className="mt-1 line-clamp-2 text-xs text-zinc-400">{row.storefront.headline ?? row.storefront.description ?? ""}</div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

