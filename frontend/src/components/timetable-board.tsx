import { DndContext, DragEndEvent, useDraggable, useDroppable } from "@dnd-kit/core";
import { ArrowUpDown, CalendarDays, GraduationCap, Search, Table2 } from "lucide-react";
import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { Room, TimeSlot, TimetableEntry } from "../types";

const dayOrder = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"];
const dayLabels: Record<string, string> = {
  MONDAY: "Monday",
  TUESDAY: "Tuesday",
  WEDNESDAY: "Wednesday",
  THURSDAY: "Thursday",
  FRIDAY: "Friday"
};

const filterClassName =
  "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition duration-300 focus:border-[#7b61ff]/40 focus:bg-white focus:shadow-[0_0_0_4px_rgba(123,97,255,0.12)]";

function DraggableClass({ entry }: { entry: TimetableEntry }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: entry.id, data: entry });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{ transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined }}
      className="cursor-grab rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_10px_24px_rgba(18,27,44,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_16px_30px_rgba(18,27,44,0.1)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-slate-900">{entry.courseCode}</p>
          <p className="mt-1 text-sm text-slate-500">{entry.facultyName}</p>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${entry.source === "MANUAL" ? "bg-orange-100 text-orange-600" : "bg-[#ede9ff] text-[#6b57e7]"}`}>
          {entry.source}
        </span>
      </div>
      <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
        <span className="rounded-full bg-slate-100 px-2.5 py-1">{entry.roomName}</span>
        <span className="rounded-full bg-slate-100 px-2.5 py-1">{entry.startTime.slice(0, 5)}-{entry.endTime.slice(0, 5)}</span>
        <span className="rounded-full bg-slate-100 px-2.5 py-1">{entry.program}</span>
      </div>
    </div>
  );
}

function DroppableCell({ slot, entries }: { slot: TimeSlot; entries: TimetableEntry[] }) {
  const { isOver, setNodeRef } = useDroppable({ id: slot.id, data: slot });

  return (
    <div
      ref={setNodeRef}
      className={`min-h-40 rounded-[1.5rem] border p-3 transition duration-300 ${
        isOver
          ? "border-[#7b61ff] bg-[#f5f2ff] shadow-[0_16px_28px_rgba(123,97,255,0.12)]"
          : "border-slate-200 bg-[#fafbff]"
      }`}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{slot.label}</p>
        <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500 shadow-sm">
          {entries.length} item{entries.length === 1 ? "" : "s"}
        </span>
      </div>
      <div className="space-y-2">
        {entries.map((entry) => <DraggableClass key={entry.id} entry={entry} />)}
        {entries.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 px-3 py-8 text-center text-xs uppercase tracking-[0.22em] text-slate-400">
            Drop lecture here
          </div>
        ) : null}
      </div>
    </div>
  );
}

interface TimetableBoardProps {
  timetable: TimetableEntry[];
  timeSlots: TimeSlot[];
  rooms: Room[];
  onDrop: (entryId: string, roomId: string, timeSlotId: string) => void;
}

export function TimetableBoard({ timetable, timeSlots, rooms, onDrop }: TimetableBoardProps) {
  const [viewMode, setViewMode] = useState<"week" | "faculty" | "room" | "section" | "batch" | "department" | "program">("week");
  const [sortBy, setSortBy] = useState<"time" | "course" | "faculty" | "room" | "program">("time");
  const [facultyFilter, setFacultyFilter] = useState("ALL");
  const [roomFilter, setRoomFilter] = useState("ALL");
  const [sectionFilter, setSectionFilter] = useState("ALL");
  const [batchFilter, setBatchFilter] = useState("ALL");
  const [departmentFilter, setDepartmentFilter] = useState("ALL");
  const [programFilter, setProgramFilter] = useState("ALL");
  const [dayFilter, setDayFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  const orderedSlots = [...timeSlots].sort((a, b) => {
    const dayCompare = dayOrder.indexOf(a.dayOfWeek) - dayOrder.indexOf(b.dayOfWeek);
    if (dayCompare !== 0) return dayCompare;
    return a.startTime.localeCompare(b.startTime);
  });

  const facultyOptions = useMemo(() => sortUnique(timetable.map((entry) => entry.facultyName)), [timetable]);
  const roomOptions = useMemo(() => sortUnique(timetable.map((entry) => entry.roomName)), [timetable]);
  const sectionOptions = useMemo(() => sortUnique(timetable.map((entry) => entry.section)), [timetable]);
  const batchOptions = useMemo(() => sortUnique(timetable.map((entry) => entry.batchName)), [timetable]);
  const departmentOptions = useMemo(() => sortUnique(timetable.map((entry) => entry.department)), [timetable]);
  const programOptions = useMemo(() => sortUnique(timetable.map((entry) => entry.program)), [timetable]);
  const normalizedSearch = search.trim().toLowerCase();

  const filteredTimetable = timetable
    .filter((entry) => {
      if (facultyFilter !== "ALL" && entry.facultyName !== facultyFilter) return false;
      if (roomFilter !== "ALL" && entry.roomName !== roomFilter) return false;
      if (sectionFilter !== "ALL" && entry.section !== sectionFilter) return false;
      if (batchFilter !== "ALL" && entry.batchName !== batchFilter) return false;
      if (departmentFilter !== "ALL" && entry.department !== departmentFilter) return false;
      if (programFilter !== "ALL" && entry.program !== programFilter) return false;
      if (dayFilter !== "ALL" && entry.dayOfWeek !== dayFilter) return false;
      if (!normalizedSearch) return true;

      const haystack = `${entry.courseCode} ${entry.courseTitle} ${entry.facultyName} ${entry.roomName} ${entry.department} ${entry.program} ${entry.batchName} ${entry.section}`.toLowerCase();
      return haystack.includes(normalizedSearch);
    })
    .sort((left, right) => compareEntries(left, right, sortBy));

  const groupedByDay = dayOrder
    .map((day) => ({
      day,
      slots: orderedSlots.filter((slot) => slot.dayOfWeek === day)
    }))
    .filter((group) => group.slots.length > 0);

  const groupedViews = {
    faculty: buildGroupedRows(filteredTimetable, (entry) => entry.facultyName),
    room: buildGroupedRows(filteredTimetable, (entry) => entry.roomName),
    section: buildGroupedRows(filteredTimetable, (entry) => entry.section),
    batch: buildGroupedRows(filteredTimetable, (entry) => entry.batchName),
    department: buildGroupedRows(filteredTimetable, (entry) => entry.department),
    program: buildGroupedRows(filteredTimetable, (entry) => entry.program)
  };

  const fallbackRoom = rooms[0]?.id;
  const handleDragEnd = (event: DragEndEvent) => {
    const overId = event.over?.id;
    const entryId = String(event.active.id);
    if (!overId || !fallbackRoom) return;
    onDrop(entryId, fallbackRoom, String(overId));
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="glass-panel shimmer-border animate-rise rounded-[1.75rem] border border-slate-200 p-5 shadow-panel">
        <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#6b57e7]">Timetable workspace</p>
            <h3 className="mt-2 text-2xl font-semibold text-slate-900">Weekly board and schedule table</h3>
            <p className="mt-1 text-sm text-slate-600">
              Review the timetable visually by day, then audit the same schedule in a clean table for publishing.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <InfoPill icon={<CalendarDays className="h-4 w-4" />} text={`${orderedSlots.length} active slots`} />
            <InfoPill icon={<GraduationCap className="h-4 w-4" />} text={`${filteredTimetable.length} scheduled sessions`} />
            <InfoPill icon={<Table2 className="h-4 w-4" />} text="Board + table views" />
          </div>
        </div>

        <div className="mb-6 rounded-[1.5rem] border border-slate-200 bg-[#f7f8fc] p-4">
          <div className="flex flex-wrap gap-2">
            {[
              ["week", "Weekly board"],
              ["faculty", "Faculty"],
              ["room", "Rooms"],
              ["section", "Sections"],
              ["batch", "Batches"],
              ["department", "Departments"],
              ["program", "Programs"]
            ].map(([id, label]) => (
              <button
                key={id}
                type="button"
                className={`rounded-full px-4 py-2 text-sm font-medium transition duration-300 ${
                  viewMode === id
                    ? "bg-[linear-gradient(135deg,#7b61ff,#5b9bff)] text-white shadow-[0_12px_28px_rgba(91,155,255,0.22)]"
                    : "bg-white text-slate-600 shadow-sm hover:bg-slate-50"
                }`}
                onClick={() => setViewMode(id as typeof viewMode)}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-8">
            <select className={filterClassName} value={sortBy} onChange={(event) => setSortBy(event.target.value as typeof sortBy)}>
              <option value="time">Sort by time</option>
              <option value="course">Sort by course</option>
              <option value="faculty">Sort by faculty</option>
              <option value="room">Sort by room</option>
              <option value="program">Sort by program</option>
            </select>
            <select className={filterClassName} value={facultyFilter} onChange={(event) => setFacultyFilter(event.target.value)}>
              <option value="ALL">All faculty</option>
              {facultyOptions.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
            <select className={filterClassName} value={roomFilter} onChange={(event) => setRoomFilter(event.target.value)}>
              <option value="ALL">All rooms</option>
              {roomOptions.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
            <select className={filterClassName} value={sectionFilter} onChange={(event) => setSectionFilter(event.target.value)}>
              <option value="ALL">All sections</option>
              {sectionOptions.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
            <select className={filterClassName} value={batchFilter} onChange={(event) => setBatchFilter(event.target.value)}>
              <option value="ALL">All batches</option>
              {batchOptions.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
            <select className={filterClassName} value={departmentFilter} onChange={(event) => setDepartmentFilter(event.target.value)}>
              <option value="ALL">All departments</option>
              {departmentOptions.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
            <select className={filterClassName} value={programFilter} onChange={(event) => setProgramFilter(event.target.value)}>
              <option value="ALL">All programs</option>
              {programOptions.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input className={`${filterClassName} pl-11`} placeholder="Search course or faculty..." value={search} onChange={(event) => setSearch(event.target.value)} />
            </div>
          </div>
        </div>

        {viewMode === "week" ? (
          <div className="grid gap-4 xl:grid-cols-5">
            {groupedByDay.map((group) => (
              <div key={group.day} className="space-y-3">
                <div className="rounded-[1.5rem] border border-[#e4e9f5] bg-white px-4 py-4 shadow-[0_12px_28px_rgba(18,27,44,0.05)]">
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Day</p>
                  <h4 className="mt-2 text-lg font-semibold text-slate-900">{dayLabels[group.day]}</h4>
                  <p className="mt-1 text-xs text-slate-500">{group.slots.length} time block{group.slots.length === 1 ? "" : "s"}</p>
                </div>
                {group.slots.map((slot) => (
                  <DroppableCell key={slot.id} slot={slot} entries={filteredTimetable.filter((entry) => entry.timeSlotId === slot.id)} />
                ))}
              </div>
            ))}
          </div>
        ) : (
          <GroupedTimetableList groups={groupedViews[viewMode]} emptyMessage="No schedules match the current filter combination." />
        )}

        <div className="mt-6 rounded-[1.5rem] border border-slate-200 bg-[#fafbff] p-4">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#6b57e7]">Schedule table</p>
              <h4 className="mt-1 text-lg font-semibold text-slate-900">Structured review before publishing</h4>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <ArrowUpDown className="h-4 w-4" />
              Sorted by {sortBy}
            </div>
          </div>

          <div className="overflow-x-auto rounded-[1.25rem] border border-slate-200 bg-white">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Course</th>
                  <th className="px-4 py-3 font-semibold">Faculty</th>
                  <th className="px-4 py-3 font-semibold">Day</th>
                  <th className="px-4 py-3 font-semibold">Time</th>
                  <th className="px-4 py-3 font-semibold">Room</th>
                  <th className="px-4 py-3 font-semibold">Batch / Section</th>
                  <th className="px-4 py-3 font-semibold">Program</th>
                  <th className="px-4 py-3 font-semibold">Source</th>
                </tr>
              </thead>
              <tbody>
                {filteredTimetable.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                      No sessions match the current filter combination.
                    </td>
                  </tr>
                ) : (
                  filteredTimetable.map((entry) => (
                    <tr key={entry.id} className="border-t border-slate-100 hover:bg-slate-50/80">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-semibold text-slate-900">{entry.courseCode}</p>
                          <p className="text-xs text-slate-500">{entry.courseTitle}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-700">{entry.facultyName}</td>
                      <td className="px-4 py-3 text-slate-600">{dayLabels[entry.dayOfWeek] ?? entry.dayOfWeek}</td>
                      <td className="px-4 py-3 text-slate-600">{entry.startTime.slice(0, 5)}-{entry.endTime.slice(0, 5)}</td>
                      <td className="px-4 py-3 text-slate-600">{entry.roomName}</td>
                      <td className="px-4 py-3 text-slate-600">{entry.batchName} / {entry.section}</td>
                      <td className="px-4 py-3 text-slate-600">{entry.program}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${entry.source === "MANUAL" ? "bg-orange-100 text-orange-600" : "bg-[#ede9ff] text-[#6b57e7]"}`}>
                          {entry.source}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DndContext>
  );
}

function InfoPill({ icon, text }: { icon: ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 shadow-sm">
      {icon}
      <span>{text}</span>
    </div>
  );
}

function sortUnique(values: string[]) {
  return [...new Set(values)].filter(Boolean).sort();
}

function compareEntries(left: TimetableEntry, right: TimetableEntry, sortBy: "time" | "course" | "faculty" | "room" | "program") {
  switch (sortBy) {
    case "course":
      return `${left.courseCode}-${left.courseTitle}`.localeCompare(`${right.courseCode}-${right.courseTitle}`);
    case "faculty":
      return left.facultyName.localeCompare(right.facultyName);
    case "room":
      return left.roomName.localeCompare(right.roomName);
    case "program":
      return `${left.program}-${left.batchName}-${left.section}`.localeCompare(`${right.program}-${right.batchName}-${right.section}`);
    default:
      return `${left.dayOfWeek}-${left.startTime}-${left.courseCode}`.localeCompare(`${right.dayOfWeek}-${right.startTime}-${right.courseCode}`);
  }
}

function buildGroupedRows(entries: TimetableEntry[], keySelector: (entry: TimetableEntry) => string) {
  return Object.entries(
    entries.reduce<Record<string, TimetableEntry[]>>((acc, entry) => {
      const key = keySelector(entry);
      acc[key] = [...(acc[key] ?? []), entry];
      return acc;
    }, {})
  )
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([title, items]) => ({
      title,
      items: [...items].sort((left, right) => `${left.dayOfWeek}-${left.startTime}`.localeCompare(`${right.dayOfWeek}-${right.startTime}`))
    }));
}

function GroupedTimetableList({ groups, emptyMessage }: { groups: Array<{ title: string; items: TimetableEntry[] }>; emptyMessage: string }) {
  if (groups.length === 0) {
    return <div className="rounded-[1.5rem] border border-dashed border-slate-200 bg-[#fafbff] px-4 py-8 text-center text-sm text-slate-500">{emptyMessage}</div>;
  }

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {groups.map((group) => (
        <div key={group.title} className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-[0_12px_28px_rgba(18,27,44,0.05)]">
          <div className="mb-4">
            <p className="text-lg font-semibold text-slate-900">{group.title}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-400">{group.items.length} scheduled item{group.items.length === 1 ? "" : "s"}</p>
          </div>
          <div className="space-y-3">
            {group.items.map((entry) => (
              <div key={entry.id} className="rounded-2xl border border-slate-200 bg-[#fafbff] p-4 transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_24px_rgba(18,27,44,0.08)]">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">{entry.courseCode} · {entry.courseTitle}</p>
                    <p className="mt-1 text-sm text-slate-500">{entry.facultyName} · {entry.department} · {entry.program}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${entry.source === "MANUAL" ? "bg-orange-100 text-orange-600" : "bg-[#ede9ff] text-[#6b57e7]"}`}>
                    {entry.source}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                  <span className="rounded-full bg-white px-3 py-1 shadow-sm">{dayLabels[entry.dayOfWeek] ?? entry.dayOfWeek}</span>
                  <span className="rounded-full bg-white px-3 py-1 shadow-sm">{entry.startTime.slice(0, 5)}-{entry.endTime.slice(0, 5)}</span>
                  <span className="rounded-full bg-white px-3 py-1 shadow-sm">{entry.roomName}</span>
                  <span className="rounded-full bg-white px-3 py-1 shadow-sm">Batch {entry.batchName}</span>
                  <span className="rounded-full bg-white px-3 py-1 shadow-sm">Sec {entry.section}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
