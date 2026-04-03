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
    <div className={`glass-panel shimmer-border animate-rise relative overflow-hidden rounded-[1.5rem] border border-slate-200 bg-gradient-to-br ${accent} p-5 shadow-panel`}>
      <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-indigo-200 to-transparent opacity-90" />
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{label}</p>
          <p className="mt-3 text-3xl font-semibold text-ink">{value}</p>
        </div>
        {icon ? <div className="rounded-2xl bg-[linear-gradient(145deg,rgba(123,97,255,0.08),rgba(255,255,255,0.95))] p-3 text-[#5c48d4] shadow-[0_12px_24px_rgba(18,27,44,0.08)] ring-1 ring-white/80">{icon}</div> : null}
      </div>
      <div className="mt-4 h-px bg-gradient-to-r from-slate-200 via-slate-100 to-transparent" />
      <p className="mt-4 text-sm leading-6 text-slate-600">{helper}</p>
    </div>
  );
}
