import { DifficultyDot } from "@/components/sheet/Difficulty";
import { formatLongDay, isMissed, type DateKey, type GridDay } from "@/lib/calendar";
import { cn } from "@/lib/utils";
import type { ScheduledProblem } from "@/types/api";

const MAX_TITLES = 2; // desktop: titles shown before "+N more"
const MAX_DOTS = 4; // phones: dots only

function describe(day: GridDay, items: ScheduledProblem[], today: DateKey, missed: number) {
  const parts = [formatLongDay(day.key)];
  if (day.key === today) parts.push("today");
  parts.push(items.length === 0 ? "nothing scheduled" : `${items.length} scheduled`);
  if (missed > 0) parts.push(`${missed} missed`);
  return parts.join(", ");
}

/** One day in the month grid. A button: selecting it shows the day in the side panel. */
export function DayCell({
  day,
  items,
  today,
  selected,
  onSelect,
}: {
  day: GridDay;
  items: ScheduledProblem[];
  today: DateKey;
  selected: boolean;
  onSelect: (key: DateKey) => void;
}) {
  const missed = items.filter((item) => isMissed(item, today)).length;
  const isToday = day.key === today;

  return (
    <button
      type="button"
      onClick={() => onSelect(day.key)}
      aria-pressed={selected}
      aria-label={describe(day, items, today, missed)}
      className={cn(
        "flex min-h-14 flex-col gap-1 rounded-lg p-1.5 text-left transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50 sm:min-h-24",
        day.inMonth ? "bg-surface hover:bg-surface-hover" : "hover:bg-surface",
        selected && "ring-2 ring-primary ring-inset",
      )}
    >
      <span className="flex items-center justify-between">
        <span
          className={cn(
            "flex size-6 items-center justify-center rounded-full text-xs tabular-nums",
            isToday && "bg-primary font-semibold text-primary-foreground",
            !isToday && missed > 0 && "font-semibold text-destructive",
            !isToday &&
              missed === 0 &&
              (day.inMonth ? "text-subtle-foreground" : "text-faint-foreground"),
          )}
        >
          {day.dayOfMonth}
        </span>
        {missed > 0 && <span className="mr-1 size-1.5 rounded-full bg-destructive" aria-hidden />}
      </span>

      {/* Phones: dots only */}
      {items.length > 0 && (
        <span className="flex flex-wrap gap-1 px-1 sm:hidden" aria-hidden>
          {items.slice(0, MAX_DOTS).map((item) => (
            <DifficultyDot key={item.id} difficulty={item.problem.difficulty} />
          ))}
        </span>
      )}

      {/* Wider screens: up to two titles, then "+N more" */}
      <span className="hidden min-w-0 flex-col gap-0.5 sm:flex" aria-hidden>
        {items.slice(0, MAX_TITLES).map((item) => (
          <span key={item.id} className="flex min-w-0 items-center gap-1.5 px-1">
            <DifficultyDot difficulty={item.problem.difficulty} className="size-1.5" />
            <span
              className={cn(
                "truncate text-xs",
                item.status === "PENDING" ? "text-subtle-foreground" : "text-muted-foreground",
                item.status === "DONE" && "line-through",
              )}
            >
              {item.problem.title}
            </span>
          </span>
        ))}
        {items.length > MAX_TITLES && (
          <span className="px-1 text-xs text-muted-foreground">
            +{items.length - MAX_TITLES} more
          </span>
        )}
      </span>
    </button>
  );
}
