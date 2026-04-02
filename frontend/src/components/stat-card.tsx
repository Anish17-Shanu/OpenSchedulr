interface StatCardProps {
  label: string;
  value: string | number;
  helper: string;
}

export function StatCard({ label, value, helper }: StatCardProps) {
  return (
    <div className="rounded-3xl border border-white/40 bg-white/80 p-5 shadow-panel backdrop-blur">
      <p className="text-sm font-medium text-ink/60">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-ink">{value}</p>
      <p className="mt-2 text-sm text-ink/70">{helper}</p>
    </div>
  );
}
