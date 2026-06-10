"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/premium/glass-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ProfileSettingsClient() {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      const res = await fetch("/api/user/profile");
      if (!res.ok) return;
      const json = (await res.json()) as { displayName?: string; email?: string };
      setDisplayName(json.displayName ?? "");
      setEmail(json.email ?? "");
    })();
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    const res = await fetch("/api/user/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ displayName }),
    });
    const json = (await res.json()) as { error?: string };
    setMessage(res.ok ? "Profile saved." : (json.error ?? "Failed to save."));
    setSaving(false);
  }

  const initial = (displayName[0] ?? email[0] ?? "U").toUpperCase();

  return (
    <form onSubmit={save} className="space-y-6">
      <GlassCard className="p-6">
        <div className="mb-6 flex items-center gap-4">
          <span className="flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500/40 to-amber-600/25 text-2xl font-bold text-white">
            {initial}
          </span>
          <div>
            <p className="font-semibold text-white">{displayName || "Your profile"}</p>
            <p className="text-sm text-zinc-500">{email}</p>
          </div>
        </div>

        <div className="grid gap-4">
          <div>
            <Label htmlFor="displayName">Display name</Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="How you appear in Luberry AI"
              className="mt-2 border-white/10 bg-black/40"
              maxLength={80}
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={email}
              disabled
              className="mt-2 border-white/10 bg-black/20 text-zinc-500"
            />
            <p className="mt-1 text-xs text-zinc-500">Email is managed in Account Settings.</p>
          </div>
        </div>

        {message ? <p className="mt-4 text-sm text-amber-200">{message}</p> : null}

        <Button
          type="submit"
          disabled={saving}
          className="mt-6 rounded-xl bg-amber-500 text-black hover:bg-amber-400"
        >
          {saving ? "Saving…" : "Save profile"}
        </Button>
      </GlassCard>
    </form>
  );
}
