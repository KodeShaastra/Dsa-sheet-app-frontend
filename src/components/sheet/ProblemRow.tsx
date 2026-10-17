"use client";

import { DifficultyDot, DifficultyLabel } from "@/components/sheet/Difficulty";
import { ResourceLinks } from "@/components/sheet/ResourceLinks";
import { Checkbox } from "@/components/ui/checkbox";
import { useToggleSolved } from "@/hooks/useSolvedProblems";
import { problemElementId, type ProblemView } from "@/lib/sheetView";
import { cn } from "@/lib/utils";

/** 44px row: checkbox, title, difficulty, links. All rows look the same; a soft fill on hover. */
export function ProblemRow({ problem, upNext }: { problem: ProblemView; upNext: boolean }) {
  const toggle = useToggleSolved();
  const checkboxId = `solved-${problem.id}`;

  return (
    <li
      id={problemElementId(problem.id)}
      className={cn(
        "flex min-h-11 scroll-mt-24 items-center gap-3 rounded-lg px-4 py-2 transition-colors hover:bg-surface",
        upNext && "ring-1 ring-primary/40 ring-inset",
      )}
    >
      <Checkbox
        id={checkboxId}
        checked={problem.solved}
        onCheckedChange={(checked) =>
          toggle.mutate({ problemId: problem.id, solved: checked === true })
        }
      />
      <label
        htmlFor={checkboxId}
        className={cn(
          "min-w-0 flex-1 cursor-pointer text-sm font-medium",
          problem.solved ? "text-muted-foreground" : "text-foreground",
        )}
      >
        {problem.title}
        {upNext && <span className="ml-2 text-xs font-medium text-primary">In progress</span>}
      </label>
      {/* Label on wider screens, dot on phones: difficulty is always visible. */}
      <DifficultyLabel difficulty={problem.difficulty} className="hidden w-16 sm:inline" />
      <DifficultyDot difficulty={problem.difficulty} className="sm:hidden" />
      <ResourceLinks problem={problem} />
    </li>
  );
}
