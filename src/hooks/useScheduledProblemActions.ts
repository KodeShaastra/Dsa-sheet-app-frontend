"use client";

import { toast } from "sonner";
import {
  useDeleteScheduledProblem,
  useScheduleProblems,
  useUpdateScheduledProblem,
} from "@/hooks/useScheduledProblems";
import { ApiError } from "@/lib/api";
import { formatShortDay, type DateKey } from "@/lib/calendar";
import type { ScheduledProblem, ScheduleStatus } from "@/types/api";

const showError = (error: unknown) =>
  toast.error(
    error instanceof ApiError ? error.message : "Something went wrong. Please try again.",
  );

/** Done / skip / undo, move, and delete (with Undo) for one scheduled problem, with toasts. */
export function useScheduledProblemActions() {
  const update = useUpdateScheduledProblem();
  const remove = useDeleteScheduledProblem();
  const schedule = useScheduleProblems();

  return {
    pending: update.isPending || remove.isPending,

    setStatus(item: ScheduledProblem, status: ScheduleStatus) {
      update.mutate(
        { id: item.id, status },
        {
          onSuccess: () => {
            if (status === "DONE")
              toast.success(`“${item.problem.title}” done. It's ticked on your sheet.`);
          },
          onError: showError,
        },
      );
    },

    move(item: ScheduledProblem, date: DateKey, onMoved?: () => void) {
      update.mutate(
        { id: item.id, scheduledFor: date },
        {
          onSuccess: () => {
            toast.success(`Moved to ${formatShortDay(date)}`);
            onMoved?.();
          },
          onError: showError,
        },
      );
    },

    remove(item: ScheduledProblem) {
      remove.mutate(item.id, {
        onSuccess: () =>
          toast("Removed from your calendar", {
            action: {
              label: "Undo",
              onClick: () =>
                schedule.mutate(
                  {
                    scheduledFor: item.scheduledFor,
                    problemIds: [item.problem.id],
                    ...(item.note && { note: item.note }),
                  },
                  { onError: showError },
                ),
            },
          }),
        onError: showError,
      });
    },
  };
}
