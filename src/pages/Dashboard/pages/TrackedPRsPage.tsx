import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  GitPullRequestDraft,
  GitMerge,
  GitPullRequestClosed,
  Plus,
  Search,
  RefreshCw,
  Trash2,
  Pencil,
  ExternalLink,
  FileDiff,
} from "lucide-react";
import GitPullRequestIcon from "@/components/ui/svgs/git-pull-request-stroke-rounded";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

// ─── Types ────────────────────────────────────────

interface TrackedPR {
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

type PrState = "all" | "open" | "closed" | "merged";
type PrPriority = "all" | "critical" | "high" | "medium" | "low" | "none";

const STATE_OPTIONS: { value: PrState; label: string }[] = [
  { value: "all", label: "All States" },
  { value: "open", label: "Open" },
  { value: "closed", label: "Closed" },
  { value: "merged", label: "Merged" },
];

const PRIORITY_OPTIONS: { value: PrPriority; label: string }[] = [
  { value: "all", label: "All Priorities" },
  { value: "critical", label: "Critical" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
  { value: "none", label: "None" },
];

const PRIORITY_SELECT_OPTIONS = PRIORITY_OPTIONS.filter(
  (o) => o.value !== "all",
);

// ─── Helpers ──────────────────────────────────────

function formatSyncDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function stateColor(
  state: string,
): "default" | "secondary" | "destructive" | "outline" {
  switch (state) {
    case "open":
      return "default";
    case "merged":
      return "secondary";
    case "closed":
      return "destructive";
    default:
      return "outline";
  }
}

function priorityColor(priority: string | null | undefined): string {
  switch (priority) {
    case "critical":
      return "bg-red-500/15 text-red-500 border-red-500/30";
    case "high":
      return "bg-orange-500/15 text-orange-500 border-orange-500/30";
    case "medium":
      return "bg-yellow-500/15 text-yellow-500 border-yellow-500/30";
    case "low":
      return "bg-blue-500/15 text-blue-500 border-blue-500/30";
    default:
      return "";
  }
}

function StateIcon({ state }: { state: string }) {
  switch (state) {
    case "open":
      return <GitPullRequestDraft className="h-4 w-4 mt-0.5 text-green-500 shrink-0" />;
    case "merged":
      return <GitMerge className="h-4 w-4 mt-0.5 text-purple-500 shrink-0" />;
    case "closed":
      return <GitPullRequestClosed className="h-4 w-4 mt-0.5 text-red-500 shrink-0" />;
    default:
      return <GitPullRequestDraft className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />;
  }
}

// ─── API ──────────────────────────────────────────

const API_BASE = "/api/track-prs";

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

async function fetchTrackedPRs(): Promise<TrackedPR[]> {
  return apiFetch<TrackedPR[]>("/");
}

async function addTrackedPR(payload: {
  url: string;
  notes: string;
  priority: string;
}): Promise<TrackedPR> {
  return apiFetch<TrackedPR>("/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

async function deleteTrackedPR(id: number): Promise<void> {
  await apiFetch(`/${id}`, { method: "DELETE" });
}

async function syncTrackedPR(id: number): Promise<Partial<TrackedPR>> {
  return apiFetch<Partial<TrackedPR>>(`/${id}/sync`, { method: "POST" });
}

async function updateTrackedPR(
  id: number,
  payload: { notes?: string; priority?: string },
): Promise<TrackedPR> {
  return apiFetch<TrackedPR>(`/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

// ─── Component ────────────────────────────────────

export default function TrackedPRsPage() {
  const [prs, setPrs] = useState<TrackedPR[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [stateFilter, setStateFilter] = useState<PrState>("all");
  const [priorityFilter, setPriorityFilter] = useState<PrPriority>("all");

  // Add PR dialog
  const [addOpen, setAddOpen] = useState(false);
  const [addUrl, setAddUrl] = useState("");
  const [addName, setAddName] = useState("");
  const [addPriority, setAddPriority] = useState("none");
  const [addNotes, setAddNotes] = useState("");
  const [addLoading, setAddLoading] = useState(false);

  // Edit PR dialog
  const [editOpen, setEditOpen] = useState(false);
  const [editPr, setEditPr] = useState<TrackedPR | null>(null);
  const [editNotes, setEditNotes] = useState("");
  const [editPriority, setEditPriority] = useState("none");
  const [editLoading, setEditLoading] = useState(false);

  // Syncing state per PR
  const [syncingIds, setSyncingIds] = useState<Set<number>>(new Set());

  const loadPRs = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchTrackedPRs();
      setPrs(data);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to load tracked PRs",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPRs();
  }, [loadPRs]);

  // ── Filters ─────────────────────────────────

  const filteredPRs = useMemo(() => {
    let result = prs;

    if (stateFilter !== "all") {
      result = result.filter((pr) => pr.state === stateFilter);
    }

    if (priorityFilter !== "all") {
      result = result.filter(
        (pr) => (pr.priority || "none") === priorityFilter,
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (pr) =>
          pr.title.toLowerCase().includes(q) ||
          `${pr.repo_owner}/${pr.repo_name}`.toLowerCase().includes(q) ||
          pr.author.toLowerCase().includes(q) ||
          String(pr.number).includes(q),
      );
    }

    return result;
  }, [prs, stateFilter, priorityFilter, searchQuery]);

  const openCount = prs.filter((pr) => pr.state === "open").length;

  // ── Handlers ────────────────────────────────

  async function handleAdd() {
    if (!addUrl.trim()) {
      toast.error("Please enter a GitHub PR URL");
      return;
    }

    setAddLoading(true);
    try {
      const newPr = await addTrackedPR({
        url: addUrl.trim(),
        notes: addNotes.trim(),
        priority: addPriority,
      });
      setPrs((prev) => [newPr, ...prev]);
      setAddOpen(false);
      setAddUrl("");
      setAddName("");
      setAddPriority("none");
      setAddNotes("");
      toast.success("PR added successfully");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add PR");
    } finally {
      setAddLoading(false);
    }
  }

  async function handleDelete(id: number) {
    try {
      await deleteTrackedPR(id);
      setPrs((prev) => prev.filter((pr) => pr.id !== id));
      toast.success("PR removed");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete PR");
    }
  }

  async function handleSync(id: number) {
    setSyncingIds((prev) => new Set(prev).add(id));
    try {
      const updated = await syncTrackedPR(id);
      setPrs((prev) =>
        prev.map((pr) =>
          pr.id === id
            ? {
                ...pr,
                ...updated,
                last_synced_at:
                  (updated.last_synced_at as string) ??
                  new Date().toISOString(),
              }
            : pr,
        ),
      );
      toast.success("PR synced");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to sync PR");
    } finally {
      setSyncingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }

  function openEdit(pr: TrackedPR) {
    setEditPr(pr);
    setEditNotes(pr.note || "");
    setEditPriority(pr.priority || "none");
    setEditOpen(true);
  }

  async function handleEdit() {
    if (!editPr) return;
    setEditLoading(true);
    try {
      const updated = await updateTrackedPR(editPr.id, {
        notes: editNotes,
        priority: editPriority,
      });
      setPrs((prev) => prev.map((pr) => (pr.id === editPr.id ? updated : pr)));
      setEditOpen(false);
      toast.success("PR updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update PR");
    } finally {
      setEditLoading(false);
    }
  }

  // ── Render ──────────────────────────────────

  return (
    <div className="flex-1 overflow-y-auto w-full bg-background font-geist">
      <section className="px-6 md:px-10 py-8 max-w-[1600px] mx-auto">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <GitPullRequestIcon className="h-8 w-8 text-foreground" />
              <div>
                <h1 className="text-3xl tracking-tight font-serif-instrument">
                  Pull Requests
                </h1>
                <p className="text-sm text-muted-foreground">
                  {prs.length} tracked • {openCount} open
                </p>
              </div>
            </div>
            <Button
              onClick={() => setAddOpen(true)}
              className="rounded-none bg-green-600 hover:bg-green-700 text-white gap-2"
            >
              <Plus className="h-4 w-4" />
              Add PR
            </Button>
          </div>

          {/* Filters */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search PRs..."
                className="pl-9 rounded-none"
              />
            </div>
            <Select
              value={stateFilter}
              onValueChange={(v) => setStateFilter(v as PrState)}
            >
              <SelectTrigger className="w-[150px] rounded-none">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={priorityFilter}
              onValueChange={(v) => setPriorityFilter(v as PrPriority)}
            >
              <SelectTrigger className="w-[150px] rounded-none">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRIORITY_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* PR List */}
          <div className="flex flex-col pt-2">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-[90px] animate-pulse bg-muted/20" />
              ))
            ) : filteredPRs.length === 0 ? (
              <div className="py-20 text-center text-[14px] text-muted-foreground">
                {prs.length === 0
                  ? "No tracked PRs yet. Add one to get started."
                  : "No PRs match your filters."}
              </div>
            ) : (
              filteredPRs.map((pr) => (
                <PRCard
                  key={pr.id}
                  pr={pr}
                  syncing={syncingIds.has(pr.id)}
                  onSync={() => handleSync(pr.id)}
                  onEdit={() => openEdit(pr)}
                  onDelete={() => handleDelete(pr.id)}
                />
              ))
            )}
          </div>
        </div>
      </section>

      {/* Add PR Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-none">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GitPullRequestIcon className="h-5 w-5" />
              Add Pull Request
            </DialogTitle>
            <DialogDescription className="sr-only">
              Track a new GitHub Pull Request
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>
                GitHub PR URL <span className="text-destructive">*</span>
              </Label>
              <Input
                value={addUrl}
                onChange={(e) => setAddUrl(e.target.value)}
                placeholder="https://github.com/owner/repo/pull/123"
                className="rounded-none"
              />
            </div>
            <div className="space-y-2">
              <Label>Custom Name (optional)</Label>
              <Input
                value={addName}
                onChange={(e) => setAddName(e.target.value)}
                placeholder="My feature PR"
                className="rounded-none"
              />
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={addPriority} onValueChange={setAddPriority}>
                <SelectTrigger className="rounded-none w-full">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITY_SELECT_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={addNotes}
                onChange={(e) => setAddNotes(e.target.value)}
                placeholder="Add any notes about this PR..."
                className="rounded-none min-h-[100px]"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="ghost"
                onClick={() => setAddOpen(false)}
                className="rounded-none"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAdd}
                disabled={addLoading || !addUrl.trim()}
                className="rounded-none bg-green-600 hover:bg-green-700 text-white"
              >
                {addLoading ? "Adding..." : "Add PR"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit PR Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-none">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="h-4 w-4" />
              Edit PR
            </DialogTitle>
            <DialogDescription className="sr-only">
              Edit tracked Pull Request details
            </DialogDescription>
          </DialogHeader>
          {editPr && (
            <div className="space-y-4 pt-2">
              <p className="text-sm text-muted-foreground">
                {editPr.repo_owner}/{editPr.repo_name} #{editPr.number}
              </p>
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={editPriority} onValueChange={setEditPriority}>
                  <SelectTrigger className="rounded-none w-full">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITY_SELECT_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Add any notes about this PR..."
                  className="rounded-none min-h-[100px]"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button
                  variant="ghost"
                  onClick={() => setEditOpen(false)}
                  className="rounded-none"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleEdit}
                  disabled={editLoading}
                  className="rounded-none bg-green-600 hover:bg-green-700 text-white"
                >
                  {editLoading ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── PR Card ──────────────────────────────────────

function PRCard({
  pr,
  syncing,
  onSync,
  onEdit,
  onDelete,
}: {
  pr: TrackedPR;
  syncing: boolean;
  onSync: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const additions = pr.additions ?? 0;
  const deletions = pr.deletions ?? 0;
  const changedFiles = pr.changed_files ?? 0;

  return (
    <div className="flex items-start gap-4 py-4 px-2 hover:bg-muted/30 transition-colors w-full rounded-none group relative">
      <StateIcon state={pr.state} />

      <div className="flex flex-col flex-1 min-w-0 pr-16 space-y-2">
        <div className="flex flex-col">
          <a
            href={pr.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-[14px] text-foreground leading-tight hover:underline inline-flex items-center gap-1.5"
          >
            {pr.title}
          </a>
          <div className="flex items-center flex-wrap gap-1.5 mt-1.5 text-[12px] text-muted-foreground">
            <span className="truncate">{pr.repo_owner}/{pr.repo_name} #{pr.number}</span>
            <span>·</span>
            <img
              src={`https://github.com/${pr.author}.png?size=24`}
              alt={pr.author}
              className="w-4 h-4 rounded-full shrink-0"
            />
            <span className="truncate">{pr.author}</span>
          </div>
        </div>

        {/* Badges + stats */}
        <div className="flex flex-wrap items-center gap-2 text-[11px]">
          <Badge variant={stateColor(pr.state)} className="text-[10px] px-1.5 py-0 rounded-sm capitalize h-5 font-normal leading-none">
            {pr.state}
          </Badge>

          {pr.priority && pr.priority !== "none" && (
            <Badge
              variant="outline"
              className={`text-[10px] px-1.5 py-0 rounded-sm capitalize h-5 font-normal leading-none bg-transparent ${priorityColor(pr.priority)}`}
            >
              {pr.priority}
            </Badge>
          )}

          {(additions > 0 || deletions > 0) && (
            <span className="flex items-center gap-1 font-mono tracking-tight text-muted-foreground">
              <span className="text-green-500">+{additions}</span>
              <span className="text-red-500">-{deletions}</span>
            </span>
          )}

          {changedFiles > 0 && (
            <span className="flex items-center gap-1 text-muted-foreground font-mono bg-muted/40 px-1 rounded-sm">
              <FileDiff className="h-2.5 w-2.5" />
              {changedFiles} {changedFiles === 1 ? "file" : "files"}
            </span>
          )}
          <span>·</span>
          <span className="text-muted-foreground/60 mb-[1px]">
            Synced {formatSyncDate(pr.last_synced_at)}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0 absolute right-4 top-3.5">
        <button className="p-1.5 text-muted-foreground hover:text-foreground transition-colors rounded-none" onClick={onSync} disabled={syncing} title="Sync PR">
          <RefreshCw className={`h-3.5 w-3.5 ${syncing ? "animate-spin" : ""}`} />
        </button>
        <button className="p-1.5 text-muted-foreground hover:text-foreground transition-colors rounded-none" onClick={onEdit} title="Edit PR">
          <Pencil className="h-3.5 w-3.5" />
        </button>
        <button className="p-1.5 text-muted-foreground hover:text-destructive transition-colors rounded-none" onClick={onDelete} title="Delete PR">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
