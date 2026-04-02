import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarClock, ChartColumn, RefreshCw, Send } from "lucide-react";
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
  const notifications = [...liveNotifications, ...(notificationsQuery.data ?? [])].slice(0, 10);

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f4efe6,#dce6e9)] text-ink">
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-8">
        <div className="rounded-[2rem] border border-white/40 bg-[linear-gradient(120deg,rgba(16,37,66,0.96),rgba(31,92,75,0.88))] p-6 text-white shadow-panel">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-white/70">OpenSchedulr</p>
              <h1 className="mt-3 text-3xl font-semibold">Zero-cost faculty scheduling for modern campuses</h1>
              <p className="mt-2 max-w-3xl text-sm text-white/75">
                Modular-monolith platform with Java 21, Spring Boot, OptaPlanner, WebSockets, React, and PostgreSQL-ready deployment.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {role === "ADMIN" ? (
                <>
                  <Button variant="secondary" onClick={() => generateMutation.mutate()}>
                    <RefreshCw className="mr-2 inline h-4 w-4" />
                    Generate timetable
                  </Button>
                  <Button variant="outline" onClick={() => publishMutation.mutate()}>
                    <Send className="mr-2 inline h-4 w-4" />
                    Publish
                  </Button>
                </>
              ) : null}
              <Button variant="outline" onClick={logout}>Logout</Button>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Faculty" value={facultyQuery.data?.length ?? 0} helper="Availability and workload tracked" />
          <StatCard label="Courses" value={coursesQuery.data?.length ?? 0} helper="Mapped to room types and student groups" />
          <StatCard label="Sessions" value={stats?.totalEntries ?? 0} helper="Current draft or published assignments" />
          <StatCard label="Conflicts" value={stats?.totalConflicts ?? 0} helper="Warnings surfaced for manual intervention" />
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[2fr_1fr]">
          <div className="space-y-6">
            <TimetableBoard
              timetable={timetableQuery.data ?? []}
              timeSlots={timeSlotsQuery.data ?? []}
              rooms={roomsQuery.data ?? []}
              onDrop={(entryId, roomId, timeSlotId) => role === "ADMIN" && rescheduleMutation.mutate({ entryId, roomId, timeSlotId })}
            />
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-3xl border border-white/40 bg-white/85 p-5 shadow-panel">
                <div className="flex items-center gap-3">
                  <ChartColumn className="h-5 w-5 text-moss" />
                  <h3 className="text-lg font-semibold">Workload Balance</h3>
                </div>
                <div className="mt-4 space-y-2 text-sm text-ink/75">
                  {Object.entries(stats?.workloadDistribution ?? {}).map(([name, count]) => (
                    <div key={name} className="flex items-center justify-between rounded-2xl bg-mist/50 px-3 py-2">
                      <span>{name}</span>
                      <span className="font-semibold">{count} sessions</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-3xl border border-white/40 bg-white/85 p-5 shadow-panel">
                <div className="flex items-center gap-3">
                  <CalendarClock className="h-5 w-5 text-ember" />
                  <h3 className="text-lg font-semibold">Room Utilization</h3>
                </div>
                <div className="mt-4 space-y-2 text-sm text-ink/75">
                  {Object.entries(stats?.roomUtilization ?? {}).map(([room, count]) => (
                    <div key={room} className="flex items-center justify-between rounded-2xl bg-sand px-3 py-2">
                      <span>{room}</span>
                      <span className="font-semibold">{count} sessions</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <ConflictPanel conflicts={conflictsQuery.data ?? []} />
            <NotificationPanel notifications={notifications} />
          </div>
        </div>
      </div>
    </div>
  );
}
