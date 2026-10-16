import { FilterChips } from "@/components/app/FilterChips";
import { Switch } from "@/components/ui/switch";
import type { DifficultyFilter, SheetFilters as Filters } from "@/lib/sheetView";

const OPTIONS = [
  { value: "ALL", label: "All" },
  { value: "EASY", label: "Easy" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HARD", label: "Hard" },
] as const satisfies readonly { value: DifficultyFilter; label: string }[];

export function SheetFilters({
  filters,
  onChange,
}: {
  filters: Filters;
  onChange: (filters: Filters) => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <FilterChips
        label="Filter by difficulty"
        value={filters.difficulty}
        options={OPTIONS}
        onChange={(difficulty) => onChange({ ...filters, difficulty })}
      />
      <label className="flex cursor-pointer items-center gap-2 text-sm text-subtle-foreground">
        <Switch
          checked={filters.hideSolved}
          onCheckedChange={(hideSolved) => onChange({ ...filters, hideSolved })}
        />
        Hide solved
      </label>
    </div>
  );
}
