import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[oklch(0.07_0.02_55)] px-6 text-center text-foreground">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_100%_70%_at_50%_-15%,oklch(0.42_0.12_75_/_0.3),transparent_55%)]" />
      </div>
      <p className="text-[11px] font-bold uppercase tracking-[0.35em] text-amber-300/90">Luberry AI</p>
      <h1 className="mt-4 text-4xl font-bold tracking-tight text-white md:text-5xl">404</h1>
      <p className="mt-3 max-w-md text-pretty text-sm text-zinc-400 md:text-base">
        This page does not exist, or the storefront link may have changed.
      </p>
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Link href="/" className={cn(buttonVariants({ size: "lg" }), "rounded-xl")}>
          Home
        </Link>
        <Link
          href="/login"
          className={cn(
            buttonVariants({ variant: "outline", size: "lg" }),
            "rounded-xl border-white/15 bg-white/5"
          )}
        >
          Sign in
        </Link>
      </div>
    </div>
  );
}
