"use client";

import { useEffect, useMemo, useState } from "react";
import { EmptyState, ErrorState, PageHeader } from "@/components/app/States";
import { ChapterAccordion } from "@/components/sheet/ChapterAccordion";
import { ProgressOverview } from "@/components/sheet/ProgressOverview";
import { SheetFilters } from "@/components/sheet/SheetFilters";
import { Accordion } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useSheet } from "@/hooks/useSheet";
import { useSolvedProblems } from "@/hooks/useSolvedProblems";
import {
  buildSheetView,
  countProgress,
  firstUnsolved,
  problemElementId,
  type SheetFilters as Filters,
} from "@/lib/sheetView";

const NO_FILTERS: Filters = { difficulty: "ALL", hideSolved: false };
type Target = ReturnType<typeof firstUnsolved>;

function SheetSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading the sheet">
      <Skeleton className="h-28 w-full" />
      <Skeleton className="h-8 w-72" />
      {Array.from({ length: 5 }, (_, i) => (
        <Skeleton key={i} className="h-16 w-full" />
      ))}
    </div>
  );
}

/** Scroll the resume target into view once its chapter has opened. */
function useScrollTo(target: Target) {
  useEffect(() => {
    if (!target) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = setTimeout(() => {
      document
        .getElementById(problemElementId(target.problemId))
        ?.scrollIntoView({ block: "center", behavior: reduceMotion ? "auto" : "smooth" });
    }, 200);
    return () => clearTimeout(timer);
  }, [target]);
}

export function SheetView() {
  const sheet = useSheet();
  const solvedQuery = useSolvedProblems();
  const [filters, setFilters] = useState(NO_FILTERS);
  const [open, setOpen] = useState<string[]>([]);
  // undefined = not decided yet; null = everything solved.
  const [resumeTarget, setResumeTarget] = useState<Target | undefined>(undefined);

  const chapters = useMemo(() => sheet.data?.chapters ?? [], [sheet.data]);
  const solved = useMemo(
    () => new Set(solvedQuery.data?.solvedProblemIds ?? []),
    [solvedQuery.data],
  );
  const ready = sheet.isSuccess && solvedQuery.isSuccess;

  // Resume where they left off: decided once, when both queries first succeed.
  if (ready && resumeTarget === undefined) {
    const target = firstUnsolved(chapters, solved);
    setResumeTarget(target);
    if (target) setOpen([target.chapterId]);
  }
  useScrollTo(resumeTarget ?? null);

  const progress = useMemo(() => countProgress(chapters, solved), [chapters, solved]);
  const view = useMemo(
    () => buildSheetView(chapters, solved, filters),
    [chapters, solved, filters],
  );
  const upNextId = useMemo(
    () => firstUnsolved(chapters, solved)?.problemId ?? null,
    [chapters, solved],
  );

  const header = (
    <PageHeader
      title="Your sheet"
      description="Work through each chapter and tick problems off as you solve them."
    />
  );

  if (sheet.isError || solvedQuery.isError) {
    return (
      <div className="space-y-6">
        {header}
        <ErrorState
          message="We couldn't load the sheet."
          onRetry={() => {
            void sheet.refetch();
            void solvedQuery.refetch();
          }}
        />
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="space-y-6">
        {header}
        <SheetSkeleton />
      </div>
    );
  }

  const filtersOn = filters.difficulty !== "ALL" || filters.hideSolved;

  return (
    <div className="space-y-6">
      {header}
      <ProgressOverview overall={progress.overall} byDifficulty={progress.byDifficulty} />
      <SheetFilters filters={filters} onChange={setFilters} />

      {view.length === 0 ? (
        <EmptyState
          message={
            filters.hideSolved && progress.overall.solved === progress.overall.total
              ? "You've solved every problem. Nice work!"
              : "No problems match these filters."
          }
          action={
            filtersOn && (
              <Button variant="outline" size="sm" onClick={() => setFilters(NO_FILTERS)}>
                Clear filters
              </Button>
            )
          }
        />
      ) : (
        <Accordion type="multiple" value={open} onValueChange={setOpen} className="space-y-3">
          {view.map((chapter) => (
            <ChapterAccordion key={chapter.id} chapter={chapter} upNextId={upNextId} />
          ))}
        </Accordion>
      )}
    </div>
  );
}
