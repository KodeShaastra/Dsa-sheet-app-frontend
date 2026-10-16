// Every TanStack Query key lives here, so invalidation always hits the right data.
export const queryKeys = {
  me: ["me"] as const,
  sheet: ["sheet"] as const,
  solvedProblems: ["solvedProblems"] as const,
  /** The whole calendar (one request; months, weeks and "already planned" are worked out from it). */
  scheduledProblems: ["scheduledProblems"] as const,
};
