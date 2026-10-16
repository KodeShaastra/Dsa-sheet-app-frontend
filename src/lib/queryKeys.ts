// Every TanStack Query key lives here, so invalidation always hits the right data.
export const queryKeys = {
  me: ["me"] as const,
  sheet: ["sheet"] as const,
  solvedProblems: ["solvedProblems"] as const,
  /** Prefix: invalidating this refreshes every loaded month. */
  scheduledProblemsAll: ["scheduledProblems"] as const,
  scheduledProblems: (from: string, to: string) => ["scheduledProblems", from, to] as const,
  /** Under the same prefix, so every schedule change refreshes it too. */
  problemDates: ["scheduledProblems", "problemDates"] as const,
};
