import { DndContext, DragEndEvent, useDraggable, useDroppable } from "@dnd-kit/core";
import { useMemo, useState } from "react";
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
  "w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-moss/35";

function DraggableClass({ entry }: { entry: TimetableEntry }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: entry.id,
    data: entry
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{ transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined }}
      className="cursor-grab rounded-2xl border border-white/70 bg-white/90 p-3 text-sm text-ink shadow-sm transition hover:-translate-y-0.5"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold">{entry.courseCode}</p>
          <p className="mt-1 text-ink/80">{entry.facultyName}</p>
        </div>
        <span className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${entry.source === "MANUAL" ? "bg-ember/10 text-ember" : "bg-moss/10 text-moss"}`}>
          {entry.source}
        </span>
      </div>
      <div className="mt-3 flex items-center justify-between text-xs text-ink/65">
        <span>{entry.roomName}</span>
        <span>{entry.startTime.slice(0, 5)}-{entry.endTime.slice(0, 5)}</span>
      </div>
    </div>
  );
}

function DroppableCell({
  slot,
  entries
}: {
  slot: TimeSlot;
  entries: TimetableEntry[];
}) {
  const { isOver, setNodeRef } = useDroppable({ id: slot.id, data: slot });

  return (
    <div ref={setNodeRef} className={`min-h-36 rounded-3xl border p-3 transition ${isOver ? "border-ember bg-amber-50" : "border-white/60 bg-[#fffaf3]"}`}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink/55">{slot.label}</p>
        <span className="rounded-full bg-white/90 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-ink/45">
          {entries.length} item{entries.length === 1 ? "" : "s"}
        </span>
      </div>
      <div className="space-y-2">
        {entries.map((entry) => (
          <DraggableClass key={entry.id} entry={entry} />
        ))}
        {entries.length === 0 ? <div className="rounded-2xl border border-dashed border-ink/10 px-3 py-6 text-center text-xs uppercase tracking-[0.2em] text-ink/35">Drop lecture here</div> : null}
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
  const [viewMode, setViewMode] = useState<"week" | "faculty" | "group" | "room">("week");
  const [facultyFilter, setFacultyFilter] = useState("ALL");
  const [groupFilter, setGroupFilter] = useState("ALL");
  const [roomFilter, setRoomFilter] = useState("ALL");
  const [dayFilter, setDayFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  const orderedSlots = [...timeSlots].sort((a, b) => {
    const dayCompare = dayOrder.indexOf(a.dayOfWeek) - dayOrder.indexOf(b.dayOfWeek);
    if (dayCompare !== 0) return dayCompare;
    return a.startTime.localeCompare(b.startTime);
  });

  const facultyOptions = useMemo(() => [...new Set(timetable.map((entry) => entry.facultyName))].sort(), [timetable]);
  const groupOptions = useMemo(() => [...new Set(timetable.map((entry) => entry.studentGroup))].sort(), [timetable]);
  const roomOptions = useMemo(() => [...new Set(timetable.map((entry) => entry.roomName))].sort(), [timetable]);
  const normalizedSearch = search.trim().toLowerCase();

  const filteredTimetable = timetable.filter((entry) => {
    if (facultyFilter !== "ALL" && entry.facultyName !== facultyFilter) return false;
    if (groupFilter !== "ALL" && entry.studentGroup !== groupFilter) return false;
    if (roomFilter !== "ALL" && entry.roomName !== roomFilter) return false;
    if (dayFilter !== "ALL" && entry.dayOfWeek !== dayFilter) return false;
    if (!normalizedSearch) return true;
    const haystack = `${entry.courseCode} ${entry.courseTitle} ${entry.facultyName} ${entry.studentGroup} ${entry.roomName}`.toLowerCase();
    return haystack.includes(normalizedSearch);
  });

  const groupedByDay = dayOrder
    .map((day) => ({
      day,
      slots: orderedSlots.filter((slot) => slot.dayOfWeek === day)
    }))
    .filter((group) => group.slots.length > 0);

  const groupedViews = {
    faculty: buildGroupedRows(filteredTimetable, (entry) => entry.facultyName),
    group: buildGroupedRows(filteredTimetable, (entry) => entry.studentGroup),
    room: buildGroupedRows(filteredTimetable, (entry) => entry.roomName)
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
      <div className="rounded-[1.75rem] border border-white/50 bg-white/90 p-5 shadow-panel">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h3 className="text-xl font-semibold text-ink">Scheduling Studio</h3>
            <p className="mt-1 text-sm text-ink/70">Switch between weekly, faculty-wise, class-wise, and room-wise views while filtering the same schedule dataset.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="rounded-full bg-moss/10 px-3 py-1 text-sm font-medium text-moss">{rooms.length} rooms available</div>
            <div className="rounded-full bg-ink/5 px-3 py-1 text-sm font-medium text-ink/70">{filteredTimetable.length} scheduled sessions</div>
          </div>
        </div>

        <div className="mb-6 space-y-4 rounded-[1.5rem] border border-ink/8 bg-sand/45 p-4">
          <div className="flex flex-wrap gap-2">
            {[
              { id: "week", label: "Weekly board" },
              { id: "faculty", label: "Faculty-wise" },
              { id: "group", label: "Class-wise" },
              { id: "room", label: "Room-wise" }
            ].map((option) => (
              <button
                key={option.id}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${viewMode === option.id ? "bg-[linear-gradient(135deg,#102542,#1f5c4b)] text-white" : "bg-white text-ink/70"}`}
                onClick={() => setViewMode(option.id as "week" | "faculty" | "group" | "room")}
                type="button"
              >
                {option.label}
              </button>
            ))}
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            <select className={filterClassName} value={facultyFilter} onChange={(event) => setFacultyFilter(event.target.value)}>
              <option value="ALL">All faculty</option>
              {facultyOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            <select className={filterClassName} value={groupFilter} onChange={(event) => setGroupFilter(event.target.value)}>
              <option value="ALL">All classes</option>
              {groupOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            <select className={filterClassName} value={roomFilter} onChange={(event) => setRoomFilter(event.target.value)}>
              <option value="ALL">All rooms</option>
              {roomOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            <select className={filterClassName} value={dayFilter} onChange={(event) => setDayFilter(event.target.value)}>
              <option value="ALL">All days</option>
              {dayOrder.map((day) => (
                <option key={day} value={day}>{dayLabels[day]}</option>
              ))}
            </select>
            <input className={filterClassName} placeholder="Search code, faculty, class, room" value={search} onChange={(event) => setSearch(event.target.value)} />
          </div>
        </div>

        {viewMode === "week" ? (
          <div className="grid gap-5 xl:grid-cols-5">
            {groupedByDay.map((group) => (
              <div key={group.day} className="space-y-3">
                <div className="rounded-3xl bg-[linear-gradient(135deg,rgba(16,37,66,0.96),rgba(31,92,75,0.84))] px-4 py-4 text-white">
                  <p className="text-xs uppercase tracking-[0.25em] text-white/65">Day</p>
                  <h4 className="mt-2 text-lg font-semibold">{dayLabels[group.day]}</h4>
                  <p className="mt-1 text-xs text-white/70">{group.slots.length} time block{group.slots.length === 1 ? "" : "s"}</p>
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

        {filteredTimetable.length === 0 ? (
          <div className="mt-5 rounded-3xl border border-dashed border-ink/10 px-4 py-8 text-center text-sm text-ink/45">
            No timetable entries match the active filters yet.
          </div>
        ) : null}
      </div>
    </DndContext>
  );
}

function buildGroupedRows(entries: TimetableEntry[], keySelector: (entry: TimetableEntry) => string) {
  return Object.entries(
    entries.reduce<Record<string, TimetableEntry[]>>((accumulator, entry) => {
      const key = keySelector(entry);
      accumulator[key] = [...(accumulator[key] ?? []), entry];
      return accumulator;
    }, {})
  )
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([title, items]) => ({
      title,
      items: [...items].sort((left, right) => `${left.dayOfWeek}-${left.startTime}`.localeCompare(`${right.dayOfWeek}-${right.startTime}`))
    }));
}

function GroupedTimetableList({
  groups,
  emptyMessage
}: {
  groups: Array<{ title: string; items: TimetableEntry[] }>;
  emptyMessage: string;
}) {
  if (groups.length === 0) {
    return <div className="rounded-3xl border border-dashed border-ink/10 px-4 py-8 text-center text-sm text-ink/45">{emptyMessage}</div>;
  }

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {groups.map((group) => (
        <div key={group.title} className="rounded-3xl border border-ink/8 bg-[#fffaf3] p-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-lg font-semibold text-ink">{group.title}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.2em] text-ink/45">{group.items.length} scheduled item{group.items.length === 1 ? "" : "s"}</p>
            </div>
          </div>
          <div className="space-y-3">
            {group.items.map((entry) => (
              <div key={entry.id} className="rounded-2xl border border-white/70 bg-white/90 p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-ink">{entry.courseCode} · {entry.courseTitle}</p>
                    <p className="mt-1 text-sm text-ink/70">{entry.facultyName} · {entry.studentGroup}</p>
                  </div>
                  <span className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${entry.source === "MANUAL" ? "bg-ember/10 text-ember" : "bg-moss/10 text-moss"}`}>
                    {entry.source}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-ink/65">
                  <span className="rounded-full bg-sand px-3 py-1">{dayLabels[entry.dayOfWeek] ?? entry.dayOfWeek}</span>
                  <span className="rounded-full bg-sand px-3 py-1">{entry.startTime.slice(0, 5)}-{entry.endTime.slice(0, 5)}</span>
                  <span className="rounded-full bg-sand px-3 py-1">{entry.roomName}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
