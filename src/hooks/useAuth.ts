"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { navigateAfterAuthChange } from "@/lib/navigation";
import { queryKeys } from "@/lib/queryKeys";
import type { LoginInput, SignupInput, User, UserResponse } from "@/types/api";

/** The logged-in user. */
export function useMe() {
  return useQuery({
    queryKey: queryKeys.me,
    queryFn: ({ signal }) => api.get<UserResponse>("/api/auth/me", signal),
    select: (data): User => data.user,
    staleTime: 5 * 60_000,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: LoginInput) => api.post<UserResponse>("/api/auth/login", input),
    onSuccess: (data) => queryClient.setQueryData(queryKeys.me, data),
  });
}

export function useSignup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SignupInput) => api.post<UserResponse>("/api/auth/signup", input),
    onSuccess: (data) => queryClient.setQueryData(queryKeys.me, data),
  });
}

/** Log out here, or on every device with `{ everywhere: true }`. Always ends on /login. */
export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ everywhere = false }: { everywhere?: boolean } = {}) =>
      api.post<void>(everywhere ? "/api/auth/logout-all" : "/api/auth/logout"),
    onSettled: () => {
      queryClient.clear();
      navigateAfterAuthChange("/login");
    },
  });
}
