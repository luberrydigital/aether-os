"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  CreditCard,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Settings,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";

type Props = {
  email?: string | null;
  displayName?: string | null;
};

const MENU_ITEMS = [
  { href: "/dashboard", label: "My Dashboard", icon: LayoutDashboard },
  { href: "/settings/account", label: "Account Settings", icon: Settings },
  { href: "/settings/billing", label: "Billing & Subscription", icon: CreditCard },
  { href: "/trust", label: "Help & Support", icon: HelpCircle },
] as const;

export function UserProfileMenu({ email, displayName }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const label = displayName?.trim() || email?.split("@")[0] || "Account";
  const initial = (label[0] ?? "U").toUpperCase();

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  async function onLogout() {
    setOpen(false);
    await signOut({ redirect: false });
    router.push("/");
    router.refresh();
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex items-center gap-2 rounded-xl border border-white/10 bg-black/40 px-2 py-1.5 pl-1.5 transition hover:border-amber-500/30 hover:bg-black/60",
          open && "border-amber-500/40 ring-1 ring-amber-400/20"
        )}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <span className="flex size-9 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500/40 to-amber-600/25 text-sm font-bold text-amber-100">
          {initial}
        </span>
        <span className="hidden max-w-[8rem] truncate text-sm font-medium text-zinc-200 sm:inline">
          {label}
        </span>
        <ChevronDown
          className={cn("size-4 text-zinc-500 transition", open && "rotate-180")}
          aria-hidden
        />
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border border-white/10 bg-zinc-950/95 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] backdrop-blur-xl"
        >
          <div className="border-b border-white/8 px-4 py-3">
            <p className="truncate text-sm font-semibold text-white">{label}</p>
            {email ? (
              <p className="truncate text-xs text-zinc-500">{email}</p>
            ) : null}
          </div>
          <div className="py-1">
            {MENU_ITEMS.map(({ href, label: itemLabel, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                role="menuitem"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 transition hover:bg-white/5 hover:text-white"
              >
                <Icon className="size-4 text-amber-400/80" aria-hidden />
                {itemLabel}
              </Link>
            ))}
          </div>
          <div className="border-t border-white/8 py-1">
            <button
              type="button"
              role="menuitem"
              onClick={() => void onLogout()}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-300 transition hover:bg-red-950/30"
            >
              <LogOut className="size-4" aria-hidden />
              Logout
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
