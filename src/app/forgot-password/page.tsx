import Link from "next/link";
import { ForgotPasswordForm } from "@/components/forgot-password-form";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function ForgotPasswordPage() {
  return (
    <div className="relative min-h-screen bg-background">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,_oklch(0.4_0.2_280_/_0.25),_transparent_45%),radial-gradient(circle_at_80%_0%,_oklch(0.35_0.12_200_/_0.2),_transparent_40%)]" />
      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col gap-10 px-6 py-12 md:flex-row md:items-center md:justify-between md:px-10">
        <div className="max-w-md space-y-6">
          <Link
            href="/login"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "-ml-2 text-muted-foreground"
            )}
          >
            ← Back to sign in
          </Link>
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">
              Account recovery
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
              Forgot your password?
            </h1>
            <p className="mt-4 text-muted-foreground">
              We&apos;ll email you a one-time code to verify it&apos;s you, then you can set a new
              password.
            </p>
          </div>
        </div>
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
