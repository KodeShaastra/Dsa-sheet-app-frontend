"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import type { SheetResponse, SolvedProblemsResponse } from "@/types/api";

export function useSolvedProblems() {
  return useQuery({
    queryKey: queryKeys.solvedProblems,
    queryFn: ({ signal }) => api.get<SolvedProblemsResponse>("/api/solved-problems", signal),
  });
}

interface ToggleInput {
  problemId: string;
  solved: boolean;
}

/** Find the problem's difficulty and chapter in the cached sheet (for the optimistic stats). */
function findProblem(sheet: SheetResponse | undefined, problemId: string) {
  for (const chapter of sheet?.chapters ?? []) {
    for (const topic of chapter.topics) {
      const problem = topic.problems.find((p) => p.id === problemId);
      if (problem) return { difficulty: problem.difficulty, chapterId: chapter.id };
    }
  }
  return null;
}

/** The same change the server will make: ids and every count that includes this problem. */
function applyToggle(
  data: SolvedProblemsResponse,
  { problemId, solved }: ToggleInput,
  sheet: SheetResponse | undefined,
): SolvedProblemsResponse {
  const isSolved = data.solvedProblemIds.includes(problemId);
  if (isSolved === solved) return data;

  const delta = solved ? 1 : -1;
  const where = findProblem(sheet, problemId);
  const { stats } = data;

  return {
    solvedProblemIds: solved
      ? [...data.solvedProblemIds, problemId]
      : data.solvedProblemIds.filter((id) => id !== problemId),
    stats: {
      ...stats,
      solved: stats.solved + delta,
      byDifficulty: where
        ? {
            ...stats.byDifficulty,
            [where.difficulty]: {
              ...stats.byDifficulty[where.difficulty],
              solved: stats.byDifficulty[where.difficulty].solved + delta,
            },
          }
        : stats.byDifficulty,
      byChapter: stats.byChapter.map((c) =>
        c.id === where?.chapterId ? { ...c, solved: c.solved + delta } : c,
      ),
    },
  };
}

const TOGGLE_KEY = ["toggleSolved"] as const;

/** Tick / untick. The checkbox flips instantly; on failure it flips back and shows a toast. */
export function useToggleSolved() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: TOGGLE_KEY,
    mutationFn: ({ problemId, solved }: ToggleInput) =>
      solved
        ? api.put<void>(`/api/solved-problems/${problemId}`)
        : api.delete<void>(`/api/solved-problems/${problemId}`),

    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.solvedProblems });
      const previous = queryClient.getQueryData<SolvedProblemsResponse>(queryKeys.solvedProblems);
      const sheet = queryClient.getQueryData<SheetResponse>(queryKeys.sheet);
      if (previous) {
        queryClient.setQueryData(queryKeys.solvedProblems, applyToggle(previous, input, sheet));
      }
      return { previous };
    },

    onError: (_error, _input, context) => {
      if (context?.previous) queryClient.setQueryData(queryKeys.solvedProblems, context.previous);
      toast.error("Couldn't save that. Please try again.");
    },

    onSettled: () => {
      // Only sync with the server once the last quick tick has finished, so rows don't flicker.
      if (queryClient.isMutating({ mutationKey: TOGGLE_KEY }) === 1) {
        return queryClient.invalidateQueries({ queryKey: queryKeys.solvedProblems });
      }
    },
  });
}
