import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Building2, CalendarRange, GraduationCap, History, Trash2, Users } from "lucide-react";
import type {
  AuditLog,
  Course,
  CreateCoursePayload,
  CreateFacultyPayload,
  CreateLectureDemandPayload,
  CreateRoomPayload,
  CreateTimeSlotPayload,
  Faculty,
  LectureDemand,
  Room,
  TimeSlot
} from "../types";
import { Button } from "./ui/button";

type AdminSetupPanelProps = {
  counts: {
    faculty: number;
    courses: number;
    rooms: number;
    timeSlots: number;
    demands: number;
  };
  faculty: Faculty[];
  courses: Course[];
  rooms: Room[];
  timeSlots: TimeSlot[];
  demands: LectureDemand[];
  auditLogs: AuditLog[];
  onCreateFaculty: (payload: CreateFacultyPayload) => Promise<unknown>;
  onCreateCourse: (payload: CreateCoursePayload) => Promise<unknown>;
  onCreateRoom: (payload: CreateRoomPayload) => Promise<unknown>;
  onCreateTimeSlot: (payload: CreateTimeSlotPayload) => Promise<unknown>;
  onCreateDemand: (payload: CreateLectureDemandPayload) => Promise<unknown>;
  onDeleteFaculty: (facultyId: string) => Promise<unknown>;
  onDeleteCourse: (courseId: string) => Promise<unknown>;
  onDeleteRoom: (roomId: string) => Promise<unknown>;
  onDeleteTimeSlot: (timeSlotId: string) => Promise<unknown>;
  onDeleteDemand: (demandId: string) => Promise<unknown>;
};

const cardShell = "rounded-[1.75rem] border border-white/50 bg-white/90 p-5 shadow-panel";
const panelShell = "rounded-3xl border border-ink/8 p-5";
const inputClassName =
  "w-full rounded-2xl border border-ink/10 bg-sand/65 px-4 py-3 text-sm text-ink outline-none transition focus:border-moss/35 focus:bg-white";

export function AdminSetupPanel({
  counts,
  faculty,
  courses,
  rooms,
  timeSlots,
  demands,
  auditLogs,
  onCreateFaculty,
  onCreateCourse,
  onCreateRoom,
  onCreateTimeSlot,
  onCreateDemand,
  onDeleteFaculty,
  onDeleteCourse,
  onDeleteRoom,
  onDeleteTimeSlot,
  onDeleteDemand
}: AdminSetupPanelProps) {
  const [message, setMessage] = useState<string | null>(null);

  const [facultyForm, setFacultyForm] = useState({
    fullName: "",
    email: "",
    department: "",
    maxLoad: "12",
    availability: '{"days":["MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY"]}',
    preferences: '{"preferredTime":"09:00-13:00"}',
    password: "Faculty@123"
  });
  const [courseForm, setCourseForm] = useState({
    code: "",
    title: "",
    credits: "3",
    requiredHours: "3",
    studentGroup: "",
    roomType: "LECTURE"
  });
  const [roomForm, setRoomForm] = useState({
    name: "",
    capacity: "40",
    roomType: "LECTURE"
  });
  const [timeSlotForm, setTimeSlotForm] = useState({
    dayOfWeek: "MONDAY",
    startTime: "09:00",
    endTime: "10:00",
    label: ""
  });
  const [demandForm, setDemandForm] = useState({
    courseId: "",
    facultyId: "",
    sessionsPerWeek: "2"
  });

  const facultyMutation = useMutation({
    mutationFn: onCreateFaculty,
    onSuccess: () => {
      setMessage("Faculty member created. The scheduler can use them immediately.");
      setFacultyForm({
        fullName: "",
        email: "",
        department: "",
        maxLoad: "12",
        availability: '{"days":["MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY"]}',
        preferences: '{"preferredTime":"09:00-13:00"}',
        password: "Faculty@123"
      });
    }
  });
  const courseMutation = useMutation({
    mutationFn: onCreateCourse,
    onSuccess: () => {
      setMessage("Course added to the scheduling pool.");
      setCourseForm({ code: "", title: "", credits: "3", requiredHours: "3", studentGroup: "", roomType: "LECTURE" });
    }
  });
  const roomMutation = useMutation({
    mutationFn: onCreateRoom,
    onSuccess: () => {
      setMessage("Room added. It is now available to the solver.");
      setRoomForm({ name: "", capacity: "40", roomType: "LECTURE" });
    }
  });
  const timeSlotMutation = useMutation({
    mutationFn: onCreateTimeSlot,
    onSuccess: () => {
      setMessage("Time slot added to the weekly grid.");
      setTimeSlotForm({ dayOfWeek: "MONDAY", startTime: "09:00", endTime: "10:00", label: "" });
    }
  });
  const demandMutation = useMutation({
    mutationFn: onCreateDemand,
    onSuccess: () => {
      setMessage("Teaching demand added. The next schedule run will include it.");
      setDemandForm({ courseId: "", facultyId: "", sessionsPerWeek: "2" });
    }
  });

  const deleteFacultyMutation = useMutation({ mutationFn: onDeleteFaculty, onSuccess: () => setMessage("Faculty removed.") });
  const deleteCourseMutation = useMutation({ mutationFn: onDeleteCourse, onSuccess: () => setMessage("Course removed.") });
  const deleteRoomMutation = useMutation({ mutationFn: onDeleteRoom, onSuccess: () => setMessage("Room removed.") });
  const deleteTimeSlotMutation = useMutation({ mutationFn: onDeleteTimeSlot, onSuccess: () => setMessage("Time slot removed.") });
  const deleteDemandMutation = useMutation({ mutationFn: onDeleteDemand, onSuccess: () => setMessage("Teaching demand removed.") });

  return (
    <section className={cardShell}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-moss">Admin setup</p>
          <h2 className="mt-2 text-2xl font-semibold text-ink">Manage scheduler inputs, teaching demand, and audit activity</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-ink/70">
            This completes the operational flow: define the supply, define who teaches what and how often, clean up mistakes, then generate and publish the timetable.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          <SetupCount icon={<Users className="h-4 w-4" />} label="Faculty" value={counts.faculty} />
          <SetupCount icon={<GraduationCap className="h-4 w-4" />} label="Courses" value={counts.courses} />
          <SetupCount icon={<Building2 className="h-4 w-4" />} label="Rooms" value={counts.rooms} />
          <SetupCount icon={<CalendarRange className="h-4 w-4" />} label="Slots" value={counts.timeSlots} />
          <SetupCount icon={<History className="h-4 w-4" />} label="Demands" value={counts.demands} />
        </div>
      </div>

      {message ? <p className="mt-5 rounded-2xl border border-moss/15 bg-moss/5 px-4 py-3 text-sm text-moss">{message}</p> : null}

      <div className="mt-6 grid gap-5 2xl:grid-cols-2">
        <form className={`${panelShell} bg-mist/30`} onSubmit={(event) => {
          event.preventDefault();
          setMessage(null);
          facultyMutation.mutate({
            fullName: facultyForm.fullName,
            email: facultyForm.email,
            department: facultyForm.department,
            maxLoad: Number(facultyForm.maxLoad),
            availability: facultyForm.availability,
            preferences: facultyForm.preferences,
            password: facultyForm.password
          });
        }}>
          <SectionHeader icon={<Users className="h-5 w-5 text-moss" />} title="Add faculty" subtitle="Create teaching staff and their scheduling profile in one go." />
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <input className={inputClassName} placeholder="Full name" value={facultyForm.fullName} onChange={(event) => setFacultyForm((current) => ({ ...current, fullName: event.target.value }))} />
            <input className={inputClassName} placeholder="Email" type="email" value={facultyForm.email} onChange={(event) => setFacultyForm((current) => ({ ...current, email: event.target.value }))} />
            <input className={inputClassName} placeholder="Department" value={facultyForm.department} onChange={(event) => setFacultyForm((current) => ({ ...current, department: event.target.value }))} />
            <input className={inputClassName} placeholder="Max weekly load" type="number" min="1" value={facultyForm.maxLoad} onChange={(event) => setFacultyForm((current) => ({ ...current, maxLoad: event.target.value }))} />
            <input className={inputClassName} placeholder="Initial password" type="text" value={facultyForm.password} onChange={(event) => setFacultyForm((current) => ({ ...current, password: event.target.value }))} />
          </div>
          <textarea className={`${inputClassName} mt-3 min-h-24`} placeholder='Availability JSON, e.g. {"days":["MONDAY"]}' value={facultyForm.availability} onChange={(event) => setFacultyForm((current) => ({ ...current, availability: event.target.value }))} />
          <textarea className={`${inputClassName} mt-3 min-h-24`} placeholder='Preferences JSON, e.g. {"preferredTime":"09:00-13:00"}' value={facultyForm.preferences} onChange={(event) => setFacultyForm((current) => ({ ...current, preferences: event.target.value }))} />
          <MutationFooter error={facultyMutation.error?.message}>
            <Button className="w-full md:w-auto" type="submit" disabled={facultyMutation.isPending}>{facultyMutation.isPending ? "Saving faculty..." : "Add faculty member"}</Button>
          </MutationFooter>
        </form>

        <form className={`${panelShell} bg-sand/55`} onSubmit={(event) => {
          event.preventDefault();
          setMessage(null);
          courseMutation.mutate({
            code: courseForm.code,
            title: courseForm.title,
            credits: Number(courseForm.credits),
            requiredHours: Number(courseForm.requiredHours),
            studentGroup: courseForm.studentGroup,
            roomType: courseForm.roomType
          });
        }}>
          <SectionHeader icon={<GraduationCap className="h-5 w-5 text-ember" />} title="Add course" subtitle="Expand the class load that needs to be scheduled." />
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <input className={inputClassName} placeholder="Course code" value={courseForm.code} onChange={(event) => setCourseForm((current) => ({ ...current, code: event.target.value }))} />
            <input className={inputClassName} placeholder="Student group" value={courseForm.studentGroup} onChange={(event) => setCourseForm((current) => ({ ...current, studentGroup: event.target.value }))} />
            <input className={`${inputClassName} md:col-span-2`} placeholder="Course title" value={courseForm.title} onChange={(event) => setCourseForm((current) => ({ ...current, title: event.target.value }))} />
            <input className={inputClassName} placeholder="Credits" type="number" min="1" value={courseForm.credits} onChange={(event) => setCourseForm((current) => ({ ...current, credits: event.target.value }))} />
            <input className={inputClassName} placeholder="Required hours" type="number" min="1" value={courseForm.requiredHours} onChange={(event) => setCourseForm((current) => ({ ...current, requiredHours: event.target.value }))} />
            <input className={inputClassName} placeholder="Room type" value={courseForm.roomType} onChange={(event) => setCourseForm((current) => ({ ...current, roomType: event.target.value }))} />
          </div>
          <MutationFooter error={courseMutation.error?.message}>
            <Button className="w-full md:w-auto" type="submit" disabled={courseMutation.isPending}>{courseMutation.isPending ? "Saving course..." : "Add course"}</Button>
          </MutationFooter>
        </form>

        <form className={`${panelShell} bg-white`} onSubmit={(event) => {
          event.preventDefault();
          setMessage(null);
          roomMutation.mutate({ name: roomForm.name, capacity: Number(roomForm.capacity), roomType: roomForm.roomType });
        }}>
          <SectionHeader icon={<Building2 className="h-5 w-5 text-ink" />} title="Add room" subtitle="Give the solver more placement options with the right room type and capacity." />
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <input className={`${inputClassName} md:col-span-2`} placeholder="Room name" value={roomForm.name} onChange={(event) => setRoomForm((current) => ({ ...current, name: event.target.value }))} />
            <input className={inputClassName} placeholder="Capacity" type="number" min="1" value={roomForm.capacity} onChange={(event) => setRoomForm((current) => ({ ...current, capacity: event.target.value }))} />
            <input className={`${inputClassName} md:col-span-3`} placeholder="Room type" value={roomForm.roomType} onChange={(event) => setRoomForm((current) => ({ ...current, roomType: event.target.value }))} />
          </div>
          <MutationFooter error={roomMutation.error?.message}>
            <Button className="w-full md:w-auto" type="submit" disabled={roomMutation.isPending}>{roomMutation.isPending ? "Saving room..." : "Add room"}</Button>
          </MutationFooter>
        </form>

        <form className={`${panelShell} bg-amber-50/70`} onSubmit={(event) => {
          event.preventDefault();
          setMessage(null);
          timeSlotMutation.mutate({
            dayOfWeek: timeSlotForm.dayOfWeek,
            startTime: timeSlotForm.startTime,
            endTime: timeSlotForm.endTime,
            label: timeSlotForm.label || `${timeSlotForm.dayOfWeek} ${timeSlotForm.startTime}-${timeSlotForm.endTime}`
          });
        }}>
          <SectionHeader icon={<CalendarRange className="h-5 w-5 text-ember" />} title="Add time slot" subtitle="Define the weekly teaching grid the timetable can use." />
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <select className={inputClassName} value={timeSlotForm.dayOfWeek} onChange={(event) => setTimeSlotForm((current) => ({ ...current, dayOfWeek: event.target.value }))}>
              {["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"].map((day) => <option key={day} value={day}>{day}</option>)}
            </select>
            <input className={inputClassName} placeholder="Label" value={timeSlotForm.label} onChange={(event) => setTimeSlotForm((current) => ({ ...current, label: event.target.value }))} />
            <input className={inputClassName} type="time" value={timeSlotForm.startTime} onChange={(event) => setTimeSlotForm((current) => ({ ...current, startTime: event.target.value }))} />
            <input className={inputClassName} type="time" value={timeSlotForm.endTime} onChange={(event) => setTimeSlotForm((current) => ({ ...current, endTime: event.target.value }))} />
          </div>
          <MutationFooter error={timeSlotMutation.error?.message}>
            <Button className="w-full md:w-auto" type="submit" disabled={timeSlotMutation.isPending}>{timeSlotMutation.isPending ? "Saving slot..." : "Add time slot"}</Button>
          </MutationFooter>
        </form>
      </div>

      <div className="mt-6 grid gap-5 2xl:grid-cols-[1.2fr_1fr]">
        <form className={`${panelShell} bg-[linear-gradient(135deg,rgba(16,37,66,0.04),rgba(31,92,75,0.08))]`} onSubmit={(event) => {
          event.preventDefault();
          setMessage(null);
          demandMutation.mutate({
            courseId: demandForm.courseId,
            facultyId: demandForm.facultyId,
            sessionsPerWeek: Number(demandForm.sessionsPerWeek)
          });
        }}>
          <SectionHeader icon={<History className="h-5 w-5 text-moss" />} title="Assign teaching demand" subtitle="Tell the solver which faculty teaches which course and how many sessions per week." />
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <select className={inputClassName} value={demandForm.courseId} onChange={(event) => setDemandForm((current) => ({ ...current, courseId: event.target.value }))}>
              <option value="">Select course</option>
              {courses.map((item) => <option key={item.id} value={item.id}>{item.code} - {item.title}</option>)}
            </select>
            <select className={inputClassName} value={demandForm.facultyId} onChange={(event) => setDemandForm((current) => ({ ...current, facultyId: event.target.value }))}>
              <option value="">Select faculty</option>
              {faculty.map((item) => <option key={item.id} value={item.id}>{item.fullName}</option>)}
            </select>
            <input className={inputClassName} type="number" min="1" value={demandForm.sessionsPerWeek} onChange={(event) => setDemandForm((current) => ({ ...current, sessionsPerWeek: event.target.value }))} />
          </div>
          <MutationFooter error={demandMutation.error?.message}>
            <Button className="w-full md:w-auto" type="submit" disabled={demandMutation.isPending}>{demandMutation.isPending ? "Saving demand..." : "Add teaching demand"}</Button>
          </MutationFooter>

          <div className="mt-5 space-y-3">
            {demands.length === 0 ? <EmptyState text="No lecture demands yet. Add at least one before generating a timetable." /> : demands.map((demand) => (
              <div key={demand.id} className="flex items-start justify-between gap-3 rounded-2xl border border-ink/8 bg-white/80 px-4 py-3">
                <div>
                  <p className="font-medium text-ink">{demand.courseCode} with {demand.facultyName}</p>
                  <p className="mt-1 text-sm text-ink/65">{demand.courseTitle} · {demand.sessionsPerWeek} session(s) per week</p>
                </div>
                <DeleteButton label="Remove demand" onClick={() => deleteDemandMutation.mutate(demand.id)} disabled={deleteDemandMutation.isPending} />
              </div>
            ))}
          </div>
        </form>

        <div className={`${panelShell} bg-white`}>
          <SectionHeader icon={<History className="h-5 w-5 text-ink" />} title="Audit trail" subtitle="Recent admin and scheduling actions across the system." />
          <div className="mt-4 space-y-3">
            {auditLogs.length === 0 ? <EmptyState text="Audit activity will appear here after setup and scheduling actions." /> : auditLogs.map((log) => (
              <div key={log.id} className="rounded-2xl border border-ink/8 bg-sand/45 px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-ink">{log.action.split("_").join(" ")}</p>
                  <span className="text-xs uppercase tracking-[0.2em] text-ink/45">{new Date(log.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="mt-1 text-sm text-ink/65">{log.detail}</p>
                <p className="mt-1 text-xs text-ink/45">{log.actorEmail} · {log.targetType}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-5 2xl:grid-cols-2">
        <ResourceList title="Faculty roster" items={faculty.map((item) => ({ id: item.id, primary: item.fullName, secondary: `${item.department} · ${item.email}`, onDelete: () => deleteFacultyMutation.mutate(item.id) }))} emptyText="No faculty configured yet." />
        <ResourceList title="Course catalog" items={courses.map((item) => ({ id: item.id, primary: `${item.code} · ${item.title}`, secondary: `${item.studentGroup} · ${item.requiredHours} hour(s)`, onDelete: () => deleteCourseMutation.mutate(item.id) }))} emptyText="No courses configured yet." />
        <ResourceList title="Room inventory" items={rooms.map((item) => ({ id: item.id, primary: item.name, secondary: `${item.roomType} · capacity ${item.capacity}`, onDelete: () => deleteRoomMutation.mutate(item.id) }))} emptyText="No rooms configured yet." />
        <ResourceList title="Teaching grid" items={timeSlots.map((item) => ({ id: item.id, primary: item.label, secondary: `${item.dayOfWeek} · ${item.startTime} - ${item.endTime}`, onDelete: () => deleteTimeSlotMutation.mutate(item.id) }))} emptyText="No timeslots configured yet." />
      </div>
    </section>
  );
}

function SectionHeader({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="rounded-2xl bg-white/80 p-3 shadow-sm">{icon}</div>
      <div>
        <h3 className="text-lg font-semibold text-ink">{title}</h3>
        <p className="mt-1 text-sm leading-6 text-ink/65">{subtitle}</p>
      </div>
    </div>
  );
}

function SetupCount({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-ink/8 bg-white/80 px-4 py-3">
      <div className="flex items-center gap-2 text-ink/60">
        {icon}
        <span className="text-xs font-semibold uppercase tracking-[0.22em]">{label}</span>
      </div>
      <p className="mt-2 text-2xl font-semibold text-ink">{value}</p>
    </div>
  );
}

function MutationFooter({ children, error }: { children: React.ReactNode; error?: string }) {
  return (
    <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      {children}
      {error ? <p className="text-sm text-ember">{error}</p> : <p className="text-sm text-ink/50">Updates refresh the admin counts automatically.</p>}
    </div>
  );
}

function ResourceList({
  title,
  items,
  emptyText
}: {
  title: string;
  items: { id: string; primary: string; secondary: string; onDelete: () => void }[];
  emptyText: string;
}) {
  return (
    <div className={`${panelShell} bg-white`}>
      <h3 className="text-lg font-semibold text-ink">{title}</h3>
      <div className="mt-4 space-y-3">
        {items.length === 0 ? <EmptyState text={emptyText} /> : items.map((item) => (
          <div key={item.id} className="flex items-start justify-between gap-3 rounded-2xl border border-ink/8 bg-sand/45 px-4 py-3">
            <div>
              <p className="font-medium text-ink">{item.primary}</p>
              <p className="mt-1 text-sm text-ink/65">{item.secondary}</p>
            </div>
            <DeleteButton label={`Delete ${item.primary}`} onClick={item.onDelete} />
          </div>
        ))}
      </div>
    </div>
  );
}

function DeleteButton({ label, onClick, disabled }: { label: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      aria-label={label}
      className="rounded-full border border-ember/15 bg-ember/5 p-2 text-ember transition hover:bg-ember/10 disabled:cursor-not-allowed disabled:opacity-50"
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}

function EmptyState({ text }: { text: string }) {
  return <p className="rounded-2xl border border-dashed border-ink/10 bg-sand/35 px-4 py-4 text-sm text-ink/55">{text}</p>;
}
