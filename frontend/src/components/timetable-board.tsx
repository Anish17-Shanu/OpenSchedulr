import { DndContext, DragEndEvent, useDraggable, useDroppable } from "@dnd-kit/core";
import type { Room, TimeSlot, TimetableEntry } from "../types";

const dayOrder = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"];
const dayLabels: Record<string, string> = {
  MONDAY: "Monday",
  TUESDAY: "Tuesday",
  WEDNESDAY: "Wednesday",
  THURSDAY: "Thursday",
  FRIDAY: "Friday"
};

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
  const orderedSlots = [...timeSlots].sort((a, b) => {
    const dayCompare = dayOrder.indexOf(a.dayOfWeek) - dayOrder.indexOf(b.dayOfWeek);
    if (dayCompare !== 0) return dayCompare;
    return a.startTime.localeCompare(b.startTime);
  });
  const groupedByDay = dayOrder.map((day) => ({
    day,
    slots: orderedSlots.filter((slot) => slot.dayOfWeek === day)
  })).filter((group) => group.slots.length > 0);

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
            <p className="mt-1 text-sm text-ink/70">Organize the week by dragging lectures into a better slot. Manual changes are highlighted automatically.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="rounded-full bg-moss/10 px-3 py-1 text-sm font-medium text-moss">{rooms.length} rooms available</div>
            <div className="rounded-full bg-ink/5 px-3 py-1 text-sm font-medium text-ink/70">{timetable.length} scheduled sessions</div>
          </div>
        </div>
        <div className="grid gap-5 xl:grid-cols-5">
          {groupedByDay.map((group) => (
            <div key={group.day} className="space-y-3">
              <div className="rounded-3xl bg-[linear-gradient(135deg,rgba(16,37,66,0.96),rgba(31,92,75,0.84))] px-4 py-4 text-white">
                <p className="text-xs uppercase tracking-[0.25em] text-white/65">Day</p>
                <h4 className="mt-2 text-lg font-semibold">{dayLabels[group.day]}</h4>
                <p className="mt-1 text-xs text-white/70">{group.slots.length} time block{group.slots.length === 1 ? "" : "s"}</p>
              </div>
              {group.slots.map((slot) => (
                <DroppableCell key={slot.id} slot={slot} entries={timetable.filter((entry) => entry.timeSlotId === slot.id)} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </DndContext>
  );
}
