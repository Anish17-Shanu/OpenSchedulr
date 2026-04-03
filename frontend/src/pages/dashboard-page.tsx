import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Activity,
  BellRing,
  Building2,
  CalendarClock,
  ChartColumn,
  GraduationCap,
  LayoutDashboard,
  RefreshCw,
  Send,
  Settings2,
  Sparkles,
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
import { AdminSetupPanel } from "../components/admin-setup-panel";
import { ConflictPanel } from "../components/conflict-panel";
import { NotificationPanel } from "../components/notification-panel";
import { StatCard } from "../components/stat-card";
import { TimetableBoard } from "../components/timetable-board";
import { Button } from "../components/ui/button";
import { subscribeToNotifications } from "../lib/realtime";
import { useAuthStore } from "../store/auth-store";
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
    <div className="relative min-h-screen overflow-hidden">
      <div className="aurora-orb left-[8%] top-[14%] h-56 w-56 bg-violet-300/40" />
      <div className="aurora-orb right-[10%] top-[8%] h-64 w-64 bg-sky-200/50" style={{ animationDelay: "1.4s" }} />
      <div className="mx-auto max-w-[1580px] px-4 py-6 md:px-6">
        <div className="grid gap-5 xl:grid-cols-[255px_1fr]">
          <aside className="glass-panel shimmer-border animate-rise rounded-[2rem] p-5 shadow-panel">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#7b61ff,#5b9bff)] text-white shadow-[0_12px_24px_rgba(91,155,255,0.22)]">
                <LayoutDashboard className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">OpenSchedulr</p>
                <p className="mt-1 text-lg font-semibold text-slate-900">Scheduler console</p>
              </div>
            </div>

            <div className="mt-6 rounded-[1.5rem] border border-slate-200 bg-[#fafbff] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Workspace</p>
              <p className="mt-2 text-base font-semibold text-slate-900">{email}</p>
              <p className="mt-1 text-sm text-slate-500">{role === "ADMIN" ? "Administrator access" : "Faculty access"}</p>
            </div>

            <div className="mt-6 space-y-2">
              <SidebarNav icon={<Sparkles className="h-4 w-4" />} label="Weekly planner" active />
              <SidebarNav icon={<CalendarClock className="h-4 w-4" />} label="Timetable reviews" />
              <SidebarNav icon={<Users className="h-4 w-4" />} label="Faculty allocation" />
              <SidebarNav icon={<Building2 className="h-4 w-4" />} label="Rooms and sections" />
              <SidebarNav icon={<Settings2 className="h-4 w-4" />} label="Scheduling inputs" />
            </div>

            <div className="mt-6 grid gap-3">
              <MiniMetric label="Conflicts" value={String(conflicts.length)} tone="orange" />
              <MiniMetric label="Signals" value={String(notifications.length)} tone="violet" />
            </div>

            <div className="mt-6 space-y-3">
              {role === "ADMIN" ? (
                <>
                  <Button className="w-full justify-center py-3" onClick={() => generateMutation.mutate()} disabled={adminBusy}>
                    <RefreshCw className={`mr-2 h-4 w-4 ${generateMutation.isPending ? "animate-spin" : ""}`} />
                    {generateMutation.isPending ? "Generating..." : "Generate timetable"}
                  </Button>
                  <Button variant="outline" className="w-full justify-center py-3" onClick={() => publishMutation.mutate()} disabled={adminBusy}>
                    <Send className="mr-2 h-4 w-4" />
                    {publishMutation.isPending ? "Publishing..." : "Publish"}
                  </Button>
                </>
              ) : null}
              <Button variant="outline" className="w-full justify-center py-3" onClick={logout}>Logout</Button>
            </div>
          </aside>

          <main className="space-y-5">
            <section className="mesh-card shimmer-border animate-rise rounded-[2rem] p-5 shadow-panel">
              <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                <div className="max-w-3xl">
                  <div className="section-kicker">
                    <Sparkles className="h-3.5 w-3.5" />
                    Smart planning workspace
                  </div>
                  <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-900 md:text-[2.8rem]">
                    Build, review, and publish clean faculty schedules.
                  </h1>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    A lighter scheduling studio inspired by modern planning products, with richer timetable views, clearer controls, and a cleaner weekly workflow.
                  </p>
                  <div className="mt-5 flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    <span className="rounded-full border border-slate-200 bg-white px-3 py-2 shadow-sm">Board + table review</span>
                    <span className="rounded-full border border-slate-200 bg-white px-3 py-2 shadow-sm">Faculty / room filters</span>
                    <span className="rounded-full border border-slate-200 bg-white px-3 py-2 shadow-sm">Publish workflow</span>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-3 xl:w-[520px] xl:grid-cols-1">
                  <HeroPanel title="Status" value={timetable.length > 0 ? "Draft ready" : "Awaiting generation"} helper="The timetable board updates as soon as sessions are generated or moved." />
                  <HeroPanel title="Action state" value={adminBusy ? "Processing" : "Ready"} helper="Generate and publish stay available in the sidebar for quick control." />
                  <HeroPanel title="Signals" value={`${notifications.length} live`} helper="Notifications and conflict checks remain visible while reviewing the week." />
                </div>
              </div>
            </section>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <StatCard label="Faculty" value={facultyQuery.data?.length ?? 0} helper="Load, availability, and subject alignment." icon={<Users className="h-5 w-5" />} accent="from-[#ede9ff] to-white" />
              <StatCard label="Courses" value={coursesQuery.data?.length ?? 0} helper="Subjects mapped to section, program, and room type." icon={<GraduationCap className="h-5 w-5" />} accent="from-[#eef4ff] to-white" />
              <StatCard label="Sessions" value={stats?.totalEntries ?? 0} helper="Draft and published entries currently in the planner." icon={<CalendarClock className="h-5 w-5" />} accent="from-[#edfdf4] to-white" />
              <StatCard label="Conflicts" value={stats?.totalConflicts ?? 0} helper="Problems surfaced before final publication." icon={<Activity className="h-5 w-5" />} accent="from-[#fff4ea] to-white" />
            </div>

            <div className="grid gap-5 2xl:grid-cols-[1.8fr_1fr]">
              <div className="space-y-5">
                <TimetableBoard
                  timetable={timetable}
                  timeSlots={timeSlotsQuery.data ?? []}
                  rooms={roomsQuery.data ?? []}
                  onDrop={(entryId, roomId, timeSlotId) => {
                    if (role === "ADMIN") {
                      rescheduleMutation.mutate({ entryId, roomId, timeSlotId });
                    }
                  }}
                />

                <div className="grid gap-4 xl:grid-cols-2">
                  <div className="glass-panel rounded-[1.5rem] p-5 shadow-panel">
                    <div className="flex items-center gap-3">
                      <ChartColumn className="h-5 w-5 text-[#6b57e7]" />
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">Workload balance</h3>
                        <p className="text-sm text-slate-500">Fast visual scan of teaching distribution across faculty.</p>
                      </div>
                    </div>
                    <div className="mt-5 space-y-4">
                      {workload.map(([name, count]) => (
                        <div key={name}>
                          <div className="mb-2 flex items-center justify-between text-sm text-slate-600">
                            <span>{name}</span>
                            <span className="font-semibold">{count} sessions</span>
                          </div>
                          <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                            <div className="h-full rounded-full bg-[linear-gradient(90deg,#7b61ff,#5b9bff)]" style={{ width: `${Math.min(Number(count) * 20, 100)}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="glass-panel rounded-[1.5rem] p-5 shadow-panel">
                    <div className="flex items-center gap-3">
                      <BellRing className="h-5 w-5 text-[#5b9bff]" />
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">Room utilization</h3>
                        <p className="text-sm text-slate-500">Spot crowded rooms and underused teaching spaces quickly.</p>
                      </div>
                    </div>
                    <div className="mt-5 space-y-3">
                      {roomUtilization.map(([room, count]) => (
                        <div key={room} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium text-slate-800">{room}</span>
                            <span className="font-semibold text-slate-600">{count} sessions</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-5">
                <ConflictPanel conflicts={conflicts} />
                <NotificationPanel notifications={notifications} />
              </div>
            </div>

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
          </main>
        </div>
      </div>
    </div>
  );
}

function SidebarNav({ icon, label, active = false }: { icon: ReactNode; label: string; active?: boolean }) {
  return (
    <div className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${active ? "bg-[#f1edff] text-[#6b57e7] shadow-sm" : "text-slate-500 hover:bg-slate-50"}`}>
      <span className={active ? "text-[#6b57e7]" : "text-slate-400"}>{icon}</span>
      <span>{label}</span>
    </div>
  );
}

function MiniMetric({ label, value, tone }: { label: string; value: string; tone: "orange" | "violet" }) {
  const tones = {
    orange: "bg-[#fff4ea] text-[#d97a2b]",
    violet: "bg-[#f1edff] text-[#6b57e7]"
  };

  return (
    <div className={`rounded-[1.4rem] border border-slate-200 p-4 ${tones[tone]}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.22em] opacity-70">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}

function HeroPanel({ title, value, helper }: { title: string; value: string; helper: string }) {
  return (
    <div className="hero-metric rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-[0_14px_30px_rgba(18,27,44,0.06)]">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">{title}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
      <p className="mt-2 text-sm leading-6 text-slate-500">{helper}</p>
    </div>
  );
}
