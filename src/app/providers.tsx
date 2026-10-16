"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ApiError, setSessionExpiredHandler } from "@/lib/api";
import { loginUrlFor } from "@/lib/navigation";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: false,
        // Retry network/server hiccups once; never retry 4xx (bad input, not found, logged out).
        retry: (failureCount, error) =>
          !(error instanceof ApiError && error.status >= 400 && error.status < 500) &&
          failureCount < 1,
      },
    },
  });
}

export function Providers({ children }: { children: React.ReactNode }) {
  // One client per browser tab, created once.
  const [queryClient] = useState(makeQueryClient);

  useEffect(() => {
    // Session could not be refreshed: drop all cached data and go to /login, then come back here.
    setSessionExpiredHandler(() => {
      queryClient.clear();
      if (window.location.pathname !== "/login") {
        window.location.assign(loginUrlFor(window.location.pathname + window.location.search));
      }
    });
  }, [queryClient]);

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider delayDuration={300}>
          {children}
          <Toaster position="bottom-right" />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
