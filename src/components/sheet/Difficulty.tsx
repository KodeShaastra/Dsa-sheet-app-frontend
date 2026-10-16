import { cn } from "@/lib/utils";
import type { Difficulty } from "@/types/api";

// The one place difficulty colours and names are defined. Use these components everywhere.
export const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  EASY: "Easy",
  MEDIUM: "Medium",
  HARD: "Hard",
};

const textColor: Record<Difficulty, string> = {
  EASY: "text-easy",
  MEDIUM: "text-medium",
  HARD: "text-hard",
};

const dotColor: Record<Difficulty, string> = {
  EASY: "bg-easy",
  MEDIUM: "bg-medium",
  HARD: "bg-hard",
};

/** "Easy" / "Medium" / "Hard" in its colour. Calm, like LeetCode: no pill. */
export function DifficultyLabel({
  difficulty,
  className,
}: {
  difficulty: Difficulty;
  className?: string;
}) {
  return (
    <span className={cn("shrink-0 text-sm", textColor[difficulty], className)}>
      {DIFFICULTY_LABEL[difficulty]}
    </span>
  );
}

/** Compact version for tight spots (calendar cells, phones). Has an accessible label. */
export function DifficultyDot({
  difficulty,
  className,
}: {
  difficulty: Difficulty;
  className?: string;
}) {
  return (
    <span
      role="img"
      aria-label={DIFFICULTY_LABEL[difficulty]}
      title={DIFFICULTY_LABEL[difficulty]}
      className={cn("inline-block size-2 shrink-0 rounded-full", dotColor[difficulty], className)}
    />
  );
}
