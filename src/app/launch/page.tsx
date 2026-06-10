import Link from "next/link";
import { CreatorDashboard } from "@/components/creator-dashboard";
import { SignOutButton } from "@/components/sign-out-button";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function LaunchPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,oklch(0.42_0.12_75_/_0.3),transparent)]" />
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[linear-gradient(to_bottom,transparent,oklch(0.08_0.02_55_/_0.9))]" />

      <header className="sticky top-0 z-20 border-b border-white/[0.08] bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 md:px-10">
          <div className="flex items-baseline gap-3">
            <span className="text-xs font-semibold uppercase tracking-[0.35em] text-amber-300/90">
              Luberry AI
            </span>
            <span className="text-sm font-medium text-foreground/90">
              Business Launcher
            </span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <Link
              href="/dashboard"
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
            >
              Dashboard
            </Link>
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 pb-24 pt-10 md:px-10 md:pt-16">
        <CreatorDashboard />
      </main>
    </div>
  );
}
