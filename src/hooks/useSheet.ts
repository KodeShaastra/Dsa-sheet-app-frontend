"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import type { SheetResponse } from "@/types/api";

/** Chapters → topics → problems. Same for everyone and rarely changes, so never refetched. */
export function useSheet() {
  return useQuery({
    queryKey: queryKeys.sheet,
    queryFn: ({ signal }) => api.get<SheetResponse>("/api/sheet", signal),
    staleTime: Infinity,
  });
}
