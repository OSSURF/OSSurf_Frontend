export interface TrackedPR {
  id: number;
  user_id: string;
  repo_owner: string;
  repo_name: string;
  number: number;
  html_url: string;
  additions: number | null;
  deletions: number | null;
  changed_files: number | null;
  title: string;
  state: string;
  author: string;
  note: string | null;
  priority: string | null;
  opened_at: string;
  merged_at: string | null;
  closed_at: string | null;
  merged_by: string | null;
  created_at: string;
  last_synced_at: string;
}
import { API_BASE_URL } from "./config";

const API_BASE = `${API_BASE_URL}/api/track-prs`;

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      (body as { error?: string }).error || `Request failed (${res.status})`,
    );
  }
  return res.json() as Promise<T>;
}

export async function fetchTrackedPRs(): Promise<TrackedPR[]> {
  return apiFetch<TrackedPR[]>("/");
}

export async function addTrackedPR(payload: {
  url: string;
  notes: string;
  priority: string;
}): Promise<TrackedPR> {
  return apiFetch<TrackedPR>("/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function deleteTrackedPR(id: number): Promise<void> {
  await apiFetch<void>(`/${id}`, { method: "DELETE" });
}

export async function syncTrackedPR(id: number): Promise<Partial<TrackedPR>> {
  return apiFetch<Partial<TrackedPR>>(`/${id}/sync`, { method: "POST" });
}

export async function updateTrackedPR(
  id: number,
  payload: { notes?: string; priority?: string },
): Promise<TrackedPR> {
  return apiFetch<TrackedPR>(`/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}
