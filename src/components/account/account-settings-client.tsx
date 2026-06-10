"use client";

import { useEffect, useState } from "react";
import { GlassCard } from "@/components/premium/glass-card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export function AccountSettingsClient() {
  const [email, setEmail] = useState("");
  const [createdAt, setCreatedAt] = useState("");

  useEffect(() => {
    void (async () => {
      const res = await fetch("/api/user/profile");
      if (!res.ok) return;
      const json = (await res.json()) as { email?: string; createdAt?: string };
      setEmail(json.email ?? "");
      setCreatedAt(json.createdAt ?? "");
    })();
  }, []);

  return (
    <div className="space-y-6">
      <GlassCard className="p-6">
        <h2 className="text-lg font-semibold text-white">Account details</h2>
        <p className="mt-1 text-sm text-zinc-400">
          Your login credentials and account security.
        </p>

        <div className="mt-6 grid gap-4">
          <div>
            <Label>Email address</Label>
            <Input value={email} disabled className="mt-2 border-white/10 bg-black/20" />
          </div>
          {createdAt ? (
            <div>
              <Label>Member since</Label>
              <Input
                value={new Date(createdAt).toLocaleDateString("en-ZA", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
                disabled
                className="mt-2 border-white/10 bg-black/20"
              />
            </div>
          ) : null}
        </div>
      </GlassCard>

      <GlassCard className="p-6">
        <h2 className="text-lg font-semibold text-white">Password</h2>
        <p className="mt-2 text-sm text-zinc-400">
          Password changes are handled via your sign-in provider. Use the login page
          to sign in with your registered email and password.
        </p>
      </GlassCard>

      <GlassCard className="border-red-500/20 p-6">
        <h2 className="text-lg font-semibold text-red-200">Danger zone</h2>
        <p className="mt-2 text-sm text-zinc-400">
          Account deletion is not yet available in sandbox mode. Contact support if
          you need your data removed.
        </p>
      </GlassCard>
    </div>
  );
}
