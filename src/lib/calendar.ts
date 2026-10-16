import { addDays, addMonths, endOfWeek, format, isSameMonth, parse, startOfWeek } from "date-fns";
import type { ScheduledProblem } from "@/types/api";

// Every date in the app is a "YYYY-MM-DD" key. Never use toISOString() (it shifts the day in IST).
export type DateKey = string;
/** "YYYY-MM" */
export type MonthKey = string;

const WEEK = { weekStartsOn: 1 } as const; // Monday first
const GRID_DAYS = 42; // always 6 weeks, so the grid never changes height (and stays under the 62-day limit)

export const toKey = (date: Date): DateKey => format(date, "yyyy-MM-dd");
export const fromKey = (key: DateKey): Date => parse(key, "yyyy-MM-dd", new Date());
export const monthOf = (key: DateKey): MonthKey => key.slice(0, 7);
const monthStart = (month: MonthKey) => parse(`${month}-01`, "yyyy-MM-dd", new Date());

export const shiftMonth = (month: MonthKey, by: number): MonthKey =>
  format(addMonths(monthStart(month), by), "yyyy-MM");

export interface GridDay {
  key: DateKey;
  dayOfMonth: number;
  inMonth: boolean;
}

/** The 42 days shown for a month: Monday on or before the 1st, then 6 full weeks. */
export function monthGrid(month: MonthKey): GridDay[] {
  const first = monthStart(month);
  const gridStart = startOfWeek(first, WEEK);
  return Array.from({ length: GRID_DAYS }, (_, i) => {
    const day = addDays(gridStart, i);
    return { key: toKey(day), dayOfMonth: day.getDate(), inMonth: isSameMonth(day, first) };
  });
}

/** Monday–Sunday of the week containing `day`. */
export function weekRange(day: DateKey): { from: DateKey; to: DateKey } {
  const date = fromKey(day);
  return { from: toKey(startOfWeek(date, WEEK)), to: toKey(endOfWeek(date, WEEK)) };
}

/** Missed = still PENDING and its day is before today. Computed, never stored. */
export const isMissed = (item: ScheduledProblem, today: DateKey) =>
  item.status === "PENDING" && item.scheduledFor < today;

export function groupByDay(items: ScheduledProblem[]): Map<DateKey, ScheduledProblem[]> {
  const byDay = new Map<DateKey, ScheduledProblem[]>();
  for (const item of items) {
    const list = byDay.get(item.scheduledFor) ?? [];
    list.push(item);
    byDay.set(item.scheduledFor, list);
  }
  return byDay;
}

export const formatMonth = (month: MonthKey) => format(monthStart(month), "MMMM yyyy");
/** "Mon, 20 Oct" */
export const formatShortDay = (key: DateKey) => format(fromKey(key), "EEE, d MMM");
/** "Monday, 20 October" */
export const formatLongDay = (key: DateKey) => format(fromKey(key), "EEEE, d MMMM");
export const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
