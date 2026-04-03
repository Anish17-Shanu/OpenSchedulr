export function ConflictPanel({ conflicts }: { conflicts: string[] }) {
  const hasConflicts = conflicts.length > 0;

  return (
    <div className="glass-panel shimmer-border animate-rise rounded-[1.75rem] border border-white/55 p-5 shadow-panel">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-ink">Conflict Detector</h3>
          <p className="mt-1 text-sm text-ink/65">Catch faculty and room collisions before publishing.</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-sm font-medium shadow-sm ${hasConflicts ? "bg-ember/12 text-ember" : "bg-moss/12 text-moss"}`}>
          {hasConflicts ? `${conflicts.length} active` : "All clear"}
        </span>
      </div>
      <div className="mt-4 space-y-3 text-sm text-ink/80">
        {hasConflicts ? conflicts.map((conflict) => (
          <div key={conflict} className="rounded-2xl border border-ember/15 bg-[linear-gradient(135deg,rgba(217,108,61,0.12),rgba(255,255,255,0.85))] px-4 py-3 shadow-sm">
            {conflict}
          </div>
        )) : <div className="rounded-2xl border border-moss/15 bg-[linear-gradient(135deg,rgba(31,92,75,0.12),rgba(255,255,255,0.88))] px-4 py-3 shadow-sm">No scheduling conflicts detected in the current timetable.</div>}
      </div>
    </div>
  );
}
