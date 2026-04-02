import type { NotificationItem } from "../types";

export function NotificationPanel({ notifications }: { notifications: NotificationItem[] }) {
  return (
    <div className="rounded-3xl border border-white/40 bg-white/85 p-5 shadow-panel">
      <h3 className="text-lg font-semibold text-ink">Live Notifications</h3>
      <div className="mt-4 space-y-3">
        {notifications.length === 0 ? <p className="text-sm text-ink/70">No notifications yet.</p> : notifications.map((item) => (
          <div key={item.id} className="rounded-2xl bg-mist/50 p-3">
            <p className="font-medium text-ink">{item.title}</p>
            <p className="mt-1 text-sm text-ink/75">{item.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
