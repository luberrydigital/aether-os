"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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

type Step = "email" | "otp" | "password" | "done";

export function ForgotPasswordForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function requestCode(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = (await res.json()) as {
        error?: string;
        message?: string;
        dev?: { otp?: string; emailSent?: boolean; hint?: string };
      };
      if (!res.ok) {
        setError(data.error ?? "Could not send code.");
        return;
      }
      const devHint = data.dev?.hint ? ` ${data.dev.hint}` : "";
      const devOtp = data.dev?.otp ? ` Dev code: ${data.dev.otp}` : "";
      setMessage((data.message ?? "Check your email for a 6-digit code.") + devHint + devOtp);
      setStep("otp");
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  async function verifyCode(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-reset-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = (await res.json()) as {
        error?: string;
        message?: string;
        resetToken?: string;
      };
      if (!res.ok || !data.resetToken) {
        setError(data.error ?? "Verification failed.");
        return;
      }
      setResetToken(data.resetToken);
      setMessage(data.message ?? "Code verified.");
      setStep("password");
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  async function resetPassword(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, resetToken, password }),
      });
      const data = (await res.json()) as { error?: string; message?: string };
      if (!res.ok) {
        setError(data.error ?? "Could not reset password.");
        return;
      }
      setMessage(data.message ?? "Password updated.");
      setStep("done");
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md border-border/60 bg-card/80 shadow-xl backdrop-blur">
      <CardHeader>
        <CardTitle className="text-2xl tracking-tight">
          {step === "done" ? "All set" : "Reset password"}
        </CardTitle>
        <CardDescription>
          {step === "email" &&
            "Enter your account email and we'll send a one-time verification code."}
          {step === "otp" && "Enter the 6-digit code we sent to your email."}
          {step === "password" && "Choose a new password for your account."}
          {step === "done" && "Your password has been updated successfully."}
        </CardDescription>
      </CardHeader>

      {step === "email" ? (
        <form onSubmit={requestCode}>
          <CardContent className="grid gap-4">
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
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
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Sending…" : "Send verification code"}
            </Button>
            <Link
              href="/login"
              className={cn(buttonVariants({ variant: "ghost" }), "w-full")}
            >
              Back to sign in
            </Link>
          </CardFooter>
        </form>
      ) : null}

      {step === "otp" ? (
        <form onSubmit={verifyCode}>
          <CardContent className="grid gap-4">
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
            <p className="text-xs text-muted-foreground">Code sent to {email}</p>
            <div className="grid gap-2">
              <Label htmlFor="otp">Verification code</Label>
              <Input
                id="otp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                required
                maxLength={6}
                pattern="\d{6}"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="123456"
                className="text-center text-lg tracking-[0.4em]"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button type="submit" className="w-full" disabled={loading || otp.length !== 6}>
              {loading ? "Verifying…" : "Verify code"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              disabled={loading}
              onClick={() => {
                setStep("email");
                setOtp("");
                setError(null);
                setMessage(null);
              }}
            >
              Use a different email
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={loading}
              onClick={async () => {
                setError(null);
                setMessage(null);
                setLoading(true);
                try {
                  const res = await fetch("/api/auth/forgot-password", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email }),
                  });
                  const data = (await res.json()) as { error?: string; message?: string };
                  if (!res.ok) {
                    setError(data.error ?? "Could not resend code.");
                    return;
                  }
                  setMessage("A new code was sent to your email.");
                } catch {
                  setError("Could not resend code.");
                } finally {
                  setLoading(false);
                }
              }}
            >
              Resend code
            </Button>
          </CardFooter>
        </form>
      ) : null}

      {step === "password" ? (
        <form onSubmit={resetPassword}>
          <CardContent className="grid gap-4">
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
            <div className="grid gap-2">
              <Label htmlFor="password">New password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirmPassword">Confirm new password</Label>
              <Input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Saving…" : "Update password"}
            </Button>
          </CardFooter>
        </form>
      ) : null}

      {step === "done" ? (
        <>
          <CardContent>
            {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button type="button" className="w-full" onClick={() => router.push("/login")}>
              Sign in
            </Button>
          </CardFooter>
        </>
      ) : null}
    </Card>
  );
}
