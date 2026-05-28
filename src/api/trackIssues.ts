export interface TrackedIssue {
  id: number;
  user_id: string;
  repo_owner: string;
  repo_name: string;
  number: number;
  html_url: string;
  title: string;
  state: string;
  author: string;
  note: string | null;
  priority: string | null;
  created_at: string;
  last_synced_at: string;
}
import { authFetch } from "./config";

const API_BASE = `/api/track-issues`;

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await authFetch(`${API_BASE}${path}`, init);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      (body as { error?: string }).error || `Request failed (${res.status})`,
    );
  }
  return res.json() as Promise<T>;
}

export async function fetchTrackedIssues(): Promise<TrackedIssue[]> {
  return apiFetch<TrackedIssue[]>("/");
}

export async function addTrackedIssue(payload: {
  url: string;
  notes: string;
  priority: string;
}): Promise<TrackedIssue> {
  return apiFetch<TrackedIssue>("/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function deleteTrackedIssue(id: number): Promise<void> {
  await apiFetch<void>(`/${id}`, { method: "DELETE" });
}

export async function syncTrackedIssue(id: number): Promise<Partial<TrackedIssue>> {
  return apiFetch<Partial<TrackedIssue>>(`/${id}/sync`, { method: "POST" });
}

export async function updateTrackedIssue(
  id: number,
  payload: { notes?: string; priority?: string },
): Promise<TrackedIssue> {
  return apiFetch<TrackedIssue>(`/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}
