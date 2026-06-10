import { cn } from "@/lib/utils";

type GlassCardProps = {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
  neon?: boolean;
};

export function GlassCard({ children, className, glow, neon }: GlassCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-2xl",
        "shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]",
        glow && "shadow-[0_0_60px_-15px_rgba(212,175,55,0.25)]",
        neon && "border-amber-400/20 shadow-[0_0_40px_-10px_rgba(212,175,55,0.35),inset_0_0_30px_rgba(212,175,55,0.03)]",
        className
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-amber-500/[0.04] via-transparent to-cyan-400/[0.02]" />
      <div className="relative">{children}</div>
    </div>
  );
}
