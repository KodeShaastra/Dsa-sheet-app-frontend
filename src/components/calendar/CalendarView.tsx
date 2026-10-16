"use client";

import { useMemo, useState } from "react";
import { ErrorState, PageHeader } from "@/components/app/States";
import { CalendarToolbar } from "@/components/calendar/CalendarToolbar";
import { DayPanel } from "@/components/calendar/DayPanel";
import { MonthGrid } from "@/components/calendar/MonthGrid";
import { WeekSummary } from "@/components/calendar/WeekSummary";
import { Skeleton } from "@/components/ui/skeleton";
import { useScheduledProblems } from "@/hooks/useScheduledProblems";
import { useToday } from "@/hooks/useToday";
import {
  groupByDay,
  monthGrid,
  monthOf,
  shiftMonth,
  type DateKey,
  type MonthKey,
} from "@/lib/calendar";
import type { ScheduledProblem } from "@/types/api";

const EMPTY: ScheduledProblem[] = [];

const header = (
  <PageHeader
    title="Calendar"
    description="Plan which problems to solve each day. Done items are ticked on your sheet too."
  />
);

function CalendarSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading the calendar">
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-[30rem] w-full" />
    </div>
  );
}

/** Waits for the user's own "today" (never the server's), then shows the calendar. */
export function CalendarView() {
  const today = useToday();
  return (
    <div className="space-y-6">
      {header}
      {today ? <Calendar today={today} /> : <CalendarSkeleton />}
    </div>
  );
}

function Calendar({ today }: { today: DateKey }) {
  const [month, setMonth] = useState<MonthKey>(monthOf(today));
  const [selected, setSelected] = useState<DateKey>(today);

  const days = useMemo(() => monthGrid(month), [month]);
  const from = days[0]!.key;
  const to = days[days.length - 1]!.key;
  const query = useScheduledProblems(from, to);
  const itemsByDay = useMemo(() => groupByDay(query.data ?? EMPTY), [query.data]);

  const goToMonth = (next: MonthKey) => {
    setMonth(next);
    // Keep the panel on a day that's visible: today if it's in that month, else the 1st.
    setSelected(monthOf(today) === next ? today : `${next}-01`);
  };

  const selectDay = (key: DateKey) => {
    setSelected(key);
    if (monthOf(key) !== month) setMonth(monthOf(key));
  };

  return (
    <div className="space-y-6">
      <WeekSummary today={today} />

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-3">
          <CalendarToolbar
            month={month}
            isCurrentMonth={month === monthOf(today) && selected === today}
            onPrev={() => goToMonth(shiftMonth(month, -1))}
            onNext={() => goToMonth(shiftMonth(month, 1))}
            onToday={() => goToMonth(monthOf(today))}
          />
          {query.isError ? (
            <ErrorState
              message="We couldn't load your calendar."
              onRetry={() => void query.refetch()}
            />
          ) : (
            <MonthGrid
              days={days}
              itemsByDay={itemsByDay}
              today={today}
              selected={selected}
              onSelect={selectDay}
            />
          )}
        </div>

        <div className="lg:sticky lg:top-20">
          <DayPanel
            day={selected}
            today={today}
            items={itemsByDay.get(selected) ?? EMPTY}
            loading={query.isPending}
          />
        </div>
      </div>
    </div>
  );
}
