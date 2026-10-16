"use client";

import { useSyncExternalStore } from "react";
import { toKey, type DateKey } from "@/lib/calendar";

// Re-check every minute so "today" rolls over at midnight while the page is open.
function subscribe(onChange: () => void) {
  const timer = setInterval(onChange, 60_000);
  return () => clearInterval(timer);
}

/**
 * Today's date key on the user's own clock. null while rendering on the server,
 * so a page built yesterday never shows yesterday as "today".
 */
export function useToday(): DateKey | null {
  return useSyncExternalStore(
    subscribe,
    () => toKey(new Date()),
    () => null,
  );
}
