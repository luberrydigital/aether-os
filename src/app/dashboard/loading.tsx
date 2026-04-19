import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-[oklch(0.07_0.03_280)]">
      <div className="border-b border-white/10 bg-black/40 py-2">
        <Skeleton className="mx-auto h-4 w-full max-w-3xl bg-white/10" />
      </div>
      <div className="mx-auto w-full max-w-[min(100%,90rem)] px-5 py-8 md:px-12 md:py-10">
        <div className="space-y-4 border-b border-white/10 pb-8">
          <Skeleton className="h-6 w-48 bg-violet-500/20" />
          <Skeleton className="h-12 w-full max-w-md bg-white/10" />
          <Skeleton className="h-5 w-full max-w-xl bg-white/5" />
        </div>
        <div className="mt-10 space-y-10">
          <div className="grid gap-8 lg:grid-cols-3">
            <Skeleton className="h-[28rem] rounded-3xl bg-gradient-to-br from-violet-950/40 to-black/40 lg:col-span-2" />
            <Skeleton className="h-[28rem] rounded-3xl bg-gradient-to-b from-emerald-950/30 to-black/40" />
          </div>
          <div className="grid gap-8 xl:grid-cols-3">
            <div className="space-y-8 xl:col-span-2">
              <Skeleton className="h-80 rounded-3xl bg-white/5" />
              <Skeleton className="h-96 rounded-3xl bg-white/5" />
            </div>
            <Skeleton className="h-96 rounded-3xl bg-white/5" />
          </div>
        </div>
      </div>
    </div>
  );
}
