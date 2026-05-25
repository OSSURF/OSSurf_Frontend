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

import {
  fetchTrackedIssues,
  addTrackedIssue,
  deleteTrackedIssue,
  syncTrackedIssue,
  updateTrackedIssue,
  type TrackedIssue
} from "@/api/trackIssues";

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
      return <CircleDot className="size-4 mt-0.5 text-green-500 shrink-0" />;
    case "closed":
      return <CircleCheck className="size-4 mt-0.5 text-red-500 shrink-0" />;
    default:
      return <CircleDot className="size-4 mt-0.5 text-muted-foreground shrink-0" />;
  }
}

export default function TrackedIssuesPage() {
  const [issues, setIssues] = useState<TrackedIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [stateFilter, setStateFilter] = useState<IssueState>("all");
  const [priorityFilter, setPriorityFilter] = useState<IssuePriority>("all");

  const [addOpen, setAddOpen] = useState(false);
  const [addUrl, setAddUrl] = useState("");
  const [addName, setAddName] = useState("");
  const [addPriority, setAddPriority] = useState("none");
  const [addNotes, setAddNotes] = useState("");
  const [addLoading, setAddLoading] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [editIssue, setEditIssue] = useState<TrackedIssue | null>(null);
  const [editNotes, setEditNotes] = useState("");
  const [editPriority, setEditPriority] = useState("none");
  const [editLoading, setEditLoading] = useState(false);

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


  return (
    <div className="flex-1 overflow-y-auto w-full bg-background font-geist">
      <section className="px-6 md:px-10 py-8 max-w-[1600px] mx-auto">
        <div className="space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <AlertCircleStrokeRounded className="size-8 text-foreground" />
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
              <Plus className="size-4" />
              Add Issue
            </Button>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
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

          <div className="flex flex-col pt-2">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-[90px] animate-pulse bg-muted/20" />
              ))
            ) : filteredIssues.length === 0 ? (
              <div className="py-20 text-center text-[14px] text-muted-foreground">
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

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-none">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircleStrokeRounded className="size-5" />
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

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-none">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="size-4" />
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
    <div className="flex items-start gap-4 py-4 px-2 hover:bg-muted/30 transition-colors w-full rounded-none group relative">
      <StateIcon state={issue.state} />

      <div className="flex flex-col flex-1 min-w-0 pr-16 space-y-2">
        <div className="flex flex-col">
          <a
            href={issue.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-[14px] text-foreground leading-tight hover:underline inline-flex items-center gap-1.5"
          >
            {issue.title}
          </a>
          <div className="flex items-center flex-wrap gap-1.5 mt-1.5 text-[12px] text-muted-foreground">
            <span className="truncate">{issue.repo_owner}/{issue.repo_name} #{issue.number}</span>
            <span>·</span>
            <img
              src={`https://github.com/${issue.author}.png?size=24`}
              alt={issue.author}
              className="size-4 rounded-full shrink-0"
            />
            <span className="truncate">{issue.author}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-[11px]">
          <Badge
            variant={stateColor(issue.state)}
            className="text-[10px] px-1.5 py-0 rounded-sm capitalize h-5 font-normal leading-none"
          >
            {issue.state}
          </Badge>

          {issue.priority && issue.priority !== "none" && (
            <Badge
              variant="outline"
              className={`text-[10px] px-1.5 py-0 rounded-sm capitalize h-5 font-normal leading-none bg-transparent ${priorityColor(issue.priority)}`}
            >
              {issue.priority}
            </Badge>
          )}

          <span>·</span>
          <span className="text-muted-foreground/60 mb-[1px]">
            Synced {formatSyncDate(issue.last_synced_at)}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0 absolute right-4 top-3.5">
        <Button
          variant="ghost"
          size="icon" className="size-7"
          onClick={onSync}
          disabled={syncing}
          title="Sync Issue"
        >
          <RefreshCw className={`size-3 ${syncing ? "animate-spin" : ""}`} />
        </Button>
        <Button
          variant="ghost"
          size="icon" className="size-7"
          onClick={onEdit}
          title="Edit Issue"
        >
          <Pencil className="size-3" />
        </Button>
        <Button
          variant="ghost"
          size="icon" className="size-7 hover:text-destructive"
          onClick={onDelete}
          title="Delete Issue"
        >
          <Trash2 className="size-3" />
        </Button>
      </div>
    </div>
  );
}
