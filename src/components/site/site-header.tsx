import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/launch", label: "Launch" },
  { href: "/dashboard", label: "Empire" },
  { href: "/pricing", label: "Pricing" },
  { href: "/explore", label: "Explore" },
  { href: "/growth", label: "Growth" },
  { href: "/earnings", label: "Earnings" },
  { href: "/idea-lab", label: "Idea Lab" },
  { href: "/community", label: "Community" },
  { href: "/trust", label: "Trust" },
  { href: "/developers", label: "Developers" },
] as const;

export function SiteHeader(props: { activeHref?: string }) {
  return (
    <header className="sticky top-0 z-30 border-b border-white/[0.08] bg-[oklch(0.08_0.02_55_/_0.75)] backdrop-blur-2xl">
      <div className="mx-auto flex max-w-[min(100%,90rem)] flex-wrap items-center justify-between gap-3 px-5 py-4 md:px-12">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3">
            <span className="text-xs font-extrabold uppercase tracking-[0.38em] text-amber-200/95">
              Luberry AI
            </span>
            <Badge className="border border-amber-500/25 bg-amber-500/10 text-[10px] font-semibold uppercase tracking-wider text-amber-100">
              live
            </Badge>
          </Link>
        </div>

        <nav className="flex flex-wrap items-center justify-end gap-1">
          {NAV.map((item) => {
            const isActive = props.activeHref === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  buttonVariants({ variant: "ghost", size: "sm" }),
                  "h-9 rounded-xl px-3 text-xs text-zinc-200 hover:bg-white/5",
                  isActive && "bg-white/5 text-amber-100"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
