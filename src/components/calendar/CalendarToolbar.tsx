import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatMonth, type MonthKey } from "@/lib/calendar";

export function CalendarToolbar({
  month,
  isCurrentMonth,
  onPrev,
  onNext,
  onToday,
}: {
  month: MonthKey;
  isCurrentMonth: boolean;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 className="text-base font-semibold text-foreground" aria-live="polite">
        {formatMonth(month)}
      </h2>
      <div className="flex items-center gap-1">
        <Button variant="outline" size="sm" onClick={onToday} disabled={isCurrentMonth}>
          Today
        </Button>
        <Button variant="ghost" size="icon-sm" onClick={onPrev} aria-label="Previous month">
          <ChevronLeft />
        </Button>
        <Button variant="ghost" size="icon-sm" onClick={onNext} aria-label="Next month">
          <ChevronRight />
        </Button>
      </div>
    </div>
  );
}
