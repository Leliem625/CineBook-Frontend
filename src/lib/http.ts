/**
 * Helper gọi HTTP tới cinebook-backend. Mọi hàm trong src/lib/api.ts đi qua đây.
 * Base URL lấy từ NEXT_PUBLIC_API_BASE (mặc định http://localhost:8080/api/v1).
 */

export const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8080/api/v1";

type QueryValue = string | number | boolean | null | undefined;

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly url: string,
    public readonly body: unknown,
  ) {
    super(`API ${status} ${url}`);
    this.name = "ApiError";
  }
}

function buildUrl(path: string, query?: Record<string, QueryValue>): string {
  const url = new URL(API_BASE.replace(/\/$/, "") + path);
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

async function readBody(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function request<T>(
  method: string,
  path: string,
  options: { query?: Record<string, QueryValue>; body?: unknown; init?: RequestInit } = {},
): Promise<T> {
  const url = buildUrl(path, options.query);
  const res = await fetch(url, {
    ...options.init,
    method,
    headers: {
      Accept: "application/json",
      ...(options.body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...options.init?.headers,
    },
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  const body = await readBody(res);
  if (!res.ok) {
    throw new ApiError(res.status, url, body);
  }
  return body as T;
}

export function apiGet<T>(path: string, query?: Record<string, QueryValue>, init?: RequestInit) {
  return request<T>("GET", path, { query, init });
}

export function apiPost<T>(path: string, body?: unknown, init?: RequestInit) {
  return request<T>("POST", path, { body, init });
}
