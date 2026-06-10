import Link from "next/link";
import { UserProfileMenu } from "@/components/account/user-profile-menu";
import { cn } from "@/lib/utils";

const SETTINGS_NAV = [
  { href: "/settings/profile", label: "Profile" },
  { href: "/settings/account", label: "Account" },
  { href: "/settings/billing", label: "Billing" },
] as const;

type Props = {
  children: React.ReactNode;
  activeHref: string;
  email?: string | null;
  displayName?: string | null;
};

export function SettingsShell({ children, activeHref, email, displayName }: Props) {
  return (
    <div className="min-h-screen bg-[oklch(0.06_0.02_55)] text-foreground">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_100%_60%_at_50%_-10%,oklch(0.42_0.12_75_/_0.25),transparent)]" />

      <header className="sticky top-0 z-20 border-b border-white/[0.08] bg-[oklch(0.08_0.02_55_/_0.9)] backdrop-blur-2xl">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-5 py-4 md:px-8">
          <Link href="/dashboard" className="text-xs font-bold uppercase tracking-[0.35em] text-amber-300/90">
            Luberry AI
          </Link>
          <UserProfileMenu email={email} displayName={displayName} />
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-5 py-10 md:px-8">
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="mt-2 text-zinc-400">Manage your account, profile, and billing.</p>

        <nav className="mt-8 flex gap-1 overflow-x-auto border-b border-white/10 pb-px">
          {SETTINGS_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "shrink-0 border-b-2 px-4 py-2.5 text-sm font-medium transition",
                activeHref === item.href
                  ? "border-amber-400 text-amber-100"
                  : "border-transparent text-zinc-500 hover:text-zinc-300"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="mt-8">{children}</div>
      </div>
    </div>
  );
}
