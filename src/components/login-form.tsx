"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/launch";

  const referralFromUrl = searchParams.get("ref") ?? "";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [referralCode, setReferralCode] = useState(referralFromUrl);
  const [mode, setMode] = useState<"signin" | "signup">(referralFromUrl ? "signup" : "signin");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
        mode,
        referralCode: mode === "signup" ? referralCode : undefined,
      });
      if (res?.error) {
        setMessage(mode === "signup" ? "Sign up failed (email may already exist)." : "Sign in failed.");
        return;
      }
      router.push(next);
      router.refresh();
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md border-border/60 bg-card/80 shadow-xl backdrop-blur">
      <CardHeader>
        <CardTitle className="text-2xl tracking-tight">
          {mode === "signin" ? "Welcome back" : "Join Luberry AI"}
        </CardTitle>
        <CardDescription>
          {mode === "signin"
            ? "Sign in to your Luberry AI dashboard."
            : "Create your account and start building your AI business empire."}
        </CardDescription>
      </CardHeader>
      <form onSubmit={onSubmit}>
        <CardContent className="grid gap-4">
          {searchParams.get("error") ? (
            <p className="text-sm text-destructive">
              Authentication failed. Try again.
            </p>
          ) : null}
          {message ? (
            <p className="text-sm text-muted-foreground">{message}</p>
          ) : null}
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
            />
          </div>
          {mode === "signup" ? (
            <div className="grid gap-2">
              <Label htmlFor="referral">Referral code (optional)</Label>
              <Input
                id="referral"
                type="text"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                placeholder="LUBXXXXX"
              />
            </div>
          ) : null}
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete={
                mode === "signup" ? "new-password" : "current-password"
              }
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading
              ? "Working…"
              : mode === "signin"
                ? "Sign in"
                : "Sign up"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={() =>
              setMode((m) => (m === "signin" ? "signup" : "signin"))
            }
          >
            {mode === "signin"
              ? "Need an account? Sign up"
              : "Already have an account? Sign in"}
          </Button>
          <Link
            href="/"
            className={cn(buttonVariants({ variant: "outline" }), "w-full")}
          >
            Back to Luberry AI
          </Link>
        </CardFooter>
      </form>
    </Card>
  );
}
