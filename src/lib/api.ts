import type { ApiErrorBody, ErrorCode, ErrorDetail } from "@/types/api";

/** Every failed API call throws this. `code` is the backend's error code, or NETWORK. */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: ErrorCode | "NETWORK",
    message: string,
    readonly details: ErrorDetail[] = [],
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// These never trigger a refresh: they either create a session or can't use one.
const NO_REFRESH = new Set([
  "/api/auth/login",
  "/api/auth/signup",
  "/api/auth/refresh",
  "/api/auth/logout",
]);

let refreshing: Promise<boolean> | null = null;
let onSessionExpired: () => void = () => {};

/** Called once by the app: what to do when the session can't be refreshed. */
export function setSessionExpiredHandler(handler: () => void) {
  onSessionExpired = handler;
}

/** One shared refresh call: if many requests get 401 at once, they all wait on the same one. */
function refreshSession(): Promise<boolean> {
  refreshing ??= fetch("/api/auth/refresh", { method: "POST", credentials: "include" })
    .then((res) => res.ok)
    .catch(() => false)
    .finally(() => {
      refreshing = null;
    });
  return refreshing;
}

function isApiErrorBody(value: unknown): value is ApiErrorBody {
  if (typeof value !== "object" || value === null || !("error" in value)) return false;
  const error: unknown = value.error;
  return typeof error === "object" && error !== null && "code" in error && "message" in error;
}

async function toApiError(res: Response): Promise<ApiError> {
  const body: unknown = await res.json().catch(() => null);
  if (isApiErrorBody(body)) {
    const { code, message, details } = body.error;
    return new ApiError(res.status, code, message, Array.isArray(details) ? details : []);
  }
  return new ApiError(res.status, "INTERNAL", "Something went wrong. Please try again.");
}

async function send(path: string, init: RequestInit): Promise<Response> {
  try {
    return await fetch(path, { ...init, credentials: "include" });
  } catch {
    throw new ApiError(0, "NETWORK", "Can't reach the server. Check your connection.");
  }
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  signal?: AbortSignal;
}

/**
 * Calls the backend with a relative /api path. Returns the JSON body (undefined for 204).
 * On 401: refreshes the session once and retries; if that fails, the session-expired handler runs.
 */
export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const init: RequestInit = {
    method: options.method ?? "GET",
    signal: options.signal,
    ...(options.body !== undefined && {
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(options.body),
    }),
  };

  let res = await send(path, init);

  if (res.status === 401 && !NO_REFRESH.has(path)) {
    if (await refreshSession()) res = await send(path, init);
    if (res.status === 401) onSessionExpired();
  }

  if (!res.ok) throw await toApiError(res);
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const api = {
  get: <T>(path: string, signal?: AbortSignal) => apiRequest<T>(path, { signal }),
  post: <T>(path: string, body?: unknown) => apiRequest<T>(path, { method: "POST", body }),
  put: <T>(path: string, body?: unknown) => apiRequest<T>(path, { method: "PUT", body }),
  patch: <T>(path: string, body?: unknown) => apiRequest<T>(path, { method: "PATCH", body }),
  delete: <T>(path: string) => apiRequest<T>(path, { method: "DELETE" }),
};
