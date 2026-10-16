"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import type {
  ProblemDatesResponse,
  ScheduledProblemResponse,
  ScheduledProblemsResponse,
  ScheduleProblemsInput,
  UpdateScheduledProblemInput,
} from "@/types/api";

/** Scheduled problems between two "YYYY-MM-DD" dates (at most 62 days). */
export function useScheduledProblems(from: string, to: string) {
  return useQuery({
    queryKey: queryKeys.scheduledProblems(from, to),
    queryFn: ({ signal }) =>
      api.get<ScheduledProblemsResponse>(`/api/scheduled-problems?from=${from}&to=${to}`, signal),
    select: (data) => data.scheduledProblems,
    // Keep showing the old month while the next one loads, instead of a blank grid.
    placeholderData: keepPreviousData,
  });
}

/** Problem id → the date it's scheduled for (any date), to stop scheduling a problem twice. */
export function useProblemDates() {
  return useQuery({
    queryKey: queryKeys.problemDates,
    queryFn: ({ signal }) =>
      api.get<ProblemDatesResponse>("/api/scheduled-problems/problem-dates", signal),
    select: (data) => new Map(data.problemDates.map((p) => [p.problemId, p.scheduledFor])),
  });
}

export function useScheduleProblems() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ScheduleProblemsInput) =>
      api.post<ScheduledProblemsResponse>("/api/scheduled-problems", input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.scheduledProblemsAll }),
  });
}

/** Change date, status, or note. Marking DONE also ticks the problem on the sheet. */
export function useUpdateScheduledProblem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...input }: UpdateScheduledProblemInput & { id: string }) =>
      api.patch<ScheduledProblemResponse>(`/api/scheduled-problems/${id}`, input),
    onSuccess: (_data, input) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.scheduledProblemsAll });
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
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.scheduledProblemsAll }),
  });
}
