"use client";

type Primitive = string | number | boolean;
type QueryValue = Primitive | Primitive[] | undefined | null;

export class ApiError extends Error {
  readonly status: number;
  readonly payload: unknown;

  constructor(message: string, status: number, payload: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  token?: string | null;
  withCredentials?: boolean;
  headers?: Record<string, string>;
  query?: Record<string, QueryValue>;
  signal?: AbortSignal;
  /** Skip silent refresh + retry (internal / auth endpoints). */
  skipAuthRefresh?: boolean;
};

export type RefreshAuthPayload = {
  accessToken: string;
  user: {
    id: string;
    email: string;
    emailVerified: boolean;
    profile: { displayName: string; slug: string } | null;
  };
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") ?? "http://localhost:9000/api/v1";
const ACCESS_TOKEN_STORAGE_KEY = "swaply-auth-access-token";
export const ACCESS_TOKEN_CHANGED_EVENT = "swaply:access-token-changed";

type AccessTokenChangedDetail = {
  accessToken: string | null;
};

let refreshInFlight: Promise<RefreshAuthPayload> | null = null;

function buildQueryString(query: Record<string, QueryValue> | undefined): string {
  if (!query) return "";

  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === "") {
      continue;
    }

    if (Array.isArray(value)) {
      for (const entry of value) {
        params.append(key, String(entry));
      }
      continue;
    }

    params.set(key, String(value));
  }

  const asString = params.toString();
  return asString ? `?${asString}` : "";
}

function extractErrorMessage(payload: unknown, fallback: string): string {
  if (!payload || typeof payload !== "object") {
    return fallback;
  }

  const candidate = payload as { message?: unknown };
  if (Array.isArray(candidate.message) && candidate.message.length > 0) {
    return String(candidate.message[0]);
  }
  if (typeof candidate.message === "string" && candidate.message.trim()) {
    return candidate.message;
  }

  return fallback;
}

function readStoredAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
}

export function getStoredAccessToken(): string | null {
  return readStoredAccessToken();
}

function writeStoredAccessToken(token: string | null) {
  if (typeof window === "undefined") return;

  if (token) {
    window.localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, token);
  } else {
    window.localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
  }

  window.dispatchEvent(
    new CustomEvent<AccessTokenChangedDetail>(ACCESS_TOKEN_CHANGED_EVENT, {
      detail: { accessToken: token },
    }),
  );
}

function shouldSkipAuthRefresh(path: string, options: RequestOptions): boolean {
  if (options.skipAuthRefresh) return true;

  return (
    path === "/auth/refresh" ||
    path === "/auth/login" ||
    path === "/auth/register" ||
    path === "/auth/forgot-password" ||
    path === "/auth/reset-password" ||
    path === "/auth/verify-email" ||
    path === "/auth/resend-verification" ||
    path === "/auth/verification-status"
  );
}

function parseRefreshPayload(payload: unknown): RefreshAuthPayload | null {
  if (!payload || typeof payload !== "object") return null;

  const data = payload as {
    accessToken?: unknown;
    user?: RefreshAuthPayload["user"];
  };

  if (typeof data.accessToken !== "string" || !data.user?.id || !data.user?.email) {
    return null;
  }

  return {
    accessToken: data.accessToken,
    user: data.user,
  };
}

/** Single-flight refresh used by silent 401 retry and AuthProvider bootstrap. */
export async function refreshAccessToken(
  refreshToken?: string,
): Promise<RefreshAuthPayload> {
  if (refreshInFlight) {
    return refreshInFlight;
  }

  refreshInFlight = (async () => {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(refreshToken ? { refreshToken } : {}),
      credentials: "include",
    });

    const raw = await response.text();
    const payload = raw ? (JSON.parse(raw) as unknown) : null;

    if (!response.ok) {
      writeStoredAccessToken(null);
      throw new ApiError(
        extractErrorMessage(payload, `HTTP ${response.status}`),
        response.status,
        payload,
      );
    }

    const parsed = parseRefreshPayload(payload);
    if (!parsed) {
      writeStoredAccessToken(null);
      throw new ApiError("Refresh response missing accessToken", 401, payload);
    }

    writeStoredAccessToken(parsed.accessToken);
    return parsed;
  })().finally(() => {
    refreshInFlight = null;
  });

  return refreshInFlight;
}

const ACCESS_TOKEN_REFRESH_SKEW_MS = 2 * 60 * 1000;

function readJwtExpiryMs(token: string): number | null {
  try {
    const payloadPart = token.split(".")[1];
    if (!payloadPart) return null;
    const normalized = payloadPart.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=");
    const json = atob(padded);
    const payload = JSON.parse(json) as { exp?: unknown };
    if (typeof payload.exp !== "number") return null;
    return payload.exp * 1000;
  } catch {
    return null;
  }
}

/**
 * Ensures a usable access token before a burst of authenticated requests
 * (e.g. parallel media uploads), so we don't stampede 401 → refresh.
 * Refreshes when missing, unreadable, or within 2 minutes of expiry.
 */
export async function ensureFreshAccessToken(): Promise<string> {
  const current = readStoredAccessToken();
  if (current) {
    const expiresAt = readJwtExpiryMs(current);
    if (expiresAt !== null && expiresAt - Date.now() > ACCESS_TOKEN_REFRESH_SKEW_MS) {
      return current;
    }
  }

  const refreshed = await refreshAccessToken();
  return refreshed.accessToken;
}

export async function httpRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const {
    method = "GET",
    body,
    token,
    withCredentials = false,
    headers,
    query,
    signal,
  } = options;

  const isJsonBody = body !== undefined && !(body instanceof FormData);
  const resolvedToken =
    token === undefined && typeof window !== "undefined" ? readStoredAccessToken() : token;

  const response = await fetch(`${API_BASE_URL}${path}${buildQueryString(query)}`, {
    method,
    headers: {
      ...(isJsonBody ? { "Content-Type": "application/json" } : {}),
      ...(resolvedToken ? { Authorization: `Bearer ${resolvedToken}` } : {}),
      ...headers,
    },
    body: isJsonBody ? JSON.stringify(body) : (body as BodyInit | undefined),
    credentials: withCredentials ? "include" : "same-origin",
    signal,
  });

  const raw = await response.text();
  const payload = raw ? (JSON.parse(raw) as unknown) : null;

  if (!response.ok) {
    if (
      response.status === 401 &&
      typeof window !== "undefined" &&
      !shouldSkipAuthRefresh(path, options)
    ) {
      try {
        const refreshed = await refreshAccessToken();
        return httpRequest<T>(path, {
          ...options,
          token: refreshed.accessToken,
          skipAuthRefresh: true,
        });
      } catch {
        // Fall through to original 401 if refresh failed.
      }
    }

    throw new ApiError(
      extractErrorMessage(payload, `HTTP ${response.status}`),
      response.status,
      payload,
    );
  }

  return payload as T;
}
