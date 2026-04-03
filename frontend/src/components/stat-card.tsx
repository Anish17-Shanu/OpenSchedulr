import type { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: string | number;
  helper: string;
  icon?: ReactNode;
  accent?: string;
}

export function StatCard({ label, value, helper, icon, accent = "from-moss/15 to-white" }: StatCardProps) {
  return (
    <div className={`glass-panel shimmer-border animate-rise relative overflow-hidden rounded-[1.75rem] border border-white/55 bg-gradient-to-br ${accent} p-5 shadow-panel`}>
      <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-80" />
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-ink/48">{label}</p>
          <p className="mt-3 text-3xl font-semibold text-ink">{value}</p>
        </div>
        {icon ? <div className="rounded-2xl bg-[linear-gradient(145deg,rgba(255,255,255,0.95),rgba(220,230,233,0.9))] p-3 text-ink shadow-[0_12px_24px_rgba(16,37,66,0.12)] ring-1 ring-white/80">{icon}</div> : null}
      </div>
      <div className="mt-4 h-px bg-gradient-to-r from-ink/10 via-ink/5 to-transparent" />
      <p className="mt-4 text-sm leading-6 text-ink/70">{helper}</p>
    </div>
  );
}
