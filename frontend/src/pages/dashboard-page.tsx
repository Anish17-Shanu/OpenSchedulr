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
import { subscribeToNotifications } from "../lib/realtime";
import { ConflictPanel } from "../components/conflict-panel";
import { NotificationPanel } from "../components/notification-panel";
import { StatCard } from "../components/stat-card";
import { TimetableBoard } from "../components/timetable-board";
import { AdminSetupPanel } from "../components/admin-setup-panel";
import { Button } from "../components/ui/button";
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
      <div className="aurora-orb left-[5%] top-[8%] h-56 w-56 bg-indigo-500/24" />
      <div className="aurora-orb right-[8%] top-[10%] h-72 w-72 bg-sky-400/14" style={{ animationDelay: "1.4s" }} />
      <div className="aurora-orb bottom-[8%] right-[12%] h-72 w-72 bg-emerald-500/16" style={{ animationDelay: "2.5s" }} />

      <div className="mx-auto max-w-[1600px] px-4 py-6 md:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-[1.5rem] border border-white/10 bg-white/5 px-4 py-3 shadow-[0_18px_44px_rgba(0,0,0,0.24)] backdrop-blur-xl">
          <div className="flex flex-wrap items-center gap-3 text-sm text-white/70">
            <span className="section-kicker">
              <Sparkles className="h-3.5 w-3.5" />
              Modern scheduling workspace
            </span>
            <span className="rounded-full border border-white/8 bg-white/6 px-3 py-2 font-medium">Realtime review</span>
            <span className="rounded-full border border-white/8 bg-white/6 px-3 py-2 font-medium">Planner studio</span>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm text-white/60">
            <span className="rounded-full border border-emerald-500/18 bg-emerald-500/10 px-3 py-2">{timetable.length} sessions</span>
            <span className="rounded-full border border-amber-400/18 bg-amber-400/10 px-3 py-2">{conflicts.length} conflict markers</span>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[300px_1fr]">
          <aside className="mesh-card shimmer-border animate-rise rounded-[2rem] p-6 text-white shadow-[0_28px_80px_rgba(0,0,0,0.32)]">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/6 p-3">
                <LayoutDashboard className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-white/40">OpenSchedulr</p>
                <p className="mt-1 text-lg font-semibold">Operations console</p>
              </div>
            </div>

            <div className="mt-6 rounded-[1.75rem] border border-white/10 bg-white/6 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-white/42">Control stance</p>
              <p className="mt-3 text-2xl font-semibold">Studio mode</p>
              <p className="mt-2 text-sm leading-6 text-white/60">Generate, inspect, override, and publish from one modern review loop.</p>
            </div>

            <div className="mt-6 rounded-[1.75rem] border border-white/10 bg-white/6 p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-white/42">Signed in</p>
              <p className="mt-3 break-all text-lg font-semibold">{email}</p>
              <p className="mt-1 text-sm text-white/62">{role === "ADMIN" ? "Administrator" : "Faculty member"}</p>
            </div>

            <div className="mt-6 space-y-3">
              <SidebarMetric label="Planner health" value={conflicts.length === 0 ? "Stable" : "Needs review"} helper={conflicts.length === 0 ? "No critical issues detected right now." : `${conflicts.length} active issue${conflicts.length === 1 ? "" : "s"} to review.`} />
              <SidebarMetric label="Live signals" value={String(notifications.length)} helper="Recent planner and faculty notification events." />
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              {role === "ADMIN" ? (
                <>
                  <Button variant="secondary" className="w-full justify-center bg-white text-slate-950 hover:bg-slate-100" onClick={() => generateMutation.mutate()} disabled={adminBusy}>
                    <RefreshCw className={`mr-2 h-4 w-4 ${generateMutation.isPending ? "animate-spin" : ""}`} />
                    {generateMutation.isPending ? "Generating..." : "Generate timetable"}
                  </Button>
                  <Button variant="outline" className="w-full justify-center border-white/14 bg-white/6 text-white hover:bg-white/12" onClick={() => publishMutation.mutate()} disabled={adminBusy}>
                    <Send className="mr-2 h-4 w-4" />
                    {publishMutation.isPending ? "Publishing..." : "Publish"}
                  </Button>
                </>
              ) : null}
              <Button variant="outline" className="w-full justify-center border-white/14 bg-white/6 text-white hover:bg-white/12" onClick={logout}>
                Logout
              </Button>
            </div>
          </aside>

          <main className="space-y-6">
            <section className="mesh-card shimmer-border animate-rise overflow-hidden rounded-[2rem] p-6 shadow-[0_28px_80px_rgba(0,0,0,0.32)]">
              <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
                <div>
                  <div className="section-kicker">Campus planning</div>
                  <h1 className="mt-5 max-w-4xl text-4xl font-semibold tracking-tight text-white md:text-5xl">
                    A modern control room for faculty scheduling.
                  </h1>
                  <p className="mt-4 max-w-3xl text-sm leading-7 text-white/62">
                    Generate draft timetables, balance workload, review conflicts, and publish changes with a cleaner visual system and much stronger timetable navigation.
                  </p>
                  <div className="mt-6 flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-white/58">
                    <span className="rounded-full border border-white/10 bg-white/6 px-3 py-2">Live admin controls</span>
                    <span className="rounded-full border border-white/10 bg-white/6 px-3 py-2">Quick schedule filters</span>
                    <span className="rounded-full border border-white/10 bg-white/6 px-3 py-2">Publish-ready workflow</span>
                  </div>
                  <div className="mt-8 grid gap-4 md:grid-cols-3">
                    <HeroMetric title="Generator" value={adminBusy ? "Working now" : "Ready"} text="Generate and publish from the same control surface." />
                    <HeroMetric title="Review" value={timetable.length > 0 ? "Schedule loaded" : "Waiting"} text="Switch between weekly, room, faculty, section, batch, and program views." />
                    <HeroMetric title="Collaboration" value={`${notifications.length} signals`} text="Notifications and analytics stay visible while you review the draft." />
                  </div>
                </div>

                <div className="grid gap-4">
                  <HeroStatusCard
                    title="Schedule status"
                    value={timetable.length > 0 ? "Draft schedule active" : "Waiting for generation"}
                    text="Create a draft, adjust with drag-and-drop, and publish once the week feels clean."
                    variant="emerald"
                  />
                  <HeroStatusCard
                    title="Last action"
                    value={adminBusy ? "Processing update" : "Ready for next change"}
                    text="Setup, review, and publishing now live in one visual rhythm."
                    variant="indigo"
                  />
                  <div className="rounded-[1.75rem] border border-white/10 bg-[linear-gradient(135deg,rgba(99,102,241,0.18),rgba(7,12,22,0.92))] p-5 text-white shadow-[0_24px_55px_rgba(0,0,0,0.3)]">
                    <p className="text-xs uppercase tracking-[0.22em] text-white/48">Experience goal</p>
                    <p className="mt-3 text-xl font-semibold">Modern product feel, not plain CRUD.</p>
                    <p className="mt-3 text-sm leading-6 text-white/62">This rebuild focuses on stronger hierarchy, better surfaces, and a more polished timetable review experience.</p>
                  </div>
                </div>
              </div>
            </section>

            <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
              <StatCard label="Faculty" value={facultyQuery.data?.length ?? 0} helper="Availability, subjects, and load caps are actively tracked." icon={<Users className="h-5 w-5" />} accent="from-indigo-500/15 to-white/5" />
              <StatCard label="Courses" value={coursesQuery.data?.length ?? 0} helper="Programs, batches, sections, and room types stay attached to every subject." icon={<GraduationCap className="h-5 w-5" />} accent="from-sky-400/12 to-white/5" />
              <StatCard label="Sessions" value={stats?.totalEntries ?? 0} helper="Draft and published sessions currently in the planner." icon={<CalendarClock className="h-5 w-5" />} accent="from-emerald-500/12 to-white/5" />
              <StatCard label="Conflicts" value={stats?.totalConflicts ?? 0} helper="Warnings surface early before anything gets published." icon={<Activity className="h-5 w-5" />} accent="from-amber-400/12 to-white/5" />
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

            <div className="grid gap-6 2xl:grid-cols-[1.8fr_1fr]">
              <div className="space-y-6">
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
                  <div className="mesh-card rounded-[1.75rem] p-5 shadow-[0_24px_55px_rgba(0,0,0,0.24)]">
                    <div className="flex items-center gap-3">
                      <ChartColumn className="h-5 w-5 text-emerald-300" />
                      <div>
                        <h3 className="text-lg font-semibold text-white">Workload balance</h3>
                        <p className="text-sm text-white/54">Quick scan of teaching distribution across faculty.</p>
                      </div>
                    </div>
                    <div className="mt-5 space-y-3">
                      {workload.map(([name, count]) => (
                        <div key={name}>
                          <div className="mb-2 flex items-center justify-between text-sm text-white/72">
                            <span>{name}</span>
                            <span className="font-semibold">{count} sessions</span>
                          </div>
                          <div className="h-3 overflow-hidden rounded-full bg-white/8">
                            <div className="h-full rounded-full bg-[linear-gradient(90deg,#818cf8,#38bdf8,#22c55e)]" style={{ width: `${Math.min(Number(count) * 20, 100)}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mesh-card rounded-[1.75rem] p-5 shadow-[0_24px_55px_rgba(0,0,0,0.24)]">
                    <div className="flex items-center gap-3">
                      <BellRing className="h-5 w-5 text-sky-300" />
                      <div>
                        <h3 className="text-lg font-semibold text-white">Room utilization</h3>
                        <p className="text-sm text-white/54">Identify busy spaces and underused teaching rooms.</p>
                      </div>
                    </div>
                    <div className="mt-5 space-y-3">
                      {roomUtilization.map(([room, count]) => (
                        <div key={room} className="rounded-2xl border border-white/8 bg-white/6 px-4 py-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium text-white">{room}</span>
                            <span className="font-semibold text-white/78">{count} sessions</span>
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

function SidebarMetric({ label, value, helper }: { label: string; value: string; helper: string }) {
  return (
    <div className="rounded-[1.4rem] border border-white/10 bg-white/6 p-4">
      <p className="text-xs uppercase tracking-[0.22em] text-white/42">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
      <p className="mt-2 text-sm leading-6 text-white/56">{helper}</p>
    </div>
  );
}

function HeroMetric({ title, value, text }: { title: string; value: string; text: string }) {
  return (
    <div className="hero-metric rounded-[1.5rem] border border-white/10 bg-white/6 p-4 shadow-[0_18px_38px_rgba(0,0,0,0.22)]">
      <p className="text-xs uppercase tracking-[0.22em] text-white/44">{title}</p>
      <p className="mt-3 text-2xl font-semibold text-white">{value}</p>
      <p className="mt-2 text-sm leading-6 text-white/58">{text}</p>
    </div>
  );
}

function HeroStatusCard({
  title,
  value,
  text,
  variant
}: {
  title: string;
  value: string;
  text: string;
  variant: "emerald" | "indigo";
}) {
  const surface =
    variant === "emerald"
      ? "bg-[linear-gradient(145deg,rgba(34,197,94,0.12),rgba(8,16,31,0.88))]"
      : "bg-[linear-gradient(145deg,rgba(99,102,241,0.14),rgba(8,16,31,0.88))]";

  return (
    <div className={`soft-ring rounded-[1.75rem] border border-white/10 ${surface} p-5`}>
      <p className="text-xs uppercase tracking-[0.22em] text-white/44">{title}</p>
      <p className="mt-3 text-2xl font-semibold text-white">{value}</p>
      <p className="mt-3 text-sm leading-6 text-white/58">{text}</p>
    </div>
  );
}
