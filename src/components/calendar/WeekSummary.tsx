"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useScheduledProblems } from "@/hooks/useScheduledProblems";
import { isMissed, weekRange, type DateKey } from "@/lib/calendar";
import { cn } from "@/lib/utils";

/** "This week": scheduled, done, missed (always the current week, whatever month is shown). */
export function WeekSummary({ today }: { today: DateKey }) {
  const { from, to } = weekRange(today);
  const all = useScheduledProblems().data;
  const data = all?.filter((item) => item.scheduledFor >= from && item.scheduledFor <= to);

  const stats = data && [
    { label: "Scheduled", value: data.length, className: "text-foreground" },
    {
      label: "Done",
      value: data.filter((i) => i.status === "DONE").length,
      className: "text-foreground",
    },
    {
      label: "Missed",
      value: data.filter((i) => isMissed(i, today)).length,
      className: "text-destructive",
    },
  ];

  return (
    <section aria-label="This week" className="space-y-2">
      <h2 className="text-xs font-medium text-muted-foreground">This week</h2>
      <div className="grid grid-cols-3 gap-3">
        {stats
          ? stats.map((s) => (
              <div key={s.label} className="space-y-0.5 rounded-lg bg-surface px-4 py-3">
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p
                  className={cn(
                    "text-base font-semibold tabular-nums",
                    s.value > 0 ? s.className : "text-foreground",
                  )}
                >
                  {s.value}
                </p>
              </div>
            ))
          : Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-16" />)}
      </div>
    </section>
  );
}
