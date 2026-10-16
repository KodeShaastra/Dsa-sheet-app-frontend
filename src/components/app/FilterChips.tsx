"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

/**
 * Pill-shaped single-choice filter (e.g. All / Easy / Medium / Hard).
 * Unselected chips are a soft fill; the selected one is solid. Used for every filter row.
 */
export function FilterChips<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: readonly { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={(v) => v && onChange(v as T)}
      aria-label={label}
      className="flex-wrap gap-2"
    >
      {options.map((o) => (
        <ToggleGroupItem
          key={o.value}
          value={o.value}
          className="h-8 rounded-full bg-surface px-3.5 font-normal text-subtle-foreground hover:bg-surface-hover hover:text-foreground data-[state=on]:bg-foreground data-[state=on]:text-background"
        >
          {o.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
