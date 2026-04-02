import { DndContext, DragEndEvent, useDraggable, useDroppable } from "@dnd-kit/core";
import type { Room, TimeSlot, TimetableEntry } from "../types";

const dayOrder = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"];

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
      className="cursor-grab rounded-2xl border border-moss/20 bg-moss/10 p-3 text-sm text-ink"
    >
      <p className="font-semibold">{entry.courseCode}</p>
      <p>{entry.facultyName}</p>
      <p className="text-xs text-ink/70">{entry.roomName}</p>
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
    <div ref={setNodeRef} className={`min-h-28 rounded-2xl border p-3 ${isOver ? "border-ember bg-ember/10" : "border-white/50 bg-white/70"}`}>
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink/60">{slot.label}</p>
      <div className="space-y-2">
        {entries.map((entry) => (
          <DraggableClass key={entry.id} entry={entry} />
        ))}
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

  const fallbackRoom = rooms[0]?.id;

  const handleDragEnd = (event: DragEndEvent) => {
    const overId = event.over?.id;
    const entryId = String(event.active.id);
    if (!overId || !fallbackRoom) return;
    onDrop(entryId, fallbackRoom, String(overId));
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="rounded-3xl border border-white/40 bg-white/85 p-5 shadow-panel">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-ink">Drag-and-Drop Timetable</h3>
            <p className="text-sm text-ink/70">Drop a class onto a new timeslot to trigger manual override.</p>
          </div>
          <div className="rounded-full bg-moss/10 px-3 py-1 text-sm font-medium text-moss">
            {rooms.length} rooms available
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {orderedSlots.map((slot) => (
            <DroppableCell key={slot.id} slot={slot} entries={timetable.filter((entry) => entry.timeSlotId === slot.id)} />
          ))}
        </div>
      </div>
    </DndContext>
  );
}
