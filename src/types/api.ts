// Mirrors the backend API contract (see CLAUDE.md). Keep in sync with the backend repo.
// All ids are strings. Dates are "YYYY-MM-DD" strings.

export type Difficulty = "EASY" | "MEDIUM" | "HARD";
export type ScheduleStatus = "PENDING" | "DONE" | "SKIPPED";

export type ErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "INTERNAL";

export interface ErrorDetail {
  path: string;
  message: string;
}

export interface ApiErrorBody {
  error: { code: ErrorCode; message: string; details: ErrorDetail[] };
}

// Auth

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface UserResponse {
  user: User;
}

export interface SignupInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

// Sheet

export interface Problem {
  id: string;
  title: string;
  difficulty: Difficulty;
  youtubeUrl: string | null;
  practiceUrl: string | null;
  articleUrl: string | null;
}

export interface Topic {
  id: string;
  title: string;
  problems: Problem[];
}

export interface Chapter {
  id: string;
  title: string;
  slug: string;
  topics: Topic[];
}

export interface SheetResponse {
  chapters: Chapter[];
}

// Solved problems

export interface Count {
  total: number;
  solved: number;
}

export interface SolvedProblemsResponse {
  solvedProblemIds: string[];
  stats: Count & {
    byDifficulty: Record<Difficulty, Count>;
    byChapter: (Count & { id: string; title: string; slug: string })[];
  };
}

// Scheduled problems

export interface ScheduledProblem {
  id: string;
  scheduledFor: string;
  status: ScheduleStatus;
  note: string | null;
  problem: { id: string; title: string; difficulty: Difficulty };
}

/** Every scheduled problem's date: a problem sits on one date at a time. */
export interface ProblemDate {
  problemId: string;
  scheduledFor: string;
  status: ScheduleStatus;
}

export interface ProblemDatesResponse {
  problemDates: ProblemDate[];
}

export interface ScheduledProblemsResponse {
  scheduledProblems: ScheduledProblem[];
}

export interface ScheduledProblemResponse {
  scheduledProblem: ScheduledProblem;
}

export interface ScheduleProblemsInput {
  scheduledFor: string;
  problemIds: string[];
  note?: string;
}

export interface UpdateScheduledProblemInput {
  scheduledFor?: string;
  status?: ScheduleStatus;
  note?: string | null;
}
