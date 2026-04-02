import type { NotificationItem } from "../types";

export function NotificationPanel({ notifications }: { notifications: NotificationItem[] }) {
  return (
    <div className="rounded-[1.75rem] border border-white/50 bg-white/90 p-5 shadow-panel">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-ink">Live Notifications</h3>
          <p className="mt-1 text-sm text-ink/65">Realtime schedule changes and planner activity.</p>
        </div>
        <span className="rounded-full bg-ink/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-ink/60">Realtime</span>
      </div>
      <div className="mt-4 space-y-3">
        {notifications.length === 0 ? <p className="rounded-2xl border border-dashed border-ink/10 bg-mist/35 p-4 text-sm text-ink/70">No notifications yet.</p> : notifications.map((item) => (
          <div key={item.id} className="rounded-2xl border border-white/60 bg-gradient-to-br from-mist/70 to-white p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="font-medium text-ink">{item.title}</p>
              <span className="text-xs text-ink/50">{new Date(item.createdAt).toLocaleString()}</span>
            </div>
            <p className="mt-2 text-sm leading-6 text-ink/75">{item.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
