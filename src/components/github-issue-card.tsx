import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  ArrowUpRight,
  Chat,
  Circle,
  XCircle,
  CalendarBlank,
  Tag,
} from "@phosphor-icons/react";

interface User {
  login: string;
  avatar_url: string;
  html_url: string;
}

interface Label {
  name: string;
  color: string;
  description?: string;
}

export interface IssueData {
  number: number;
  title: string;
  state: "open" | "closed";
  html_url: string;
  user: User;
  labels: Label[];
  comments: number;
  created_at: string;
  updated_at: string;
  body?: string;
  assignee?: User | null;
  repository_url?: string;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();

  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${Math.max(1, diffMins)}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 30) return `${diffDays}d ago`;

  return date.toLocaleDateString();
}

function getRepositoryNameFromIssue(issue: IssueData): string {
  const repoSource = issue.repository_url || issue.html_url;
  if (!repoSource) return "Issue";
  const parts = repoSource.split("/");
  if (parts.length < 2) return "Issue";
  return `${parts[parts.length - 2]}/${parts[parts.length - 1]}`;
}

function normalizeHexColor(color: string): string {
  const cleaned = color.trim().replace("#", "");
  if (/^[0-9a-fA-F]{6}$/.test(cleaned)) return `#${cleaned}`;
  if (/^[0-9a-fA-F]{3}$/.test(cleaned)) {
    const expanded = cleaned
      .split("")
      .map((char) => `${char}${char}`)
      .join("");
    return `#${expanded}`;
  }
  return "#6b7280";
}



function getLabelClass(labelName: string): string {
  const normalized = labelName.toLowerCase();

  if (normalized.startsWith("type:")) {
    return "border-red-400/30 bg-red-500/12 text-red-300";
  }

  if (normalized.startsWith("topic:")) {
    return "border-slate-400/35 bg-slate-500/12 text-slate-200";
  }

  if (normalized.startsWith("mod:")) {
    return "border-cyan-400/30 bg-cyan-500/12 text-cyan-200";
  }

  if (normalized.startsWith("status:")) {
    return "border-amber-500/30 bg-amber-500/10 text-amber-400";
  }

  return "border-border/80 bg-muted/35 text-muted-foreground";
}

export function GitHubIssueCard({
  issue,
  className,
  ...props
}: { issue: IssueData } & React.HTMLAttributes<HTMLAnchorElement>) {
  const [avatarError, setAvatarError] = useState(false);

  if (!issue) return null;

  const isOpen = issue.state === "open";
  const hasLabels = issue.labels.length > 0;
  const repoName = getRepositoryNameFromIssue(issue);

  const truncatedBody = issue.body
    ? issue.body.split("\n")[0].substring(0, 80)
    : "No description provided.";

  return (
    <a
      data-slot="github-issue-card"
      href={issue.html_url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "group flex h-full flex-col gap-3 p-4 border border-border/60 rounded-none bg-card max-w-full font-geist",
        "transition-colors hover:border-foreground/20 hover:bg-accent/30",
        className,
      )}
      {...props}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border/60 bg-background mt-1">
            {issue.user.avatar_url && !avatarError ? (
              <img
                src={issue.user.avatar_url}
                alt={`${issue.user.login} avatar`}
                className="h-10 w-10 rounded-full object-cover"
                loading="lazy"
                onError={() => setAvatarError(true)}
              />
            ) : (
              <Circle className="h-5 w-5" weight="fill" />
            )}
          </div>
          <div className="flex flex-col justify-start flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground">
                {repoName}
              </span>
              <span className="text-xs text-muted-foreground">
                #{issue.number}
              </span>
            </div>
            <h3 className="block text-sm font-bold tracking-tight text-foreground line-clamp-2">
              {issue.title}
            </h3>
            <p className="text-xs leading-tight text-muted-foreground line-clamp-2 mt-1">
              {truncatedBody}
            </p>
          </div>
        </div>
        <ArrowUpRight
          className="mt-1 h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          weight="bold"
        />
      </div>

      {hasLabels && (
        <div className="flex flex-wrap items-center gap-2">
          {issue.labels.slice(0, 6).map((label) => (
            <span
              key={label.name}
              className={cn(
                "inline-flex h-7 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-semibold",
                getLabelClass(label.name),
              )}
              title={label.description || label.name}
            >
              <Tag className="h-3.5 w-3.5" weight="regular" />
              {label.name}
            </span>
          ))}
          {issue.labels.length > 6 && (
            <span className="inline-flex h-7 items-center rounded-md border border-border/60 px-2.5 text-xs font-medium text-muted-foreground">
              +{issue.labels.length - 6}
            </span>
          )}
        </div>
      )}

      <div className="flex items-center gap-4 text-xs text-muted-foreground mt-auto pt-2">
        <span
          className="flex items-center gap-1"
          title={isOpen ? "Open" : "Closed"}
        >
          {isOpen ? (
            <Circle className="w-4 h-4 text-green-500" weight="fill" />
          ) : (
            <XCircle className="w-4 h-4 text-red-500" weight="fill" />
          )}
          {isOpen ? "Open" : "Closed"}
        </span>

        {issue.comments > 0 && (
          <span className="flex items-center gap-1" title="Comments">
            <Chat className="w-4 h-4" weight="fill" />
            {issue.comments}
          </span>
        )}

        <span
          className="flex items-center gap-1 text-muted-foreground ml-auto"
          title="Created"
        >
          <CalendarBlank className="w-4 h-4" weight="fill" />
          {formatDate(issue.created_at)}
        </span>
      </div>
    </a>
  );
}
