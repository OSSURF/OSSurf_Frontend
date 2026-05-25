import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  GitHubIssueCard,
  type IssueData,
} from "@/components/github-issue-card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { findIssues, type Issue, type Label } from "@/api/issues";

const LANGUAGE_OPTIONS = [
  { value: "all", label: "All Languages" },
  { value: "typescript", label: "TypeScript" },
  { value: "javascript", label: "JavaScript" },
  { value: "python", label: "Python" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
  { value: "java", label: "Java" },
  { value: "c++", label: "C++" },
  { value: "c", label: "C" },
];

const MAX_ISSUE_PAGES = 10;

function parseRequestedLabels(labels: string): string[] {
  return labels
    .split(",")
    .flatMap((label) => {
      const trimmed = label.trim().toLowerCase();
      return trimmed ? [trimmed] : [];
    });
}

function toCardIssue(
  issue: Issue,
  requestedLabels: string[],
): IssueData {
  const sortedLabels = [...issue.labels].sort((left: Label, right: Label) => {
    const leftRequested = requestedLabels.includes(left.name.toLowerCase());
    const rightRequested = requestedLabels.includes(right.name.toLowerCase());

    if (leftRequested === rightRequested) return 0;
    return leftRequested ? -1 : 1;
  });

  return {
    number: issue.number,
    title: issue.title,
    state: issue.state,
    html_url: issue.html_url,
    user: {
      login: issue.user.login,
      avatar_url: issue.user.avatar_url ?? "",
      html_url: issue.user.html_url,
    },
    labels: sortedLabels.map((label) => ({
      name: label.name,
      color: label.color,
      description: label.description ?? undefined,
    })),
    comments: issue.comments,
    created_at: issue.created_at,
    updated_at: issue.updated_at,
    body: issue.body ?? undefined,
    repository_url: issue.repository_url,
  };
}

export default function IssuesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const language = searchParams.get("language") || "all";
  const labels = searchParams.get("labels") || "";
  const search = searchParams.get("search")?.toLowerCase().trim() || "";
  const page = Math.min(
    MAX_ISSUE_PAGES,
    Math.max(1, Number(searchParams.get("page") || 1)),
  );

  const [issues, setIssues] = useState<IssueData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [total, setTotal] = useState(0);
  const [perPage, setPerPage] = useState(24);
  const [labelsInput, setLabelsInput] = useState(labels);
  const [prevLabels, setPrevLabels] = useState(labels);

  if (labels !== prevLabels) {
    setLabelsInput(labels);
    setPrevLabels(labels);
  }

  useEffect(() => {
    async function fetchIssues() {
      setLoading(true);
      setError("");

      try {
        const requestedLabels = parseRequestedLabels(labels);
        const data = await findIssues({
          page,
          perPage,
          language,
          labels,
        });

        setIssues(
          data.issues.map((issue) =>
            toCardIssue(issue, requestedLabels),
          ),
        );
        setTotal(data.total);
        setPerPage(data.perPage);
      } catch (fetchError) {
        console.error("Failed to fetch issues:", fetchError);
        setIssues([]);
        setTotal(0);
        setError(
          fetchError instanceof Error
            ? fetchError.message
            : "Failed to fetch issues.",
        );
      } finally {
        setLoading(false);
      }
    }

    fetchIssues();
  }, [language, labels, page, perPage]);

  const filteredIssues = useMemo(() => {
    if (!search) return issues;

    return issues.filter((issue) => {
      const repo = issue.repository_url?.toLowerCase() || "";
      const title = issue.title.toLowerCase();
      const body = issue.body?.toLowerCase() || "";
      const author = issue.user.login.toLowerCase();
      const issueLabels = issue.labels.some((label) =>
        label.name.toLowerCase().includes(search),
      );

      return (
        title.includes(search) ||
        body.includes(search) ||
        author.includes(search) ||
        repo.includes(search) ||
        issueLabels
      );
    });
  }, [issues, search]);

  const totalPages = Math.min(
    MAX_ISSUE_PAGES,
    Math.max(1, Math.ceil(total / perPage)),
  );

  const updateParams = (updates: Record<string, string | null>) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);

      Object.entries(updates).forEach(([key, value]) => {
        if (!value || value === "") {
          next.delete(key);
        } else {
          next.set(key, value);
        }
      });

      return next;
    });
  };

  const applyLabels = () => {
    updateParams({
      labels: labelsInput.trim() || null,
      page: "1",
    });
  };

  return (
    <div className="flex-1 overflow-y-auto w-full bg-background font-geist">
      <section className="px-6 md:px-10 py-8 max-w-[1600px] mx-auto">
        <div className="space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="space-y-2">
              <h1 className="text-3xl tracking-tight font-serif-instrument">
                Find Issues
              </h1>
              <p className="text-muted-foreground">
                Discover recent issues from popular repositories.
              </p>
            </div>

            <div className="flex w-full flex-wrap gap-3 justify-start md:justify-end">
              <Select
                value={language}
                onValueChange={(value) =>
                  updateParams({
                    language: value === "all" ? null : value,
                    page: "1",
                  })
                }
              >
                <SelectTrigger className="w-[180px] rounded-none">
                  <SelectValue placeholder="Language" />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex items-center border border-border bg-background h-9">
                <input
                  value={labelsInput}
                  onChange={(event) => setLabelsInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      applyLabels();
                    }
                  }}
                  placeholder="Labels (good first issue, bug)"
                  className="h-full w-[260px] px-3 text-sm bg-transparent outline-none"
                />
                <Button
                  variant="outline"
                  className="h-9 rounded-none border-y-0 border-r-0"
                  onClick={applyLabels}
                >
                  Apply
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading ? (
              Array.from({ length: 9 }).map((_, index) => (
                <div
                  key={index}
                  className="h-[220px] w-full animate-pulse border bg-muted/20"
                />
              ))
            ) : error ? (
              <div className="col-span-full py-20 text-center text-destructive">
                <p>{error}</p>
              </div>
            ) : filteredIssues.length === 0 ? (
              <div className="col-span-full py-20 text-center text-muted-foreground">
                <p>No issues found matching your criteria.</p>
              </div>
            ) : (
              filteredIssues.map((issue) => (
                <GitHubIssueCard
                  key={`${issue.html_url}-${issue.number}`}
                  issue={issue}
                />
              ))
            )}
          </div>

          <div className="flex items-center justify-between border-t border-border/60 pt-4">
            <button
              type="button"
              onClick={() =>
                updateParams({ page: String(Math.max(1, page - 1)) })
              }
              className="h-9 px-3 border border-border bg-card text-sm text-foreground disabled:opacity-50"
              disabled={page <= 1 || loading}
            >
              Previous
            </button>

            <span className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </span>

            <button
              type="button"
              onClick={() =>
                updateParams({ page: String(Math.min(totalPages, page + 1)) })
              }
              className="h-9 px-3 border border-border bg-card text-sm text-foreground disabled:opacity-50"
              disabled={page >= totalPages || loading}
            >
              Next
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
