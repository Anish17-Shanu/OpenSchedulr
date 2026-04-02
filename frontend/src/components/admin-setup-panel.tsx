import { useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { BookOpen, Building2, CalendarRange, GraduationCap, History, Pencil, Trash2, Users } from "lucide-react";
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
  onUpdateFaculty: (facultyId: string, payload: Omit<CreateFacultyPayload, "email" | "password">) => Promise<unknown>;
  onCreateCourse: (payload: CreateCoursePayload) => Promise<unknown>;
  onUpdateCourse: (courseId: string, payload: CreateCoursePayload) => Promise<unknown>;
  onCreateRoom: (payload: CreateRoomPayload) => Promise<unknown>;
  onUpdateRoom: (roomId: string, payload: CreateRoomPayload) => Promise<unknown>;
  onCreateTimeSlot: (payload: CreateTimeSlotPayload) => Promise<unknown>;
  onUpdateTimeSlot: (timeSlotId: string, payload: CreateTimeSlotPayload) => Promise<unknown>;
  onCreateDemand: (payload: CreateLectureDemandPayload) => Promise<unknown>;
  onUpdateDemand: (demandId: string, payload: CreateLectureDemandPayload) => Promise<unknown>;
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

export function AdminSetupPanel(props: AdminSetupPanelProps) {
  const {
    counts,
    faculty,
    courses,
    rooms,
    timeSlots,
    demands,
    auditLogs,
    onCreateFaculty,
    onUpdateFaculty,
    onCreateCourse,
    onUpdateCourse,
    onCreateRoom,
    onUpdateRoom,
    onCreateTimeSlot,
    onUpdateTimeSlot,
    onCreateDemand,
    onUpdateDemand,
    onDeleteFaculty,
    onDeleteCourse,
    onDeleteRoom,
    onDeleteTimeSlot,
    onDeleteDemand
  } = props;

  const [message, setMessage] = useState<string | null>(null);
  const [editingFacultyId, setEditingFacultyId] = useState<string | null>(null);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  const [editingTimeSlotId, setEditingTimeSlotId] = useState<string | null>(null);
  const [editingDemandId, setEditingDemandId] = useState<string | null>(null);

  const [facultyForm, setFacultyForm] = useState({
    fullName: "",
    email: "",
    department: "",
    maxLoad: "12",
    availability: '{"days":["MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY"]}',
    preferences: '{"preferredTime":"09:00-13:00"}',
    subjects: '["Distributed Systems","Algorithms"]',
    password: "Faculty@123"
  });
  const [courseForm, setCourseForm] = useState({
    code: "",
    title: "",
    credits: "3",
    requiredHours: "3",
    studentGroup: "",
    roomType: "LECTURE",
    department: "",
    program: "",
    batchName: "",
    section: ""
  });
  const [roomForm, setRoomForm] = useState({ name: "", capacity: "40", roomType: "LECTURE" });
  const [timeSlotForm, setTimeSlotForm] = useState({ dayOfWeek: "MONDAY", startTime: "09:00", endTime: "10:00", label: "" });
  const [demandForm, setDemandForm] = useState({ courseId: "", facultyId: "", sessionsPerWeek: "2" });

  const facultyMutation = useMutation({
    mutationFn: () =>
      editingFacultyId
        ? onUpdateFaculty(editingFacultyId, {
            fullName: facultyForm.fullName,
            department: facultyForm.department,
            maxLoad: Number(facultyForm.maxLoad),
            availability: facultyForm.availability,
            preferences: facultyForm.preferences,
            subjects: facultyForm.subjects
          })
        : onCreateFaculty({
            fullName: facultyForm.fullName,
            email: facultyForm.email,
            department: facultyForm.department,
            maxLoad: Number(facultyForm.maxLoad),
            availability: facultyForm.availability,
            preferences: facultyForm.preferences,
            subjects: facultyForm.subjects,
            password: facultyForm.password
          }),
    onSuccess: () => {
      setMessage(editingFacultyId ? "Faculty updated." : "Faculty created.");
      setEditingFacultyId(null);
      resetFacultyForm();
    }
  });

  const courseMutation = useMutation({
    mutationFn: () =>
      editingCourseId
        ? onUpdateCourse(editingCourseId, mapCourseForm(courseForm))
        : onCreateCourse(mapCourseForm(courseForm)),
    onSuccess: () => {
      setMessage(editingCourseId ? "Course updated." : "Course created.");
      setEditingCourseId(null);
      resetCourseForm();
    }
  });

  const roomMutation = useMutation({
    mutationFn: () =>
      editingRoomId
        ? onUpdateRoom(editingRoomId, { name: roomForm.name, capacity: Number(roomForm.capacity), roomType: roomForm.roomType })
        : onCreateRoom({ name: roomForm.name, capacity: Number(roomForm.capacity), roomType: roomForm.roomType }),
    onSuccess: () => {
      setMessage(editingRoomId ? "Room updated." : "Room created.");
      setEditingRoomId(null);
      setRoomForm({ name: "", capacity: "40", roomType: "LECTURE" });
    }
  });

  const timeSlotMutation = useMutation({
    mutationFn: () =>
      editingTimeSlotId
        ? onUpdateTimeSlot(editingTimeSlotId, mapTimeSlotForm(timeSlotForm))
        : onCreateTimeSlot(mapTimeSlotForm(timeSlotForm)),
    onSuccess: () => {
      setMessage(editingTimeSlotId ? "Time slot updated." : "Time slot created.");
      setEditingTimeSlotId(null);
      setTimeSlotForm({ dayOfWeek: "MONDAY", startTime: "09:00", endTime: "10:00", label: "" });
    }
  });

  const demandMutation = useMutation({
    mutationFn: () =>
      editingDemandId
        ? onUpdateDemand(editingDemandId, { courseId: demandForm.courseId, facultyId: demandForm.facultyId, sessionsPerWeek: Number(demandForm.sessionsPerWeek) })
        : onCreateDemand({ courseId: demandForm.courseId, facultyId: demandForm.facultyId, sessionsPerWeek: Number(demandForm.sessionsPerWeek) }),
    onSuccess: () => {
      setMessage(editingDemandId ? "Teaching demand updated." : "Teaching demand created.");
      setEditingDemandId(null);
      setDemandForm({ courseId: "", facultyId: "", sessionsPerWeek: "2" });
    }
  });

  const deleteFacultyMutation = useMutation({ mutationFn: onDeleteFaculty, onSuccess: () => setMessage("Faculty removed.") });
  const deleteCourseMutation = useMutation({ mutationFn: onDeleteCourse, onSuccess: () => setMessage("Course removed.") });
  const deleteRoomMutation = useMutation({ mutationFn: onDeleteRoom, onSuccess: () => setMessage("Room removed.") });
  const deleteTimeSlotMutation = useMutation({ mutationFn: onDeleteTimeSlot, onSuccess: () => setMessage("Time slot removed.") });
  const deleteDemandMutation = useMutation({ mutationFn: onDeleteDemand, onSuccess: () => setMessage("Teaching demand removed.") });

  const demandOptions = useMemo(
    () =>
      demands.map((item) => ({
        id: item.id,
        label: `${item.courseCode} / ${item.facultyName}`,
        item
      })),
    [demands]
  );

  function resetFacultyForm() {
    setFacultyForm({
      fullName: "",
      email: "",
      department: "",
      maxLoad: "12",
      availability: '{"days":["MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY"]}',
      preferences: '{"preferredTime":"09:00-13:00"}',
      subjects: '["Distributed Systems","Algorithms"]',
      password: "Faculty@123"
    });
  }

  function resetCourseForm() {
    setCourseForm({
      code: "",
      title: "",
      credits: "3",
      requiredHours: "3",
      studentGroup: "",
      roomType: "LECTURE",
      department: "",
      program: "",
      batchName: "",
      section: ""
    });
  }

  return (
    <section className={cardShell}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-moss">Admin setup</p>
          <h2 className="mt-2 text-2xl font-semibold text-ink">Manage faculties, subjects, batches, sections, rooms, and teaching demand</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-ink/70">
            The admin can now add and alter academic structure data that directly drives scheduling and final timetable views.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          <SetupCount icon={<Users className="h-4 w-4" />} label="Faculty" value={counts.faculty} />
          <SetupCount icon={<GraduationCap className="h-4 w-4" />} label="Courses" value={counts.courses} />
          <SetupCount icon={<Building2 className="h-4 w-4" />} label="Rooms" value={counts.rooms} />
          <SetupCount icon={<CalendarRange className="h-4 w-4" />} label="Slots" value={counts.timeSlots} />
          <SetupCount icon={<BookOpen className="h-4 w-4" />} label="Demands" value={counts.demands} />
        </div>
      </div>

      {message ? <p className="mt-5 rounded-2xl border border-moss/15 bg-moss/5 px-4 py-3 text-sm text-moss">{message}</p> : null}

      <div className="mt-6 grid gap-5 2xl:grid-cols-2">
        <form className={`${panelShell} bg-mist/30`} onSubmit={(event) => {
          event.preventDefault();
          facultyMutation.mutate();
        }}>
          <SectionHeader icon={<Users className="h-5 w-5 text-moss" />} title={editingFacultyId ? "Edit faculty" : "Add faculty"} subtitle="Faculty now include subject expertise for subject-wise assignment." />
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <input className={inputClassName} placeholder="Full name" value={facultyForm.fullName} onChange={(event) => setFacultyForm((current) => ({ ...current, fullName: event.target.value }))} />
            <input className={inputClassName} placeholder="Email" type="email" disabled={Boolean(editingFacultyId)} value={facultyForm.email} onChange={(event) => setFacultyForm((current) => ({ ...current, email: event.target.value }))} />
            <input className={inputClassName} placeholder="Department" value={facultyForm.department} onChange={(event) => setFacultyForm((current) => ({ ...current, department: event.target.value }))} />
            <input className={inputClassName} placeholder="Max weekly load" type="number" min="1" value={facultyForm.maxLoad} onChange={(event) => setFacultyForm((current) => ({ ...current, maxLoad: event.target.value }))} />
            {!editingFacultyId ? <input className={inputClassName} placeholder="Initial password" type="text" value={facultyForm.password} onChange={(event) => setFacultyForm((current) => ({ ...current, password: event.target.value }))} /> : null}
          </div>
          <textarea className={`${inputClassName} mt-3 min-h-20`} placeholder='Subjects JSON, e.g. ["DBMS","OS"]' value={facultyForm.subjects} onChange={(event) => setFacultyForm((current) => ({ ...current, subjects: event.target.value }))} />
          <textarea className={`${inputClassName} mt-3 min-h-20`} placeholder='Availability JSON' value={facultyForm.availability} onChange={(event) => setFacultyForm((current) => ({ ...current, availability: event.target.value }))} />
          <textarea className={`${inputClassName} mt-3 min-h-20`} placeholder='Preferences JSON' value={facultyForm.preferences} onChange={(event) => setFacultyForm((current) => ({ ...current, preferences: event.target.value }))} />
          <MutationFooter error={facultyMutation.error?.message}>
            <div className="flex flex-wrap gap-2">
              <Button className="w-full md:w-auto" type="submit" disabled={facultyMutation.isPending}>{facultyMutation.isPending ? "Saving..." : editingFacultyId ? "Update faculty" : "Add faculty"}</Button>
              {editingFacultyId ? <Button type="button" variant="outline" onClick={() => { setEditingFacultyId(null); resetFacultyForm(); }}>Cancel edit</Button> : null}
            </div>
          </MutationFooter>
        </form>

        <form className={`${panelShell} bg-sand/55`} onSubmit={(event) => {
          event.preventDefault();
          courseMutation.mutate();
        }}>
          <SectionHeader icon={<GraduationCap className="h-5 w-5 text-ember" />} title={editingCourseId ? "Edit subject/course" : "Add subject/course"} subtitle="Subjects now carry program, batch, section, and department metadata." />
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <input className={inputClassName} placeholder="Course code" value={courseForm.code} onChange={(event) => setCourseForm((current) => ({ ...current, code: event.target.value }))} />
            <input className={inputClassName} placeholder="Course title" value={courseForm.title} onChange={(event) => setCourseForm((current) => ({ ...current, title: event.target.value }))} />
            <input className={inputClassName} placeholder="Department" value={courseForm.department} onChange={(event) => setCourseForm((current) => ({ ...current, department: event.target.value }))} />
            <input className={inputClassName} placeholder="Program" value={courseForm.program} onChange={(event) => setCourseForm((current) => ({ ...current, program: event.target.value }))} />
            <input className={inputClassName} placeholder="Batch" value={courseForm.batchName} onChange={(event) => setCourseForm((current) => ({ ...current, batchName: event.target.value }))} />
            <input className={inputClassName} placeholder="Section" value={courseForm.section} onChange={(event) => setCourseForm((current) => ({ ...current, section: event.target.value }))} />
            <input className={inputClassName} placeholder="Student group" value={courseForm.studentGroup} onChange={(event) => setCourseForm((current) => ({ ...current, studentGroup: event.target.value }))} />
            <input className={inputClassName} placeholder="Room type" value={courseForm.roomType} onChange={(event) => setCourseForm((current) => ({ ...current, roomType: event.target.value }))} />
            <input className={inputClassName} placeholder="Credits" type="number" min="1" value={courseForm.credits} onChange={(event) => setCourseForm((current) => ({ ...current, credits: event.target.value }))} />
            <input className={inputClassName} placeholder="Required hours" type="number" min="1" value={courseForm.requiredHours} onChange={(event) => setCourseForm((current) => ({ ...current, requiredHours: event.target.value }))} />
          </div>
          <MutationFooter error={courseMutation.error?.message}>
            <div className="flex flex-wrap gap-2">
              <Button className="w-full md:w-auto" type="submit" disabled={courseMutation.isPending}>{courseMutation.isPending ? "Saving..." : editingCourseId ? "Update subject/course" : "Add subject/course"}</Button>
              {editingCourseId ? <Button type="button" variant="outline" onClick={() => { setEditingCourseId(null); resetCourseForm(); }}>Cancel edit</Button> : null}
            </div>
          </MutationFooter>
        </form>

        <form className={`${panelShell} bg-white`} onSubmit={(event) => {
          event.preventDefault();
          roomMutation.mutate();
        }}>
          <SectionHeader icon={<Building2 className="h-5 w-5 text-ink" />} title={editingRoomId ? "Edit room" : "Add room"} subtitle="Update room inventory whenever lab or classroom capacity changes." />
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <input className={`${inputClassName} md:col-span-2`} placeholder="Room name" value={roomForm.name} onChange={(event) => setRoomForm((current) => ({ ...current, name: event.target.value }))} />
            <input className={inputClassName} placeholder="Capacity" type="number" min="1" value={roomForm.capacity} onChange={(event) => setRoomForm((current) => ({ ...current, capacity: event.target.value }))} />
            <input className={`${inputClassName} md:col-span-3`} placeholder="Room type" value={roomForm.roomType} onChange={(event) => setRoomForm((current) => ({ ...current, roomType: event.target.value }))} />
          </div>
          <MutationFooter error={roomMutation.error?.message}>
            <div className="flex flex-wrap gap-2">
              <Button className="w-full md:w-auto" type="submit" disabled={roomMutation.isPending}>{roomMutation.isPending ? "Saving..." : editingRoomId ? "Update room" : "Add room"}</Button>
              {editingRoomId ? <Button type="button" variant="outline" onClick={() => { setEditingRoomId(null); setRoomForm({ name: "", capacity: "40", roomType: "LECTURE" }); }}>Cancel edit</Button> : null}
            </div>
          </MutationFooter>
        </form>

        <form className={`${panelShell} bg-amber-50/70`} onSubmit={(event) => {
          event.preventDefault();
          timeSlotMutation.mutate();
        }}>
          <SectionHeader icon={<CalendarRange className="h-5 w-5 text-ember" />} title={editingTimeSlotId ? "Edit time slot" : "Add time slot"} subtitle="Alter the teaching grid when the institute changes the day structure." />
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <select className={inputClassName} value={timeSlotForm.dayOfWeek} onChange={(event) => setTimeSlotForm((current) => ({ ...current, dayOfWeek: event.target.value }))}>
              {["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"].map((day) => <option key={day} value={day}>{day}</option>)}
            </select>
            <input className={inputClassName} placeholder="Label" value={timeSlotForm.label} onChange={(event) => setTimeSlotForm((current) => ({ ...current, label: event.target.value }))} />
            <input className={inputClassName} type="time" value={timeSlotForm.startTime} onChange={(event) => setTimeSlotForm((current) => ({ ...current, startTime: event.target.value }))} />
            <input className={inputClassName} type="time" value={timeSlotForm.endTime} onChange={(event) => setTimeSlotForm((current) => ({ ...current, endTime: event.target.value }))} />
          </div>
          <MutationFooter error={timeSlotMutation.error?.message}>
            <div className="flex flex-wrap gap-2">
              <Button className="w-full md:w-auto" type="submit" disabled={timeSlotMutation.isPending}>{timeSlotMutation.isPending ? "Saving..." : editingTimeSlotId ? "Update time slot" : "Add time slot"}</Button>
              {editingTimeSlotId ? <Button type="button" variant="outline" onClick={() => { setEditingTimeSlotId(null); setTimeSlotForm({ dayOfWeek: "MONDAY", startTime: "09:00", endTime: "10:00", label: "" }); }}>Cancel edit</Button> : null}
            </div>
          </MutationFooter>
        </form>
      </div>

      <div className="mt-6 grid gap-5 2xl:grid-cols-[1.2fr_1fr]">
        <form className={`${panelShell} bg-[linear-gradient(135deg,rgba(16,37,66,0.04),rgba(31,92,75,0.08))]`} onSubmit={(event) => {
          event.preventDefault();
          demandMutation.mutate();
        }}>
          <SectionHeader icon={<History className="h-5 w-5 text-moss" />} title={editingDemandId ? "Edit teaching demand" : "Assign teaching demand"} subtitle="Map faculty to subjects and define how many sessions should be scheduled per week." />
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <select className={inputClassName} value={demandForm.courseId} onChange={(event) => setDemandForm((current) => ({ ...current, courseId: event.target.value }))}>
              <option value="">Select subject/course</option>
              {courses.map((item) => <option key={item.id} value={item.id}>{item.code} - {item.title}</option>)}
            </select>
            <select className={inputClassName} value={demandForm.facultyId} onChange={(event) => setDemandForm((current) => ({ ...current, facultyId: event.target.value }))}>
              <option value="">Select faculty</option>
              {faculty.map((item) => <option key={item.id} value={item.id}>{item.fullName}</option>)}
            </select>
            <input className={inputClassName} type="number" min="1" value={demandForm.sessionsPerWeek} onChange={(event) => setDemandForm((current) => ({ ...current, sessionsPerWeek: event.target.value }))} />
          </div>
          <MutationFooter error={demandMutation.error?.message}>
            <div className="flex flex-wrap gap-2">
              <Button className="w-full md:w-auto" type="submit" disabled={demandMutation.isPending}>{demandMutation.isPending ? "Saving..." : editingDemandId ? "Update demand" : "Add demand"}</Button>
              {editingDemandId ? <Button type="button" variant="outline" onClick={() => { setEditingDemandId(null); setDemandForm({ courseId: "", facultyId: "", sessionsPerWeek: "2" }); }}>Cancel edit</Button> : null}
            </div>
          </MutationFooter>
          <div className="mt-5 space-y-3">
            {demandOptions.length === 0 ? <EmptyState text="No teaching demand yet. Add at least one mapping before generating the timetable." /> : demandOptions.map(({ id, item, label }) => (
              <EditableRow
                key={id}
                primary={label}
                secondary={`${item.courseTitle} · ${item.sessionsPerWeek} session(s) per week`}
                onEdit={() => {
                  setEditingDemandId(id);
                  setDemandForm({ courseId: item.courseId, facultyId: item.facultyId, sessionsPerWeek: String(item.sessionsPerWeek) });
                }}
                onDelete={() => deleteDemandMutation.mutate(id)}
              />
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
        <ResourceList
          title="Faculty roster"
          items={faculty.map((item) => ({
            id: item.id,
            primary: item.fullName,
            secondary: `${item.department} · subjects ${item.subjects} · ${item.email}`,
            onEdit: () => {
              setEditingFacultyId(item.id);
              setFacultyForm({
                fullName: item.fullName,
                email: item.email,
                department: item.department,
                maxLoad: String(item.maxLoad),
                availability: item.availability,
                preferences: item.preferences,
                subjects: item.subjects,
                password: "Faculty@123"
              });
            },
            onDelete: () => deleteFacultyMutation.mutate(item.id)
          }))}
          emptyText="No faculty configured yet."
        />
        <ResourceList
          title="Subject and class catalog"
          items={courses.map((item) => ({
            id: item.id,
            primary: `${item.code} · ${item.title}`,
            secondary: `${item.department} · ${item.program} · ${item.batchName} · Section ${item.section}`,
            onEdit: () => {
              setEditingCourseId(item.id);
              setCourseForm({
                code: item.code,
                title: item.title,
                credits: String(item.credits),
                requiredHours: String(item.requiredHours),
                studentGroup: item.studentGroup,
                roomType: item.roomType,
                department: item.department,
                program: item.program,
                batchName: item.batchName,
                section: item.section
              });
            },
            onDelete: () => deleteCourseMutation.mutate(item.id)
          }))}
          emptyText="No subjects configured yet."
        />
        <ResourceList
          title="Room inventory"
          items={rooms.map((item) => ({
            id: item.id,
            primary: item.name,
            secondary: `${item.roomType} · capacity ${item.capacity}`,
            onEdit: () => {
              setEditingRoomId(item.id);
              setRoomForm({ name: item.name, capacity: String(item.capacity), roomType: item.roomType });
            },
            onDelete: () => deleteRoomMutation.mutate(item.id)
          }))}
          emptyText="No rooms configured yet."
        />
        <ResourceList
          title="Teaching grid"
          items={timeSlots.map((item) => ({
            id: item.id,
            primary: item.label,
            secondary: `${item.dayOfWeek} · ${item.startTime} - ${item.endTime}`,
            onEdit: () => {
              setEditingTimeSlotId(item.id);
              setTimeSlotForm({ dayOfWeek: item.dayOfWeek, startTime: item.startTime.slice(0, 5), endTime: item.endTime.slice(0, 5), label: item.label });
            },
            onDelete: () => deleteTimeSlotMutation.mutate(item.id)
          }))}
          emptyText="No time slots configured yet."
        />
      </div>
    </section>
  );
}

function mapCourseForm(form: {
  code: string;
  title: string;
  credits: string;
  requiredHours: string;
  studentGroup: string;
  roomType: string;
  department: string;
  program: string;
  batchName: string;
  section: string;
}): CreateCoursePayload {
  return {
    code: form.code,
    title: form.title,
    credits: Number(form.credits),
    requiredHours: Number(form.requiredHours),
    studentGroup: form.studentGroup,
    roomType: form.roomType,
    department: form.department,
    program: form.program,
    batchName: form.batchName,
    section: form.section
  };
}

function mapTimeSlotForm(form: { dayOfWeek: string; startTime: string; endTime: string; label: string }): CreateTimeSlotPayload {
  return {
    dayOfWeek: form.dayOfWeek,
    startTime: form.startTime,
    endTime: form.endTime,
    label: form.label || `${form.dayOfWeek} ${form.startTime}-${form.endTime}`
  };
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
      {error ? <p className="text-sm text-ember">{error}</p> : <p className="text-sm text-ink/50">All admin changes refresh the scheduling dataset automatically.</p>}
    </div>
  );
}

function ResourceList({
  title,
  items,
  emptyText
}: {
  title: string;
  items: { id: string; primary: string; secondary: string; onEdit: () => void; onDelete: () => void }[];
  emptyText: string;
}) {
  return (
    <div className={`${panelShell} bg-white`}>
      <h3 className="text-lg font-semibold text-ink">{title}</h3>
      <div className="mt-4 space-y-3">
        {items.length === 0 ? <EmptyState text={emptyText} /> : items.map((item) => (
          <EditableRow key={item.id} primary={item.primary} secondary={item.secondary} onEdit={item.onEdit} onDelete={item.onDelete} />
        ))}
      </div>
    </div>
  );
}

function EditableRow({
  primary,
  secondary,
  onEdit,
  onDelete
}: {
  primary: string;
  secondary: string;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-2xl border border-ink/8 bg-sand/45 px-4 py-3">
      <div>
        <p className="font-medium text-ink">{primary}</p>
        <p className="mt-1 text-sm text-ink/65">{secondary}</p>
      </div>
      <div className="flex gap-2">
        <IconButton label={`Edit ${primary}`} onClick={onEdit}>
          <Pencil className="h-4 w-4" />
        </IconButton>
        <IconButton label={`Delete ${primary}`} onClick={onDelete}>
          <Trash2 className="h-4 w-4" />
        </IconButton>
      </div>
    </div>
  );
}

function IconButton({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      aria-label={label}
      className="rounded-full border border-ember/15 bg-ember/5 p-2 text-ember transition hover:bg-ember/10"
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

function EmptyState({ text }: { text: string }) {
  return <p className="rounded-2xl border border-dashed border-ink/10 bg-sand/35 px-4 py-4 text-sm text-ink/55">{text}</p>;
}
