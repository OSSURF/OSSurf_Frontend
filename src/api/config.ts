/**
 * Local dev: set VITE_API_URL=http://localhost:3000 to hit the backend directly.
 * Production: leave unset — all /api/* requests go through Vercel → Render (Safari-safe).
 */
function resolveApiBase(): string {
  const raw = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");
  if (!raw || !import.meta.env.PROD || typeof window === "undefined") {
    return raw;
  }
  try {
    if (new URL(raw).origin !== window.location.origin) {
      return "";
    }
  } catch {
    return raw;
  }
  return raw;
}

export const API_BASE_URL = resolveApiBase();

export function apiPath(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return API_BASE_URL ? `${API_BASE_URL}${normalized}` : normalized;
}

export function getBearerToken(): string {
  return localStorage.getItem("bearer_token") ?? "";
}

export async function authFetch(url: string, init: RequestInit = {}): Promise<Response> {
  const token = getBearerToken();
  const headers = new Headers(init.headers);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  return fetch(apiPath(url), {
    ...init,
    headers,
    credentials: "include",
  });
}
