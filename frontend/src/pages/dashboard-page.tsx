import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Activity,
  BellRing,
  CalendarClock,
  ChartColumn,
  GraduationCap,
  LayoutDashboard,
  RefreshCw,
  Send,
  Users
} from "lucide-react";
import {
  generateSchedule,
  getAnalytics,
  getConflicts,
  getCourses,
  getFaculty,
  getFacultyNotifications,
  getRooms,
  getTimeSlots,
  getTimetable,
  publishSchedule,
  rescheduleEntry
} from "../lib/api";
import { subscribeToNotifications } from "../lib/realtime";
import { useAuthStore } from "../store/auth-store";
import { StatCard } from "../components/stat-card";
import { ConflictPanel } from "../components/conflict-panel";
import { NotificationPanel } from "../components/notification-panel";
import { TimetableBoard } from "../components/timetable-board";
import { Button } from "../components/ui/button";
import type { NotificationItem } from "../types";

export function DashboardPage() {
  const queryClient = useQueryClient();
  const { email, role, logout } = useAuthStore();
  const [liveNotifications, setLiveNotifications] = useState<NotificationItem[]>([]);

  const facultyQuery = useQuery({ queryKey: ["faculty"], queryFn: getFaculty });
  const coursesQuery = useQuery({ queryKey: ["courses"], queryFn: getCourses });
  const roomsQuery = useQuery({ queryKey: ["rooms"], queryFn: getRooms });
  const timeSlotsQuery = useQuery({ queryKey: ["timeslots"], queryFn: getTimeSlots });
  const timetableQuery = useQuery({ queryKey: ["timetable"], queryFn: getTimetable });
  const conflictsQuery = useQuery({ queryKey: ["conflicts"], queryFn: getConflicts });
  const analyticsQuery = useQuery({ queryKey: ["analytics"], queryFn: getAnalytics });
  const notificationsQuery = useQuery({
    queryKey: ["notifications", email],
    queryFn: () => getFacultyNotifications(email!),
    enabled: Boolean(email)
  });

  useEffect(() => {
    if (!email) return;
    const unsubscribe = subscribeToNotifications(email, (payload) => {
      setLiveNotifications((current) => [payload as NotificationItem, ...current].slice(0, 10));
    });
    return () => {
      void unsubscribe();
    };
  }, [email]);

  const refreshAll = () => {
    void queryClient.invalidateQueries();
  };

  const generateMutation = useMutation({
    mutationFn: generateSchedule,
    onSuccess: refreshAll
  });

  const publishMutation = useMutation({
    mutationFn: publishSchedule,
    onSuccess: refreshAll
  });

  const rescheduleMutation = useMutation({
    mutationFn: ({ entryId, roomId, timeSlotId }: { entryId: string; roomId: string; timeSlotId: string }) =>
      rescheduleEntry(entryId, roomId, timeSlotId),
    onSuccess: refreshAll
  });

  const stats = analyticsQuery.data;
  const timetable = timetableQuery.data ?? [];
  const conflicts = conflictsQuery.data ?? [];
  const notifications = [...liveNotifications, ...(notificationsQuery.data ?? [])].slice(0, 10);
  const roomUtilization = Object.entries(stats?.roomUtilization ?? {});
  const workload = Object.entries(stats?.workloadDistribution ?? {});
  const adminBusy = generateMutation.isPending || publishMutation.isPending || rescheduleMutation.isPending;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(217,108,61,0.12),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(31,92,75,0.18),_transparent_35%),linear-gradient(180deg,#f6f1e8,#dce6e9)] text-ink">
      <div className="mx-auto max-w-[1500px] px-4 py-6 md:px-8">
        <div className="grid gap-6 xl:grid-cols-[280px_1fr]">
          <aside className="rounded-[2rem] border border-white/50 bg-[linear-gradient(165deg,rgba(16,37,66,0.98),rgba(31,92,75,0.88))] p-6 text-white shadow-panel">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-white/10 p-3">
                <LayoutDashboard className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-white/65">OpenSchedulr</p>
                <p className="mt-1 text-lg font-semibold">Operations Console</p>
              </div>
            </div>

            <div className="mt-8 rounded-[1.75rem] border border-white/10 bg-white/10 p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-white/60">Signed in</p>
              <p className="mt-3 break-all text-lg font-semibold">{email}</p>
              <p className="mt-1 text-sm text-white/70">{role === "ADMIN" ? "Administrator" : "Faculty member"}</p>
            </div>

            <div className="mt-6 space-y-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-white/55">Planner health</p>
                <p className="mt-2 text-2xl font-semibold">{conflicts.length === 0 ? "Stable" : "Review needed"}</p>
                <p className="mt-2 text-sm text-white/70">{conflicts.length === 0 ? "No critical conflicts detected right now." : `${conflicts.length} conflict${conflicts.length === 1 ? "" : "s"} still need attention.`}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-white/55">Realtime updates</p>
                <p className="mt-2 text-2xl font-semibold">{notifications.length}</p>
                <p className="mt-2 text-sm text-white/70">Recent planner and faculty notification events.</p>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              {role === "ADMIN" ? (
                <>
                  <Button variant="secondary" className="w-full justify-center" onClick={() => generateMutation.mutate()} disabled={adminBusy}>
                    <RefreshCw className={`mr-2 inline h-4 w-4 ${generateMutation.isPending ? "animate-spin" : ""}`} />
                    {generateMutation.isPending ? "Generating..." : "Generate timetable"}
                  </Button>
                  <Button variant="outline" className="w-full justify-center border-white/20 text-white" onClick={() => publishMutation.mutate()} disabled={adminBusy}>
                    <Send className="mr-2 inline h-4 w-4" />
                    {publishMutation.isPending ? "Publishing..." : "Publish"}
                  </Button>
                </>
              ) : null}
              <Button variant="outline" className="w-full justify-center border-white/20 text-white" onClick={logout}>Logout</Button>
            </div>
          </aside>

          <main className="space-y-6">
            <section className="rounded-[2rem] border border-white/50 bg-white/78 p-6 shadow-panel backdrop-blur">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-moss">Campus planning</p>
                  <h1 className="mt-3 text-4xl font-semibold tracking-tight text-ink">A clearer weekly view for faculty scheduling.</h1>
                  <p className="mt-4 max-w-3xl text-sm leading-7 text-ink/72">
                    Generate draft timetables, rebalance workloads, review conflicts, and publish changes with a planning surface that keeps both operations and faculty communication in one place.
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-3xl border border-moss/10 bg-moss/5 px-4 py-4">
                    <p className="text-xs uppercase tracking-[0.22em] text-ink/50">Schedule status</p>
                    <p className="mt-2 text-xl font-semibold text-ink">{timetable.length > 0 ? "Draft schedule active" : "Waiting for generation"}</p>
                  </div>
                  <div className="rounded-3xl border border-ember/10 bg-amber-50 px-4 py-4">
                    <p className="text-xs uppercase tracking-[0.22em] text-ink/50">Last action</p>
                    <p className="mt-2 text-xl font-semibold text-ink">{adminBusy ? "Processing update" : "Ready for next change"}</p>
                  </div>
                </div>
              </div>
            </section>

            <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
              <StatCard label="Faculty" value={facultyQuery.data?.length ?? 0} helper="Availability, preferences, and load caps are actively tracked." icon={<Users className="h-5 w-5" />} accent="from-moss/10 to-white" />
              <StatCard label="Courses" value={coursesQuery.data?.length ?? 0} helper="Courses are tied to room types and cohort requirements." icon={<GraduationCap className="h-5 w-5" />} accent="from-amber-50 to-white" />
              <StatCard label="Sessions" value={stats?.totalEntries ?? 0} helper="Draft and published timetable sessions currently in the planner." icon={<CalendarClock className="h-5 w-5" />} accent="from-sky-50 to-white" />
              <StatCard label="Conflicts" value={stats?.totalConflicts ?? 0} helper="Warnings are surfaced early before schedule publication." icon={<Activity className="h-5 w-5" />} accent="from-rose-50 to-white" />
            </div>

            <div className="grid gap-6 2xl:grid-cols-[1.8fr_1fr]">
              <div className="space-y-6">
                <TimetableBoard
                  timetable={timetable}
                  timeSlots={timeSlotsQuery.data ?? []}
                  rooms={roomsQuery.data ?? []}
                  onDrop={(entryId, roomId, timeSlotId) => role === "ADMIN" && rescheduleMutation.mutate({ entryId, roomId, timeSlotId })}
                />

                <div className="grid gap-4 xl:grid-cols-2">
                  <div className="rounded-[1.75rem] border border-white/50 bg-white/90 p-5 shadow-panel">
                    <div className="flex items-center gap-3">
                      <ChartColumn className="h-5 w-5 text-moss" />
                      <div>
                        <h3 className="text-lg font-semibold">Workload Balance</h3>
                        <p className="text-sm text-ink/65">Quick scan of teaching distribution across faculty.</p>
                      </div>
                    </div>
                    <div className="mt-5 space-y-3">
                      {workload.map(([name, count]) => (
                        <div key={name}>
                          <div className="mb-2 flex items-center justify-between text-sm text-ink/75">
                            <span>{name}</span>
                            <span className="font-semibold">{count} sessions</span>
                          </div>
                          <div className="h-3 overflow-hidden rounded-full bg-mist/70">
                            <div className="h-full rounded-full bg-[linear-gradient(90deg,#1f5c4b,#102542)]" style={{ width: `${Math.min(Number(count) * 20, 100)}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[1.75rem] border border-white/50 bg-white/90 p-5 shadow-panel">
                    <div className="flex items-center gap-3">
                      <BellRing className="h-5 w-5 text-ember" />
                      <div>
                        <h3 className="text-lg font-semibold">Room Utilization</h3>
                        <p className="text-sm text-ink/65">Identify busy spaces and underused teaching rooms.</p>
                      </div>
                    </div>
                    <div className="mt-5 space-y-3">
                      {roomUtilization.map(([room, count]) => (
                        <div key={room} className="rounded-2xl border border-ink/6 bg-sand/60 px-4 py-3">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-ink">{room}</span>
                            <span className="text-sm font-semibold text-ink/80">{count} sessions</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <ConflictPanel conflicts={conflicts} />
                <NotificationPanel notifications={notifications} />
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
