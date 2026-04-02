export function ConflictPanel({ conflicts }: { conflicts: string[] }) {
  return (
    <div className="rounded-3xl border border-ember/20 bg-white/85 p-5 shadow-panel">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-ink">Conflict Detector</h3>
        <span className="rounded-full bg-ember/10 px-3 py-1 text-sm font-medium text-ember">
          {conflicts.length} active
        </span>
      </div>
      <div className="mt-4 space-y-2 text-sm text-ink/80">
        {conflicts.length === 0 ? <p>No scheduling conflicts detected.</p> : conflicts.map((conflict) => <p key={conflict}>• {conflict}</p>)}
      </div>
    </div>
  );
}
