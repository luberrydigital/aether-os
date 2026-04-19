"use client";

import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-3xl flex-col justify-center gap-6 px-5 py-12 md:px-10">
      <Alert className="border-white/10 bg-card/70 backdrop-blur" variant="destructive">
        <AlertTitle>Something went wrong</AlertTitle>
        <AlertDescription>
          {error.message || "Unknown error."}
          {error.digest ? (
            <p className="mt-2 text-xs text-muted-foreground">
              Digest: <span className="font-mono">{error.digest}</span>
            </p>
          ) : null}
        </AlertDescription>
      </Alert>
      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={reset}
          className={cn(buttonVariants({ size: "lg" }), "w-full sm:w-auto")}
        >
          Retry
        </button>
        <Link
          href="/"
          className={cn(
            buttonVariants({ variant: "outline", size: "lg" }),
            "w-full border-white/15 sm:w-auto"
          )}
        >
          Back to landing
        </Link>
      </div>
    </div>
  );
}

