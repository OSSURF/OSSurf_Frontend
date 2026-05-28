import { apiPath } from "./config";

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
  const res = await fetch(apiPath(`/api/track-issues`), { credentials: "include" });
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
  const res = await fetch(apiPath(`/api/track-issues`), {
    method: "POST",
    credentials: "include",
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
  const res = await fetch(apiPath(`/api/track-issues/${id}`), {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error || `Request failed (${res.status})`);
  }
}

export async function syncTrackedIssue(id: number): Promise<Partial<TrackedIssue>> {
  const res = await fetch(apiPath(`/api/track-issues/${id}/sync`), {
    method: "POST",
    credentials: "include",
  });
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
  const res = await fetch(apiPath(`/api/track-issues/${id}`), {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error || `Request failed (${res.status})`);
  }
  return res.json();
}
