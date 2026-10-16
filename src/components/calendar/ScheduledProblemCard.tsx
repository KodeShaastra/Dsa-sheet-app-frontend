"use client";

import {
  CalendarClock,
  Check,
  CircleCheck,
  Ellipsis,
  RotateCcw,
  SkipForward,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { MoveDateDialog } from "@/components/calendar/MoveDateDialog";
import { DifficultyDot } from "@/components/sheet/Difficulty";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useScheduledProblemActions } from "@/hooks/useScheduledProblemActions";
import { isMissed, type DateKey } from "@/lib/calendar";
import { cn } from "@/lib/utils";
import type { ScheduledProblem } from "@/types/api";

function StatusLine({ item, missed }: { item: ScheduledProblem; missed: boolean }) {
  if (missed) return <span className="font-medium text-destructive">Missed</span>;
  if (item.status === "DONE")
    return (
      <span className="inline-flex items-center gap-1 text-primary">
        <CircleCheck className="size-3.5" aria-hidden /> Done
      </span>
    );
  if (item.status === "SKIPPED") return <span>Skipped</span>;
  return <span>Pending</span>;
}

/** One scheduled problem in the day panel, with its actions. */
export function ScheduledProblemCard({ item, today }: { item: ScheduledProblem; today: DateKey }) {
  const actions = useScheduledProblemActions();
  const [moving, setMoving] = useState(false);
  const missed = isMissed(item, today);
  const done = item.status === "DONE";

  return (
    <li className="rounded-lg bg-surface px-3 py-2.5">
      <div className="flex items-start gap-2.5">
        <DifficultyDot difficulty={item.problem.difficulty} className="mt-1.5" />
        <div className="min-w-0 flex-1 space-y-1">
          <p
            className={cn(
              "text-sm font-medium",
              done || item.status === "SKIPPED" ? "text-muted-foreground" : "text-foreground",
              done && "line-through",
            )}
          >
            {item.problem.title}
          </p>
          <div className="flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
            <StatusLine item={item} missed={missed} />
            {item.note && <span className="truncate">· {item.note}</span>}
          </div>
          {missed && (
            <Button
              variant="link"
              size="xs"
              className="h-auto px-0"
              disabled={actions.pending}
              onClick={() => actions.move(item, today)}
            >
              Move to today
            </Button>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Actions for ${item.problem.title}`}
              disabled={actions.pending}
            >
              <Ellipsis />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            {item.status === "PENDING" ? (
              <>
                <DropdownMenuItem onSelect={() => actions.setStatus(item, "DONE")}>
                  <Check /> Mark done
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => actions.setStatus(item, "SKIPPED")}>
                  <SkipForward /> Skip
                </DropdownMenuItem>
              </>
            ) : (
              <DropdownMenuItem onSelect={() => actions.setStatus(item, "PENDING")}>
                <RotateCcw /> Mark as pending
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onSelect={() => setMoving(true)}>
              <CalendarClock /> Move to another date
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onSelect={() => actions.remove(item)}>
              <Trash2 /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <MoveDateDialog
        open={moving}
        onOpenChange={setMoving}
        title={item.problem.title}
        currentDate={item.scheduledFor}
        today={today}
        pending={actions.pending}
        onMove={(date) => actions.move(item, date, () => setMoving(false))}
      />
    </li>
  );
}
