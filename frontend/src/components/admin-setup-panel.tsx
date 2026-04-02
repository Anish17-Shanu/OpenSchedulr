import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Building2, CalendarRange, GraduationCap, Users } from "lucide-react";
import type {
  CreateCoursePayload,
  CreateFacultyPayload,
  CreateRoomPayload,
  CreateTimeSlotPayload
} from "../types";
import { Button } from "./ui/button";

type AdminSetupPanelProps = {
  counts: {
    faculty: number;
    courses: number;
    rooms: number;
    timeSlots: number;
  };
  onCreateFaculty: (payload: CreateFacultyPayload) => Promise<unknown>;
  onCreateCourse: (payload: CreateCoursePayload) => Promise<unknown>;
  onCreateRoom: (payload: CreateRoomPayload) => Promise<unknown>;
  onCreateTimeSlot: (payload: CreateTimeSlotPayload) => Promise<unknown>;
};

const cardShell = "rounded-[1.75rem] border border-white/50 bg-white/90 p-5 shadow-panel";
const inputClassName =
  "w-full rounded-2xl border border-ink/10 bg-sand/65 px-4 py-3 text-sm text-ink outline-none transition focus:border-moss/35 focus:bg-white";

export function AdminSetupPanel({
  counts,
  onCreateFaculty,
  onCreateCourse,
  onCreateRoom,
  onCreateTimeSlot
}: AdminSetupPanelProps) {
  const [message, setMessage] = useState<string | null>(null);

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
      setCourseForm({
        code: "",
        title: "",
        credits: "3",
        requiredHours: "3",
        studentGroup: "",
        roomType: "LECTURE"
      });
    }
  });
  const roomMutation = useMutation({
    mutationFn: onCreateRoom,
    onSuccess: () => {
      setMessage("Room added. It is now available to the solver.");
      setRoomForm({
        name: "",
        capacity: "40",
        roomType: "LECTURE"
      });
    }
  });
  const timeSlotMutation = useMutation({
    mutationFn: onCreateTimeSlot,
    onSuccess: () => {
      setMessage("Time slot added to the weekly grid.");
      setTimeSlotForm({
        dayOfWeek: "MONDAY",
        startTime: "09:00",
        endTime: "10:00",
        label: ""
      });
    }
  });

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

  return (
    <section className={cardShell}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-moss">Admin setup</p>
          <h2 className="mt-2 text-2xl font-semibold text-ink">Control how many faculty, classes, rooms, and slots the solver can use</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-ink/70">
            This is the missing setup surface for your admin panel. Add scheduling supply here first, then generate the timetable from the updated dataset.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <SetupCount icon={<Users className="h-4 w-4" />} label="Faculty" value={counts.faculty} />
          <SetupCount icon={<GraduationCap className="h-4 w-4" />} label="Courses" value={counts.courses} />
          <SetupCount icon={<Building2 className="h-4 w-4" />} label="Rooms" value={counts.rooms} />
          <SetupCount icon={<CalendarRange className="h-4 w-4" />} label="Slots" value={counts.timeSlots} />
        </div>
      </div>

      {message ? <p className="mt-5 rounded-2xl border border-moss/15 bg-moss/5 px-4 py-3 text-sm text-moss">{message}</p> : null}

      <div className="mt-6 grid gap-5 2xl:grid-cols-2">
        <form
          className="rounded-3xl border border-ink/8 bg-mist/30 p-5"
          onSubmit={(event) => {
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
          }}
        >
          <SectionHeader
            icon={<Users className="h-5 w-5 text-moss" />}
            title="Add faculty"
            subtitle="Create teaching staff and their scheduling profile in one go."
          />
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
            <Button className="w-full md:w-auto" type="submit" disabled={facultyMutation.isPending}>
              {facultyMutation.isPending ? "Saving faculty..." : "Add faculty member"}
            </Button>
          </MutationFooter>
        </form>

        <form
          className="rounded-3xl border border-ink/8 bg-sand/55 p-5"
          onSubmit={(event) => {
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
          }}
        >
          <SectionHeader
            icon={<GraduationCap className="h-5 w-5 text-ember" />}
            title="Add course"
            subtitle="Expand the class load that needs to be scheduled."
          />
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <input className={inputClassName} placeholder="Course code" value={courseForm.code} onChange={(event) => setCourseForm((current) => ({ ...current, code: event.target.value }))} />
            <input className={inputClassName} placeholder="Student group" value={courseForm.studentGroup} onChange={(event) => setCourseForm((current) => ({ ...current, studentGroup: event.target.value }))} />
            <input className={`${inputClassName} md:col-span-2`} placeholder="Course title" value={courseForm.title} onChange={(event) => setCourseForm((current) => ({ ...current, title: event.target.value }))} />
            <input className={inputClassName} placeholder="Credits" type="number" min="1" value={courseForm.credits} onChange={(event) => setCourseForm((current) => ({ ...current, credits: event.target.value }))} />
            <input className={inputClassName} placeholder="Required hours" type="number" min="1" value={courseForm.requiredHours} onChange={(event) => setCourseForm((current) => ({ ...current, requiredHours: event.target.value }))} />
            <input className={inputClassName} placeholder="Room type" value={courseForm.roomType} onChange={(event) => setCourseForm((current) => ({ ...current, roomType: event.target.value }))} />
          </div>
          <MutationFooter error={courseMutation.error?.message}>
            <Button className="w-full md:w-auto" type="submit" disabled={courseMutation.isPending}>
              {courseMutation.isPending ? "Saving course..." : "Add course"}
            </Button>
          </MutationFooter>
        </form>

        <form
          className="rounded-3xl border border-ink/8 bg-white p-5"
          onSubmit={(event) => {
            event.preventDefault();
            setMessage(null);
            roomMutation.mutate({
              name: roomForm.name,
              capacity: Number(roomForm.capacity),
              roomType: roomForm.roomType
            });
          }}
        >
          <SectionHeader
            icon={<Building2 className="h-5 w-5 text-ink" />}
            title="Add room"
            subtitle="Give the solver more placement options with the right room type and capacity."
          />
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <input className={`${inputClassName} md:col-span-2`} placeholder="Room name" value={roomForm.name} onChange={(event) => setRoomForm((current) => ({ ...current, name: event.target.value }))} />
            <input className={inputClassName} placeholder="Capacity" type="number" min="1" value={roomForm.capacity} onChange={(event) => setRoomForm((current) => ({ ...current, capacity: event.target.value }))} />
            <input className={`${inputClassName} md:col-span-3`} placeholder="Room type" value={roomForm.roomType} onChange={(event) => setRoomForm((current) => ({ ...current, roomType: event.target.value }))} />
          </div>
          <MutationFooter error={roomMutation.error?.message}>
            <Button className="w-full md:w-auto" type="submit" disabled={roomMutation.isPending}>
              {roomMutation.isPending ? "Saving room..." : "Add room"}
            </Button>
          </MutationFooter>
        </form>

        <form
          className="rounded-3xl border border-ink/8 bg-amber-50/70 p-5"
          onSubmit={(event) => {
            event.preventDefault();
            setMessage(null);
            timeSlotMutation.mutate({
              dayOfWeek: timeSlotForm.dayOfWeek,
              startTime: timeSlotForm.startTime,
              endTime: timeSlotForm.endTime,
              label: timeSlotForm.label || `${timeSlotForm.dayOfWeek} ${timeSlotForm.startTime}-${timeSlotForm.endTime}`
            });
          }}
        >
          <SectionHeader
            icon={<CalendarRange className="h-5 w-5 text-ember" />}
            title="Add time slot"
            subtitle="Define the weekly teaching grid the timetable can use."
          />
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <select className={inputClassName} value={timeSlotForm.dayOfWeek} onChange={(event) => setTimeSlotForm((current) => ({ ...current, dayOfWeek: event.target.value }))}>
              {["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"].map((day) => (
                <option key={day} value={day}>{day}</option>
              ))}
            </select>
            <input className={inputClassName} placeholder="Label" value={timeSlotForm.label} onChange={(event) => setTimeSlotForm((current) => ({ ...current, label: event.target.value }))} />
            <input className={inputClassName} type="time" value={timeSlotForm.startTime} onChange={(event) => setTimeSlotForm((current) => ({ ...current, startTime: event.target.value }))} />
            <input className={inputClassName} type="time" value={timeSlotForm.endTime} onChange={(event) => setTimeSlotForm((current) => ({ ...current, endTime: event.target.value }))} />
          </div>
          <MutationFooter error={timeSlotMutation.error?.message}>
            <Button className="w-full md:w-auto" type="submit" disabled={timeSlotMutation.isPending}>
              {timeSlotMutation.isPending ? "Saving slot..." : "Add time slot"}
            </Button>
          </MutationFooter>
        </form>
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
