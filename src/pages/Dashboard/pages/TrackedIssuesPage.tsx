import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  CircleDot,
  CircleCheck,
  Plus,
  Search,
  RefreshCw,
  Trash2,
  Pencil,
  ExternalLink,
} from "lucide-react";
import AlertCircleStrokeRounded from "@/components/ui/svgs/AlertCircleStrokeRounded";
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

interface TrackedIssue {
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

type IssueState = "all" | "open" | "closed";
type IssuePriority = "all" | "critical" | "high" | "medium" | "low" | "none";

const STATE_OPTIONS: { value: IssueState; label: string }[] = [
  { value: "all", label: "All States" },
  { value: "open", label: "Open" },
  { value: "closed", label: "Closed" },
];

const PRIORITY_OPTIONS: { value: IssuePriority; label: string }[] = [
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
    case "closed":
      return "secondary";
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
      return <CircleDot className="h-4 w-4 text-green-500" />;
    case "closed":
      return <CircleCheck className="h-4 w-4 text-purple-500" />;
    default:
      return <CircleDot className="h-4 w-4 text-muted-foreground" />;
  }
}

// ─── API ──────────────────────────────────────────

const API_BASE = "/api/track-issues";

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

async function fetchTrackedIssues(): Promise<TrackedIssue[]> {
  return apiFetch<TrackedIssue[]>("/");
}

async function addTrackedIssue(payload: {
  url: string;
  notes: string;
  priority: string;
}): Promise<TrackedIssue> {
  return apiFetch<TrackedIssue>("/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

async function deleteTrackedIssue(id: number): Promise<void> {
  await apiFetch(`/${id}`, { method: "DELETE" });
}

async function syncTrackedIssue(id: number): Promise<Partial<TrackedIssue>> {
  return apiFetch<Partial<TrackedIssue>>(`/${id}/sync`, { method: "POST" });
}

async function updateTrackedIssue(
  id: number,
  payload: { notes?: string; priority?: string },
): Promise<TrackedIssue> {
  return apiFetch<TrackedIssue>(`/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

// ─── Component ────────────────────────────────────

export default function TrackedIssuesPage() {
  const [issues, setIssues] = useState<TrackedIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [stateFilter, setStateFilter] = useState<IssueState>("all");
  const [priorityFilter, setPriorityFilter] = useState<IssuePriority>("all");

  // Add Issue dialog
  const [addOpen, setAddOpen] = useState(false);
  const [addUrl, setAddUrl] = useState("");
  const [addName, setAddName] = useState("");
  const [addPriority, setAddPriority] = useState("none");
  const [addNotes, setAddNotes] = useState("");
  const [addLoading, setAddLoading] = useState(false);

  // Edit Issue dialog
  const [editOpen, setEditOpen] = useState(false);
  const [editIssue, setEditIssue] = useState<TrackedIssue | null>(null);
  const [editNotes, setEditNotes] = useState("");
  const [editPriority, setEditPriority] = useState("none");
  const [editLoading, setEditLoading] = useState(false);

  // Syncing state per Issue
  const [syncingIds, setSyncingIds] = useState<Set<number>>(new Set());

  const loadIssues = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchTrackedIssues();
      setIssues(data);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to load tracked issues",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadIssues();
  }, [loadIssues]);

  // ── Filters ─────────────────────────────────

  const filteredIssues = useMemo(() => {
    let result = issues;

    if (stateFilter !== "all") {
      result = result.filter((issue) => issue.state === stateFilter);
    }

    if (priorityFilter !== "all") {
      result = result.filter(
        (issue) => (issue.priority || "none") === priorityFilter,
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (issue) =>
          issue.title.toLowerCase().includes(q) ||
          `${issue.repo_owner}/${issue.repo_name}`.toLowerCase().includes(q) ||
          issue.author.toLowerCase().includes(q) ||
          String(issue.number).includes(q),
      );
    }

    return result;
  }, [issues, stateFilter, priorityFilter, searchQuery]);

  const openCount = issues.filter((issue) => issue.state === "open").length;

  // ── Handlers ────────────────────────────────

  async function handleAdd() {
    if (!addUrl.trim()) {
      toast.error("Please enter a GitHub Issue URL");
      return;
    }

    setAddLoading(true);
    try {
      const newIssue = await addTrackedIssue({
        url: addUrl.trim(),
        notes: addNotes.trim(),
        priority: addPriority,
      });
      setIssues((prev) => [newIssue, ...prev]);
      setAddOpen(false);
      setAddUrl("");
      setAddName("");
      setAddPriority("none");
      setAddNotes("");
      toast.success("Issue added successfully");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add issue");
    } finally {
      setAddLoading(false);
    }
  }

  async function handleDelete(id: number) {
    try {
      await deleteTrackedIssue(id);
      setIssues((prev) => prev.filter((issue) => issue.id !== id));
      toast.success("Issue removed");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete issue",
      );
    }
  }

  async function handleSync(id: number) {
    setSyncingIds((prev) => new Set(prev).add(id));
    try {
      const updated = await syncTrackedIssue(id);
      setIssues((prev) =>
        prev.map((issue) =>
          issue.id === id
            ? {
                ...issue,
                ...updated,
                last_synced_at:
                  (updated.last_synced_at as string) ??
                  new Date().toISOString(),
              }
            : issue,
        ),
      );
      toast.success("Issue synced");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to sync issue");
    } finally {
      setSyncingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }

  function openEdit(issue: TrackedIssue) {
    setEditIssue(issue);
    setEditNotes(issue.note || "");
    setEditPriority(issue.priority || "none");
    setEditOpen(true);
  }

  async function handleEdit() {
    if (!editIssue) return;
    setEditLoading(true);
    try {
      const updated = await updateTrackedIssue(editIssue.id, {
        notes: editNotes,
        priority: editPriority,
      });
      setIssues((prev) =>
        prev.map((issue) => (issue.id === editIssue.id ? updated : issue)),
      );
      setEditOpen(false);
      toast.success("Issue updated");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update issue",
      );
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
              <AlertCircleStrokeRounded className="h-8 w-8 text-foreground" />
              <div>
                <h1 className="text-3xl tracking-tight font-serif-instrument">
                  Issues
                </h1>
                <p className="text-sm text-muted-foreground">
                  {issues.length} tracked • {openCount} open
                </p>
              </div>
            </div>
            <Button
              onClick={() => setAddOpen(true)}
              className="rounded-none bg-green-600 hover:bg-green-700 text-white gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Issue
            </Button>
          </div>

          {/* Filters */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Issues..."
                className="pl-9 rounded-none"
              />
            </div>
            <Select
              value={stateFilter}
              onValueChange={(v) => setStateFilter(v as IssueState)}
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
              onValueChange={(v) => setPriorityFilter(v as IssuePriority)}
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

          {/* Issue List */}
          <div className="divide-y divide-border border border-border">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-[110px] animate-pulse bg-muted/20" />
              ))
            ) : filteredIssues.length === 0 ? (
              <div className="py-20 text-center text-muted-foreground">
                {issues.length === 0
                  ? "No tracked issues yet. Add one to get started."
                  : "No issues match your filters."}
              </div>
            ) : (
              filteredIssues.map((issue) => (
                <IssueCard
                  key={issue.id}
                  issue={issue}
                  syncing={syncingIds.has(issue.id)}
                  onSync={() => handleSync(issue.id)}
                  onEdit={() => openEdit(issue)}
                  onDelete={() => handleDelete(issue.id)}
                />
              ))
            )}
          </div>
        </div>
      </section>

      {/* Add Issue Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-none">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircleStrokeRounded className="h-5 w-5" />
              Add Issue
            </DialogTitle>
            <DialogDescription className="sr-only">
              Track a new GitHub Issue
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>
                GitHub Issue URL <span className="text-destructive">*</span>
              </Label>
              <Input
                value={addUrl}
                onChange={(e) => setAddUrl(e.target.value)}
                placeholder="https://github.com/owner/repo/issues/123"
                className="rounded-none"
              />
            </div>
            <div className="space-y-2">
              <Label>Custom Name (optional)</Label>
              <Input
                value={addName}
                onChange={(e) => setAddName(e.target.value)}
                placeholder="My tracked issue"
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
                placeholder="Add any notes about this issue..."
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
                {addLoading ? "Adding..." : "Add Issue"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Issue Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-none">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="h-4 w-4" />
              Edit Issue
            </DialogTitle>
            <DialogDescription className="sr-only">
              Edit tracked Issue details
            </DialogDescription>
          </DialogHeader>
          {editIssue && (
            <div className="space-y-4 pt-2">
              <p className="text-sm text-muted-foreground">
                {editIssue.repo_owner}/{editIssue.repo_name} #{editIssue.number}
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
                  placeholder="Add any notes about this issue..."
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

// ─── Issue Card ───────────────────────────────────

function IssueCard({
  issue,
  syncing,
  onSync,
  onEdit,
  onDelete,
}: {
  issue: TrackedIssue;
  syncing: boolean;
  onSync: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-start gap-4 px-5 py-4 bg-card hover:bg-accent/30 transition-colors">
      {/* Author avatar */}
      <img
        src={`https://github.com/${issue.author}.png?size=80`}
        alt={issue.author}
        className="w-10 h-10 rounded-full border border-border mt-1 shrink-0"
      />

      {/* Main content */}
      <div className="flex-1 min-w-0 space-y-1.5">
        {/* Title row */}
        <div className="flex items-center gap-2">
          <StateIcon state={issue.state} />
          <h3 className="font-semibold text-foreground truncate">
            {issue.title}
          </h3>
          <a
            href={issue.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>

        {/* Repo + author */}
        <p className="text-sm text-muted-foreground">
          {issue.repo_owner}/{issue.repo_name} #{issue.number} • by{" "}
          {issue.author}
        </p>

        {/* Badges */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <Badge
            variant={stateColor(issue.state)}
            className="text-xs capitalize"
          >
            {issue.state}
          </Badge>

          {issue.priority && issue.priority !== "none" && (
            <Badge
              variant="outline"
              className={`text-xs capitalize ${priorityColor(issue.priority)}`}
            >
              {issue.priority}
            </Badge>
          )}
        </div>

        {/* Synced timestamp */}
        <p className="text-xs text-muted-foreground/60">
          Synced {formatSyncDate(issue.last_synced_at)}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onSync}
          disabled={syncing}
          title="Sync Issue"
        >
          <RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onEdit}
          title="Edit Issue"
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onDelete}
          title="Delete Issue"
          className="hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
