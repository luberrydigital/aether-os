import { Award, Shield, Star, Zap } from "lucide-react";

const PRESS = ["TechCentral", "BusinessDay", "VentureBurn", "ITWeb", "Fin24"];

export function TrustBar() {
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
        {[
          { icon: Shield, label: "SOC 2 Ready" },
          { icon: Award, label: "PayFast Verified" },
          { icon: Star, label: "4.9/5 Rating" },
          { icon: Zap, label: "99.9% Uptime SLA" },
        ].map(({ icon: Icon, label }) => (
          <div
            key={label}
            className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs font-semibold text-zinc-300"
          >
            <Icon className="size-4 text-amber-400" aria-hidden />
            {label}
          </div>
        ))}
      </div>
      <div className="text-center">
        <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-zinc-500">
          As seen in
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-8 opacity-60">
          {PRESS.map((name) => (
            <span
              key={name}
              className="font-mono text-sm font-bold uppercase tracking-wider text-zinc-400"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
