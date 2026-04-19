import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-10 md:px-10 md:py-14">
      <div className="space-y-6">
        <Skeleton className="h-8 w-72 bg-muted/40" />
        <Skeleton className="h-[340px] w-full rounded-2xl bg-muted/30" />
        <Skeleton className="h-14 w-64 rounded-xl bg-muted/30" />
      </div>
    </div>
  );
}

