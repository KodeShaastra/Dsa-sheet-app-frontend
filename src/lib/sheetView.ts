import type { Chapter, Difficulty, Problem } from "@/types/api";

export type DifficultyFilter = "ALL" | Difficulty;

export interface SheetFilters {
  difficulty: DifficultyFilter;
  hideSolved: boolean;
}

export interface Count {
  total: number;
  solved: number;
}

export interface ProblemView extends Problem {
  solved: boolean;
}

export interface TopicView {
  id: string;
  title: string;
  problems: ProblemView[];
}

export interface ChapterView {
  id: string;
  title: string;
  /** Counts for the whole chapter, not just what the filters show. */
  count: Count;
  topics: TopicView[];
}

const emptyCount = (): Count => ({ total: 0, solved: 0 });

/** Overall and per-difficulty counts. Built from the same data as the rows, so they always agree. */
export function countProgress(chapters: Chapter[], solved: Set<string>) {
  const overall = emptyCount();
  const byDifficulty: Record<Difficulty, Count> = {
    EASY: emptyCount(),
    MEDIUM: emptyCount(),
    HARD: emptyCount(),
  };
  for (const chapter of chapters) {
    for (const problem of chapter.topics.flatMap((t) => t.problems)) {
      const isSolved = solved.has(problem.id) ? 1 : 0;
      for (const count of [overall, byDifficulty[problem.difficulty]]) {
        count.total += 1;
        count.solved += isSolved;
      }
    }
  }
  return { overall, byDifficulty };
}

function matches(problem: ProblemView, filters: SheetFilters) {
  if (filters.hideSolved && problem.solved) return false;
  return filters.difficulty === "ALL" || problem.difficulty === filters.difficulty;
}

/** Chapters → topics → problems after filtering. Empty topics and chapters are left out. */
export function buildSheetView(
  chapters: Chapter[],
  solved: Set<string>,
  filters: SheetFilters,
): ChapterView[] {
  return chapters.flatMap((chapter) => {
    const count = emptyCount();
    const topics = chapter.topics.flatMap((topic) => {
      const problems = topic.problems.flatMap((p) => {
        const view = { ...p, solved: solved.has(p.id) };
        count.total += 1;
        count.solved += view.solved ? 1 : 0;
        return matches(view, filters) ? [view] : [];
      });
      return problems.length > 0 ? [{ id: topic.id, title: topic.title, problems }] : [];
    });
    return topics.length > 0 ? [{ id: chapter.id, title: chapter.title, count, topics }] : [];
  });
}

/** Where to resume: the first problem (in sheet order) that isn't solved yet. */
export function firstUnsolved(chapters: Chapter[], solved: Set<string>) {
  for (const chapter of chapters) {
    for (const problem of chapter.topics.flatMap((t) => t.problems)) {
      if (!solved.has(problem.id)) return { chapterId: chapter.id, problemId: problem.id };
    }
  }
  return null;
}

export const problemElementId = (problemId: string) => `problem-${problemId}`;
