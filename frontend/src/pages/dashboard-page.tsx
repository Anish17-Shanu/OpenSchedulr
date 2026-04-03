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
  createCourse,
  createFaculty,
  createLectureDemand,
  createRoom,
  createTimeSlot,
  deleteCourse,
  deleteFaculty,
  deleteLectureDemand,
  deleteRoom,
  deleteTimeSlot,
  generateSchedule,
  getAnalytics,
  getAuditLogs,
  getConflicts,
  getCourses,
  getFaculty,
  getFacultyNotifications,
  getLectureDemands,
  getRooms,
  getTimeSlots,
  getTimetable,
  publishSchedule,
  rescheduleEntry,
  updateCourse,
  updateFaculty,
  updateLectureDemand,
  updateRoom,
  updateTimeSlot
} from "../lib/api";
import { subscribeToNotifications } from "../lib/realtime";
import { useAuthStore } from "../store/auth-store";
import { StatCard } from "../components/stat-card";
import { ConflictPanel } from "../components/conflict-panel";
import { NotificationPanel } from "../components/notification-panel";
import { TimetableBoard } from "../components/timetable-board";
import { AdminSetupPanel } from "../components/admin-setup-panel";
import { Button } from "../components/ui/button";
import type { NotificationItem, TimetableEntry } from "../types";

export function DashboardPage() {
  const queryClient = useQueryClient();
  const { email, role, logout } = useAuthStore();
  const [liveNotifications, setLiveNotifications] = useState<NotificationItem[]>([]);

  const facultyQuery = useQuery({ queryKey: ["faculty"], queryFn: getFaculty });
  const coursesQuery = useQuery({ queryKey: ["courses"], queryFn: getCourses });
  const roomsQuery = useQuery({ queryKey: ["rooms"], queryFn: getRooms });
  const timeSlotsQuery = useQuery({ queryKey: ["timeslots"], queryFn: getTimeSlots });
  const demandsQuery = useQuery({ queryKey: ["lecture-demands"], queryFn: getLectureDemands, enabled: role === "ADMIN" });
  const auditLogsQuery = useQuery({ queryKey: ["audit-logs"], queryFn: getAuditLogs, enabled: role === "ADMIN" });
  const timetableQuery = useQuery({
    queryKey: ["timetable"],
    queryFn: getTimetable,
    refetchInterval: (query) => {
      const items = (query.state.data as TimetableEntry[] | undefined) ?? [];
      return items.length === 0 ? 10000 : false;
    }
  });
  const conflictsQuery = useQuery({ queryKey: ["conflicts"], queryFn: getConflicts });
  const analyticsQuery = useQuery({
    queryKey: ["analytics"],
    queryFn: getAnalytics,
    refetchInterval: () => ((timetableQuery.data?.length ?? 0) === 0 ? 10000 : false)
  });
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
  const createFacultyMutation = useMutation({ mutationFn: createFaculty, onSuccess: refreshAll });
  const updateFacultyMutation = useMutation({
    mutationFn: ({ facultyId, payload }: { facultyId: string; payload: Parameters<typeof updateFaculty>[1] }) => updateFaculty(facultyId, payload),
    onSuccess: refreshAll
  });
  const createCourseMutation = useMutation({ mutationFn: createCourse, onSuccess: refreshAll });
  const updateCourseMutation = useMutation({
    mutationFn: ({ courseId, payload }: { courseId: string; payload: Parameters<typeof updateCourse>[1] }) => updateCourse(courseId, payload),
    onSuccess: refreshAll
  });
  const createRoomMutation = useMutation({ mutationFn: createRoom, onSuccess: refreshAll });
  const updateRoomMutation = useMutation({
    mutationFn: ({ roomId, payload }: { roomId: string; payload: Parameters<typeof updateRoom>[1] }) => updateRoom(roomId, payload),
    onSuccess: refreshAll
  });
  const createTimeSlotMutation = useMutation({ mutationFn: createTimeSlot, onSuccess: refreshAll });
  const updateTimeSlotMutation = useMutation({
    mutationFn: ({ timeSlotId, payload }: { timeSlotId: string; payload: Parameters<typeof updateTimeSlot>[1] }) => updateTimeSlot(timeSlotId, payload),
    onSuccess: refreshAll
  });
  const createDemandMutation = useMutation({ mutationFn: createLectureDemand, onSuccess: refreshAll });
  const updateDemandMutation = useMutation({
    mutationFn: ({ demandId, payload }: { demandId: string; payload: Parameters<typeof updateLectureDemand>[1] }) => updateLectureDemand(demandId, payload),
    onSuccess: refreshAll
  });
  const deleteFacultyMutation = useMutation({ mutationFn: deleteFaculty, onSuccess: refreshAll });
  const deleteCourseMutation = useMutation({ mutationFn: deleteCourse, onSuccess: refreshAll });
  const deleteRoomMutation = useMutation({ mutationFn: deleteRoom, onSuccess: refreshAll });
  const deleteTimeSlotMutation = useMutation({ mutationFn: deleteTimeSlot, onSuccess: refreshAll });
  const deleteDemandMutation = useMutation({ mutationFn: deleteLectureDemand, onSuccess: refreshAll });

  const stats = analyticsQuery.data;
  const timetable = timetableQuery.data ?? [];
  const conflicts = conflictsQuery.data ?? [];
  const notifications = [...liveNotifications, ...(notificationsQuery.data ?? [])].slice(0, 10);
  const roomUtilization = Object.entries(stats?.roomUtilization ?? {});
  const workload = Object.entries(stats?.workloadDistribution ?? {});
  const adminBusy = generateMutation.isPending || publishMutation.isPending || rescheduleMutation.isPending;

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(217,108,61,0.12),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(31,92,75,0.18),_transparent_35%),linear-gradient(180deg,#f6f1e8,#dce6e9)] text-ink">
      <div className="aurora-orb left-[5%] top-[10%] h-40 w-40 bg-ember/25" />
      <div className="aurora-orb right-[9%] top-[14%] h-52 w-52 bg-sky-200/50" style={{ animationDelay: "1.2s" }} />
      <div className="aurora-orb bottom-[12%] right-[14%] h-60 w-60 bg-moss/20" style={{ animationDelay: "2.4s" }} />
      <div className="mx-auto max-w-[1500px] px-4 py-6 md:px-8">
        <div className="grid gap-6 xl:grid-cols-[280px_1fr]">
          <aside className="animate-rise rounded-[2rem] border border-white/50 bg-[linear-gradient(165deg,rgba(16,37,66,0.98),rgba(31,92,75,0.88))] p-6 text-white shadow-[0_24px_70px_rgba(16,37,66,0.24)]">
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
            <section className="glass-panel shimmer-border animate-rise rounded-[2rem] border border-white/50 p-6 shadow-panel">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-moss">Campus planning</p>
                  <h1 className="mt-3 text-4xl font-semibold tracking-tight text-ink">A clearer weekly view for faculty scheduling.</h1>
                  <p className="mt-4 max-w-3xl text-sm leading-7 text-ink/72">
                    Generate draft timetables, rebalance workloads, review conflicts, and publish changes with a planning surface that keeps both operations and faculty communication in one place.
                  </p>
                  <div className="mt-6 flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-[0.22em] text-ink/50">
                    <span className="rounded-full bg-white/75 px-3 py-2 shadow-sm">Studio mode</span>
                    <span className="rounded-full bg-white/75 px-3 py-2 shadow-sm">Live admin controls</span>
                    <span className="rounded-full bg-white/75 px-3 py-2 shadow-sm">Publish-ready review</span>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-3xl border border-moss/10 bg-[linear-gradient(135deg,rgba(31,92,75,0.12),rgba(255,255,255,0.9))] px-4 py-4 shadow-sm">
                    <p className="text-xs uppercase tracking-[0.22em] text-ink/50">Schedule status</p>
                    <p className="mt-2 text-xl font-semibold text-ink">{timetable.length > 0 ? "Draft schedule active" : "Waiting for generation"}</p>
                  </div>
                  <div className="rounded-3xl border border-ember/10 bg-[linear-gradient(135deg,rgba(217,108,61,0.12),rgba(255,255,255,0.9))] px-4 py-4 shadow-sm">
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

            <section className="glass-panel shimmer-border animate-rise rounded-[1.75rem] border border-white/50 p-5 shadow-panel">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-moss">Quick guide</p>
                  <h2 className="mt-2 text-2xl font-semibold text-ink">Best workflow for publishing a clean timetable</h2>
                </div>
                <div className="rounded-full bg-ink/5 px-4 py-2 text-sm font-medium text-ink/70">
                  {role === "ADMIN" ? "Admin workflow" : "Faculty overview"}
                </div>
              </div>
              <div className="mt-5 grid gap-3 lg:grid-cols-4">
                <div className="rounded-2xl border border-ink/8 bg-mist/35 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-ink/45">Step 1</p>
                  <p className="mt-2 font-semibold text-ink">Generate</p>
                  <p className="mt-2 text-sm leading-6 text-ink/70">Run the solver to create a draft schedule from current teaching demand.</p>
                </div>
                <div className="rounded-2xl border border-ink/8 bg-sand/60 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-ink/45">Step 2</p>
                  <p className="mt-2 font-semibold text-ink">Review</p>
                  <p className="mt-2 text-sm leading-6 text-ink/70">Inspect conflicts, workload distribution, and room allocation patterns.</p>
                </div>
                <div className="rounded-2xl border border-ink/8 bg-amber-50 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-ink/45">Step 3</p>
                  <p className="mt-2 font-semibold text-ink">Adjust</p>
                  <p className="mt-2 text-sm leading-6 text-ink/70">Drag any lecture to a new slot to apply a quick manual override.</p>
                </div>
                <div className="rounded-2xl border border-ink/8 bg-white p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-ink/45">Step 4</p>
                  <p className="mt-2 font-semibold text-ink">Publish</p>
                  <p className="mt-2 text-sm leading-6 text-ink/70">Lock the timetable and notify faculty once the week looks stable.</p>
                </div>
              </div>
            </section>

            {role === "ADMIN" ? (
              <AdminSetupPanel
                counts={{
                  faculty: facultyQuery.data?.length ?? 0,
                  courses: coursesQuery.data?.length ?? 0,
                  rooms: roomsQuery.data?.length ?? 0,
                  timeSlots: timeSlotsQuery.data?.length ?? 0,
                  demands: demandsQuery.data?.length ?? 0
                }}
                faculty={facultyQuery.data ?? []}
                courses={coursesQuery.data ?? []}
                rooms={roomsQuery.data ?? []}
                timeSlots={timeSlotsQuery.data ?? []}
                demands={demandsQuery.data ?? []}
                auditLogs={auditLogsQuery.data ?? []}
                onCreateFaculty={createFacultyMutation.mutateAsync}
                onUpdateFaculty={(facultyId, payload) => updateFacultyMutation.mutateAsync({ facultyId, payload })}
                onCreateCourse={createCourseMutation.mutateAsync}
                onUpdateCourse={(courseId, payload) => updateCourseMutation.mutateAsync({ courseId, payload })}
                onCreateRoom={createRoomMutation.mutateAsync}
                onUpdateRoom={(roomId, payload) => updateRoomMutation.mutateAsync({ roomId, payload })}
                onCreateTimeSlot={createTimeSlotMutation.mutateAsync}
                onUpdateTimeSlot={(timeSlotId, payload) => updateTimeSlotMutation.mutateAsync({ timeSlotId, payload })}
                onCreateDemand={createDemandMutation.mutateAsync}
                onUpdateDemand={(demandId, payload) => updateDemandMutation.mutateAsync({ demandId, payload })}
                onDeleteFaculty={deleteFacultyMutation.mutateAsync}
                onDeleteCourse={deleteCourseMutation.mutateAsync}
                onDeleteRoom={deleteRoomMutation.mutateAsync}
                onDeleteTimeSlot={deleteTimeSlotMutation.mutateAsync}
                onDeleteDemand={deleteDemandMutation.mutateAsync}
              />
            ) : null}

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
