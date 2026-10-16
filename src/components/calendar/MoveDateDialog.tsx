"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { DateKey } from "@/lib/calendar";

/** Pick a new date (today or later) with the browser's own date input (no calendar library). */
export function MoveDateDialog({
  open,
  onOpenChange,
  title,
  currentDate,
  today,
  pending,
  onMove,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  currentDate: DateKey;
  today: DateKey;
  pending: boolean;
  onMove: (date: DateKey) => void;
}) {
  // A missed item starts on today, the earliest date it can move to.
  const startDate = currentDate < today ? today : currentDate;
  const [date, setDate] = useState(startDate);

  // Start from `startDate` each time it opens. (The parent opens it, so onOpenChange never sees `true`.)
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setDate(startDate);
  }
  const valid = date !== "" && date >= today && date !== currentDate;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Move to another date</DialogTitle>
          <DialogDescription>{title}</DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (valid) onMove(date);
          }}
          className="space-y-4"
        >
          <Field>
            <FieldLabel htmlFor="move-date">New date</FieldLabel>
            <Input
              id="move-date"
              type="date"
              required
              min={today}
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </Field>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending || !valid}>
              {pending ? "Moving…" : "Move"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
