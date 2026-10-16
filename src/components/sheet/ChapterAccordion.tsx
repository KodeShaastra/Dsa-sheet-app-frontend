import { ProblemRow } from "@/components/sheet/ProblemRow";
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import type { ChapterView } from "@/lib/sheetView";

const percent = ({ solved, total }: { solved: number; total: number }) =>
  total === 0 ? 0 : Math.round((solved / total) * 100);

/** One chapter: a filled header (title, "12 / 30", slim bar) that opens to topics and rows. */
export function ChapterAccordion({
  chapter,
  upNextId,
}: {
  chapter: ChapterView;
  upNextId: string | null;
}) {
  return (
    <AccordionItem value={chapter.id} className="border-none">
      <AccordionTrigger className="items-center gap-4 rounded-lg bg-surface px-4 py-3.5 transition-colors hover:bg-surface-hover hover:no-underline">
        <div className="min-w-0 flex-1 space-y-2.5">
          <div className="flex items-baseline justify-between gap-3">
            <span className="truncate text-base font-semibold text-foreground">
              {chapter.title}
            </span>
            <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
              <span className="font-medium text-subtle-foreground">{chapter.count.solved}</span> /{" "}
              {chapter.count.total}
            </span>
          </div>
          <Progress
            value={percent(chapter.count)}
            className="h-1"
            aria-label={`${chapter.title} progress`}
          />
        </div>
      </AccordionTrigger>

      <AccordionContent className="space-y-5 pt-4 pb-6">
        {chapter.topics.map((topic) => (
          <section key={topic.id} aria-label={topic.title} className="space-y-1.5">
            <h3 className="px-4 text-xs font-medium text-muted-foreground">{topic.title}</h3>
            <ul>
              {topic.problems.map((problem) => (
                <ProblemRow key={problem.id} problem={problem} upNext={problem.id === upNextId} />
              ))}
            </ul>
          </section>
        ))}
      </AccordionContent>
    </AccordionItem>
  );
}
