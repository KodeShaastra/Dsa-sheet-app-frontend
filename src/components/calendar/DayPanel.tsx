"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { EmptyState } from "@/components/app/States";
import { AddToScheduleDialog } from "@/components/calendar/AddToScheduleDialog";
import { ScheduledProblemCard } from "@/components/calendar/ScheduledProblemCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useUpdateScheduledProblem } from "@/hooks/useScheduledProblems";
import { ApiError } from "@/lib/api";
import { formatLongDay, isMissed, type DateKey } from "@/lib/calendar";
import type { ScheduledProblem } from "@/types/api";

/** The selected day: its scheduled problems, "Add problems" (today and later), and "Move all missed to today". */
export function DayPanel({
  day,
  today,
  items,
  loading,
}: {
  day: DateKey;
  today: DateKey;
  items: ScheduledProblem[];
  loading: boolean;
}) {
  const [adding, setAdding] = useState(false);
  const update = useUpdateScheduledProblem();
  const missed = items.filter((item) => isMissed(item, today));
  const isPast = day < today; // "YYYY-MM-DD" strings sort like dates

  const moveMissedToToday = async () => {
    const results = await Promise.allSettled(
      missed.map((item) => update.mutateAsync({ id: item.id, scheduledFor: today })),
    );
    const failed = results.filter((r) => r.status === "rejected");
    if (failed.length === 0) {
      toast.success(`Moved ${missed.length} to today`);
    } else {
      const reason = failed[0]?.status === "rejected" ? failed[0].reason : null;
      toast.error(
        reason instanceof ApiError
          ? `${failed.length} couldn't move: ${reason.message}`
          : `${failed.length} couldn't move. Try again.`,
      );
    }
  };

  return (
    <section aria-label={`Plan for ${formatLongDay(day)}`} className="space-y-3">
      <div className="space-y-0.5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-foreground">
            {day === today ? "Today" : formatLongDay(day)}
          </h2>
          {!isPast && (
            <Button size="sm" onClick={() => setAdding(true)}>
              <Plus /> Add problems
            </Button>
          )}
        </div>
        <p className="text-xs text-muted-foreground tabular-nums">
          {day === today ? `${formatLongDay(day)} · ` : ""}
          {items.length} scheduled
        </p>
      </div>

      {missed.length > 0 && day !== today && (
        <div className="flex items-center justify-between gap-3 rounded-lg bg-destructive/5 px-3 py-2 text-xs">
          <span className="text-destructive">{missed.length} missed on this day</span>
          <Button
            variant="link"
            size="xs"
            className="h-auto px-0"
            disabled={update.isPending}
            onClick={moveMissedToToday}
          >
            Move all to today
          </Button>
        </div>
      )}

      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          message={isPast ? "Nothing was planned for this day." : "Nothing planned for this day."}
        />
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <ScheduledProblemCard key={item.id} item={item} today={today} />
          ))}
        </ul>
      )}

      {!isPast && <AddToScheduleDialog open={adding} onOpenChange={setAdding} date={day} />}
    </section>
  );
}
