export function ConflictPanel({ conflicts }: { conflicts: string[] }) {
  const hasConflicts = conflicts.length > 0;

  return (
    <div className="rounded-[1.75rem] border border-white/50 bg-white/90 p-5 shadow-panel">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-ink">Conflict Detector</h3>
          <p className="mt-1 text-sm text-ink/65">Catch faculty and room collisions before publishing.</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-sm font-medium ${hasConflicts ? "bg-ember/10 text-ember" : "bg-moss/10 text-moss"}`}>
          {hasConflicts ? `${conflicts.length} active` : "All clear"}
        </span>
      </div>
      <div className="mt-4 space-y-3 text-sm text-ink/80">
        {hasConflicts ? conflicts.map((conflict) => (
          <div key={conflict} className="rounded-2xl border border-ember/15 bg-ember/5 px-4 py-3">
            {conflict}
          </div>
        )) : <div className="rounded-2xl border border-moss/15 bg-moss/5 px-4 py-3">No scheduling conflicts detected in the current timetable.</div>}
      </div>
    </div>
  );
}
