import { authFetch } from "./config";

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

export async function fetchTrackedIssues(): Promise<TrackedIssue[]> {
  const res = await authFetch(`/api/track-issues/`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error || `Request failed (${res.status})`);
  }
  return res.json();
}

export async function addTrackedIssue(payload: {
  url: string;
  notes: string;
  priority: string;
}): Promise<TrackedIssue> {
  const res = await authFetch(`/api/track-issues/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error || `Request failed (${res.status})`);
  }
  return res.json();
}

export async function deleteTrackedIssue(id: number): Promise<void> {
  const res = await authFetch(`/api/track-issues/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error || `Request failed (${res.status})`);
  }
}

export async function syncTrackedIssue(id: number): Promise<Partial<TrackedIssue>> {
  const res = await authFetch(`/api/track-issues/${id}/sync`, { method: "POST" });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error || `Request failed (${res.status})`);
  }
  return res.json();
}

export async function updateTrackedIssue(
  id: number,
  payload: { notes?: string; priority?: string },
): Promise<TrackedIssue> {
  const res = await authFetch(`/api/track-issues/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error || `Request failed (${res.status})`);
  }
  return res.json();
}
