import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CalendarClock,
  GraduationCap,
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

  return (
  <div className="relative min-h-screen overflow-hidden bg-[#05070f] text-white">

    {/* BACKGROUND GLOW + NOISE */}
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute left-[10%] top-[10%] h-72 w-72 bg-indigo-500/20 blur-[140px] rounded-full animate-pulse" />
      <div className="absolute right-[10%] bottom-[10%] h-80 w-80 bg-emerald-500/20 blur-[160px] rounded-full animate-pulse" />
    </div>

    <div className="relative mx-auto max-w-[1600px] px-6 py-8 space-y-8">

      {/* TOP BAR */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-6 py-4 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.5)]">

        <div className="flex items-center gap-3 text-sm text-white/70">
          <span className="uppercase tracking-widest text-xs text-white/40">Workspace</span>
          <span className="px-3 py-1 rounded-full bg-white/10">Realtime</span>
          <span className="px-3 py-1 rounded-full bg-white/10">Scheduler</span>
        </div>

        <div className="flex items-center gap-3 text-sm">
          <span className="text-white/50">{email}</span>

          {role === "ADMIN" && (
            <>
              <Button
                onClick={() => generateMutation.mutate()}
                className="transition hover:scale-[1.05] active:scale-[0.95]"
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${generateMutation.isPending ? "animate-spin" : ""}`} />
                Generate
              </Button>

              <Button
                variant="outline"
                onClick={() => publishMutation.mutate()}
                className="transition hover:scale-[1.05] active:scale-[0.95]"
              >
                <Send className="mr-2 h-4 w-4" />
                Publish
              </Button>
            </>
          )}

          <Button
            variant="outline"
            onClick={logout}
            className="transition hover:scale-[1.05] active:scale-[0.95]"
          >
            Logout
          </Button>
        </div>
      </div>

      {/* GRID */}
      <div className="grid gap-8 xl:grid-cols-[320px_1fr]">

        {/* SIDEBAR */}
        <aside className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#0b1220] to-[#020617] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.6)] space-y-6">

          <div>
            <p className="text-xs uppercase text-white/40 tracking-widest">OpenSchedulr</p>
            <h2 className="text-2xl font-semibold mt-2">Studio Mode</h2>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <p className="text-xs text-white/50">User</p>
            <p className="font-semibold">{email}</p>
            <p className="text-sm text-white/50">{role}</p>
          </div>

          <div className="grid gap-3">
            <div className="bg-white/5 p-4 rounded-xl">
              <p className="text-xs text-white/50">Conflicts</p>
              <p className="text-2xl font-bold">{conflicts.length}</p>
            </div>

            <div className="bg-white/5 p-4 rounded-xl">
              <p className="text-xs text-white/50">Notifications</p>
              <p className="text-2xl font-bold">{notifications.length}</p>
            </div>
          </div>

        </aside>

        {/* MAIN */}
        <main className="space-y-8">

          {/* HERO */}
          <section className="rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-xl p-8 shadow-[0_30px_100px_rgba(0,0,0,0.6)]">

            <h1 className="text-5xl font-semibold tracking-tight">
              A modern scheduling control room.
            </h1>

            <p className="mt-4 text-white/60 max-w-2xl">
              Generate, refine, and publish faculty schedules with clarity, speed, and full control.
            </p>

            <div className="grid gap-4 mt-6 md:grid-cols-3">
              <StatCard label="Faculty" value={facultyQuery.data?.length ?? 0} icon={<Users />} helper="Active faculty members" />
              <StatCard label="Courses" value={coursesQuery.data?.length ?? 0} icon={<GraduationCap />} helper="Total courses" />
              <StatCard label="Sessions" value={stats?.totalEntries ?? 0} icon={<CalendarClock />} helper="Scheduled sessions" />
            </div>

          </section>

          {/* TIMETABLE */}
          <div className="rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-xl p-6 shadow-xl">
            <TimetableBoard
              timetable={timetable}
              timeSlots={timeSlotsQuery.data ?? []}
              rooms={roomsQuery.data ?? []}
              onDrop={(entryId, roomId, timeSlotId) =>
                role === "ADMIN" &&
                rescheduleMutation.mutate({ entryId, roomId, timeSlotId })
              }
            />
          </div>

          {/* ANALYTICS */}
          <div className="grid gap-6 md:grid-cols-2">

            <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
              <h3 className="mb-4 font-semibold">Workload</h3>

              {workload.map(([name, count]) => (
                <div key={name} className="mb-3">
                  <div className="flex justify-between text-sm text-white/70">
                    <span>{name}</span>
                    <span>{count}</span>
                  </div>

                  <div className="h-2 bg-white/10 rounded-full mt-1">
                    <div
                      className="h-full bg-indigo-500 rounded-full transition-all"
                    />
                  </div>
                </div>
              ))}

            </div>

            <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
              <h3 className="mb-4 font-semibold">Room Usage</h3>

              {roomUtilization.map(([room, count]) => (
                <div key={room} className="flex justify-between text-sm py-1 text-white/70">
                  <span>{room}</span>
                  <span>{count}</span>
                </div>
              ))}

            </div>

          </div>

          {/* PANELS */}
          <div className="grid gap-6 xl:grid-cols-[1.8fr_1fr]">
            <ConflictPanel conflicts={conflicts} />
            <NotificationPanel notifications={notifications} />
          </div>

          {/* ADMIN */}
          {role === "ADMIN" && (
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
              onUpdateFaculty={(id, payload) => updateFacultyMutation.mutateAsync({ facultyId: id, payload })}
              onCreateCourse={createCourseMutation.mutateAsync}
              onUpdateCourse={(id, payload) => updateCourseMutation.mutateAsync({ courseId: id, payload })}
              onCreateRoom={createRoomMutation.mutateAsync}
              onUpdateRoom={(id, payload) => updateRoomMutation.mutateAsync({ roomId: id, payload })}
              onCreateTimeSlot={createTimeSlotMutation.mutateAsync}
              onUpdateTimeSlot={(id, payload) => updateTimeSlotMutation.mutateAsync({ timeSlotId: id, payload })}
              onCreateDemand={createDemandMutation.mutateAsync}
              onUpdateDemand={(id, payload) => updateDemandMutation.mutateAsync({ demandId: id, payload })}
              onDeleteFaculty={deleteFacultyMutation.mutateAsync}
              onDeleteCourse={deleteCourseMutation.mutateAsync}
              onDeleteRoom={deleteRoomMutation.mutateAsync}
              onDeleteTimeSlot={deleteTimeSlotMutation.mutateAsync}
              onDeleteDemand={deleteDemandMutation.mutateAsync}
            />
          )}

        </main>
      </div>
    </div>
  </div>
)};