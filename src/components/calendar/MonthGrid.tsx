import { DayCell } from "@/components/calendar/DayCell";
import { WEEKDAY_LABELS, type DateKey, type GridDay } from "@/lib/calendar";
import type { ScheduledProblem } from "@/types/api";

const EMPTY: ScheduledProblem[] = [];

/** 6 weeks × 7 days, Monday first. */
export function MonthGrid({
  days,
  itemsByDay,
  today,
  selected,
  onSelect,
}: {
  days: GridDay[];
  itemsByDay: Map<DateKey, ScheduledProblem[]>;
  today: DateKey;
  selected: DateKey;
  onSelect: (key: DateKey) => void;
}) {
  return (
    <div className="space-y-1.5">
      <div className="grid grid-cols-7 gap-1 sm:gap-1.5" aria-hidden>
        {WEEKDAY_LABELS.map((label) => (
          <span key={label} className="px-1.5 text-xs font-medium text-muted-foreground">
            {label}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
        {days.map((day) => (
          <DayCell
            key={day.key}
            day={day}
            items={itemsByDay.get(day.key) ?? EMPTY}
            today={today}
            selected={day.key === selected}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
}
