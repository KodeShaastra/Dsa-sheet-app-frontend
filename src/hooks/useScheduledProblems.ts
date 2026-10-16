"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import type {
  ScheduledProblem,
  ScheduledProblemResponse,
  ScheduledProblemsResponse,
  ScheduleProblemsInput,
  UpdateScheduledProblemInput,
} from "@/types/api";

// The whole calendar comes from ONE request, cached under one key. It stays small (a problem sits on one
// date at a time), so the month grid, the week summary and the Add dialog all read it, each with its own
// `select`, and changing month needs no request at all.
const calendarQuery = {
  queryKey: queryKeys.scheduledProblems,
  queryFn: ({ signal }: { signal: AbortSignal }) =>
    api.get<ScheduledProblemsResponse>("/api/scheduled-problems", signal),
};

const selectItems = (data: ScheduledProblemsResponse): ScheduledProblem[] => data.scheduledProblems;

const selectProblemDates = (data: ScheduledProblemsResponse): Map<string, string> =>
  new Map(data.scheduledProblems.map((item) => [item.problem.id, item.scheduledFor]));

/** Every scheduled problem of the user, sorted by date. */
export function useScheduledProblems() {
  return useQuery({ ...calendarQuery, select: selectItems });
}

/** Problem id → the date it's scheduled for, to stop scheduling a problem twice. Same request as above. */
export function useProblemDates() {
  return useQuery({ ...calendarQuery, select: selectProblemDates });
}

export function useScheduleProblems() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ScheduleProblemsInput) =>
      api.post<ScheduledProblemsResponse>("/api/scheduled-problems", input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.scheduledProblems }),
  });
}

/** Change date, status, or note. Marking DONE also ticks the problem on the sheet. */
export function useUpdateScheduledProblem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...input }: UpdateScheduledProblemInput & { id: string }) =>
      api.patch<ScheduledProblemResponse>(`/api/scheduled-problems/${id}`, input),
    onSuccess: (_data, input) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.scheduledProblems });
      if (input.status === "DONE") {
        void queryClient.invalidateQueries({ queryKey: queryKeys.solvedProblems });
      }
    },
  });
}

export function useDeleteScheduledProblem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<void>(`/api/scheduled-problems/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.scheduledProblems }),
  });
}
