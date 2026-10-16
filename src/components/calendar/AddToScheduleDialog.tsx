"use client";

import { useState } from "react";
import { toast } from "sonner";
import { DifficultyDot } from "@/components/sheet/Difficulty";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useProblemDates, useScheduleProblems } from "@/hooks/useScheduledProblems";
import { useSheet } from "@/hooks/useSheet";
import { useSolvedProblems } from "@/hooks/useSolvedProblems";
import { ApiError } from "@/lib/api";
import { formatLongDay, formatShortDay, type DateKey } from "@/lib/calendar";

/**
 * Search the sheet, pick problems (multi-select), optionally add a note, schedule them for `date`.
 * A problem already scheduled on any date can't be picked: it shows that date instead.
 */
export function AddToScheduleDialog({
  open,
  onOpenChange,
  date,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: DateKey;
}) {
  const sheet = useSheet();
  const solvedIds = useSolvedProblems().data?.solvedProblemIds;
  const solved = new Set(solvedIds ?? []);
  const problemDates = useProblemDates().data;
  const schedule = useScheduleProblems();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [note, setNote] = useState("");

  // Start fresh each time it opens. (The parent opens it, so onOpenChange never sees `true`.)
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setSelected(new Set());
      setNote("");
    }
  }

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const submit = () => {
    schedule.mutate(
      { scheduledFor: date, problemIds: [...selected], ...(note.trim() && { note: note.trim() }) },
      {
        onSuccess: ({ scheduledProblems }) => {
          const added = scheduledProblems.length;
          toast.success(
            `Added ${added} problem${added === 1 ? "" : "s"} to ${formatShortDay(date)}`,
          );
          onOpenChange(false);
        },
        onError: (error) =>
          toast.error(error instanceof ApiError ? error.message : "Couldn't add those. Try again."),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-3 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add problems</DialogTitle>
          <DialogDescription>For {formatLongDay(date)}</DialogDescription>
        </DialogHeader>

        <Command className="rounded-lg bg-surface">
          <CommandInput placeholder="Search problems or chapters…" />
          <CommandList className="max-h-72">
            <CommandEmpty>No problems found.</CommandEmpty>
            {sheet.data?.chapters.map((chapter) => (
              <CommandGroup key={chapter.id} heading={chapter.title}>
                {chapter.topics
                  .flatMap((t) => t.problems)
                  .map((problem) => {
                    const scheduledFor = problemDates?.get(problem.id);
                    return (
                      <CommandItem
                        key={problem.id}
                        value={`${problem.title} ${chapter.title} #${problem.id}`}
                        disabled={scheduledFor !== undefined}
                        data-checked={selected.has(problem.id)}
                        onSelect={() => toggle(problem.id)}
                      >
                        <DifficultyDot difficulty={problem.difficulty} />
                        <span className="min-w-0 flex-1 truncate">{problem.title}</span>
                        {scheduledFor !== undefined ? (
                          <span className="text-xs text-muted-foreground">
                            {scheduledFor === date
                              ? "Already added"
                              : `Planned for ${formatShortDay(scheduledFor)}`}
                          </span>
                        ) : (
                          solved.has(problem.id) && (
                            <span className="text-xs text-muted-foreground">Solved</span>
                          )
                        )}
                      </CommandItem>
                    );
                  })}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>

        <Input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={500}
          placeholder="Note (optional), e.g. revise before the contest"
          aria-label="Note"
        />

        <DialogFooter className="items-center sm:justify-between">
          <p className="text-xs text-muted-foreground tabular-nums">{selected.size} selected</p>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              disabled={selected.size === 0 || !problemDates || schedule.isPending}
              onClick={submit}
            >
              {schedule.isPending
                ? "Adding…"
                : `Add ${selected.size || ""} problem${selected.size === 1 ? "" : "s"}`}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
