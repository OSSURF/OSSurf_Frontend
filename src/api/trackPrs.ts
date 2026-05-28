import { authFetch } from "./config";

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

export async function fetchTrackedPRs(): Promise<TrackedPR[]> {
  const res = await authFetch(`/api/track-prs/`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error || `Request failed (${res.status})`);
  }
  return res.json();
}

export async function addTrackedPR(payload: {
  url: string;
  notes: string;
  priority: string;
}): Promise<TrackedPR> {
  const res = await authFetch(`/api/track-prs/`, {
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

export async function deleteTrackedPR(id: number): Promise<void> {
  const res = await authFetch(`/api/track-prs/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error || `Request failed (${res.status})`);
  }
}

export async function syncTrackedPR(id: number): Promise<Partial<TrackedPR>> {
  const res = await authFetch(`/api/track-prs/${id}/sync`, { method: "POST" });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error || `Request failed (${res.status})`);
  }
  return res.json();
}

export async function updateTrackedPR(
  id: number,
  payload: { notes?: string; priority?: string },
): Promise<TrackedPR> {
  const res = await authFetch(`/api/track-prs/${id}`, {
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
