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
    <div className={`rounded-[1.75rem] border border-white/50 bg-gradient-to-br ${accent} p-5 shadow-panel backdrop-blur`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-ink/60">{label}</p>
          <p className="mt-2 text-3xl font-semibold text-ink">{value}</p>
        </div>
        {icon ? <div className="rounded-2xl bg-white/80 p-3 text-ink shadow-sm">{icon}</div> : null}
      </div>
      <p className="mt-4 text-sm leading-6 text-ink/70">{helper}</p>
    </div>
  );
}
