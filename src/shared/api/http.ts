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
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") ?? "http://localhost:9000/api/v1";

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
  const response = await fetch(`${API_BASE_URL}${path}${buildQueryString(query)}`, {
    method,
    headers: {
      ...(isJsonBody ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: isJsonBody ? JSON.stringify(body) : (body as BodyInit | undefined),
    credentials: withCredentials ? "include" : "same-origin",
    signal,
  });

  const raw = await response.text();
  const payload = raw ? (JSON.parse(raw) as unknown) : null;

  if (!response.ok) {
    throw new ApiError(
      extractErrorMessage(payload, `HTTP ${response.status}`),
      response.status,
      payload,
    );
  }

  return payload as T;
}
