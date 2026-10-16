import { DifficultyLabel } from "@/components/sheet/Difficulty";
import { Progress } from "@/components/ui/progress";
import type { Count } from "@/lib/sheetView";
import type { Difficulty } from "@/types/api";

const DIFFICULTIES: Difficulty[] = ["EASY", "MEDIUM", "HARD"];

const percent = ({ solved, total }: Count) =>
  total === 0 ? 0 : Math.round((solved / total) * 100);

/** Overall solved count + bar, and one small tile per difficulty. */
export function ProgressOverview({
  overall,
  byDifficulty,
}: {
  overall: Count;
  byDifficulty: Record<Difficulty, Count>;
}) {
  return (
    <section aria-label="Your progress" className="grid gap-3 sm:grid-cols-[1.4fr_1fr_1fr_1fr]">
      <div className="space-y-3 rounded-lg bg-surface p-4">
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            <span className="text-2xl font-semibold text-foreground tabular-nums">
              {overall.solved}
            </span>
            <span className="tabular-nums"> / {overall.total}</span> solved
          </p>
          <span className="text-xs text-muted-foreground tabular-nums">{percent(overall)}%</span>
        </div>
        <Progress value={percent(overall)} aria-label="Overall progress" />
      </div>

      <dl className="contents">
        {DIFFICULTIES.map((d) => (
          <div
            key={d}
            className="flex flex-col justify-center gap-1 rounded-lg bg-surface px-4 py-3"
          >
            <dt>
              <DifficultyLabel difficulty={d} className="text-xs font-medium" />
            </dt>
            <dd className="text-sm text-muted-foreground tabular-nums">
              <span className="font-semibold text-foreground">{byDifficulty[d].solved}</span> /{" "}
              {byDifficulty[d].total}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
