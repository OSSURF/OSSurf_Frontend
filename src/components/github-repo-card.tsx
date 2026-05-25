import { useState } from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowUpRight,
  Star,
  GitFork,
  WarningCircle,
  BookOpen,
} from "@phosphor-icons/react";

export interface RepoData {
  owner: string;
  repo_name: string;
  description?: string | null;
  language?: string | null;
  stargazers_count: number;
  forks_count: number;
  open_issue_count?: number | null;
  watchers_count?: number | null;
  stars_earned?: number | null;
  tags?: string[];
  avatarUrl?: string | null;
}

const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Python: "#3572A5",
  Rust: "#dea584",
  Go: "#00ADD8",
  Java: "#b07219",
  "C++": "#f34b7d",
  C: "#555555",
  Ruby: "#701516",
  PHP: "#4F5D95",
  Swift: "#F05138",
  Kotlin: "#A97BFF",
  Dart: "#00B4AB",
  Vue: "#41b883",
  CSS: "#563d7c",
  HTML: "#e34c26",
  Shell: "#89e051",
  Scala: "#c22d40",
  Elixir: "#6e4a7e",
  Haskell: "#5e5086",
  Lua: "#000080",
  R: "#198CE7",
  Julia: "#a270ba",
  Clojure: "#db5855",
  Zig: "#ec915c",
};

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

export function GitHubRepoCard({
  repo,
  className,
  period = "daily",
  ...props
}: { repo: RepoData; period?: string } & React.HTMLAttributes<HTMLAnchorElement>) {
  const [avatarError, setAvatarError] = useState(false);

  if (!repo) return null;

  const languageColor = repo.language
    ? LANGUAGE_COLORS[repo.language] || "#8b8b8b"
    : null;

  const name = repo.repo_name;
  const tags = repo.tags || [];
  const hasTags = tags.length > 0;

  const avatarUrl = repo.avatarUrl || `https://github.com/${repo.owner}.png`;

  return (
    <a
      data-slot="github-repo-card"
      href={`https://github.com/${repo.owner}/${name}`}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "group flex h-full min-w-70 flex-col gap-3 p-4 border border-border/60 rounded-none bg-card max-w-full font-geist",
        "transition-colors hover:border-foreground/20 hover:bg-accent/30",
        className,
      )}
      {...props}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-none border border-border/60 bg-background text-xs font-semibold text-muted-foreground">
            {avatarUrl && !avatarError ? (
              <img
                src={avatarUrl}
                alt={`${repo.owner} avatar`}
                className="size-12 rounded-none object-cover"
                loading="lazy"
                onError={() => setAvatarError(true)}
              />
            ) : (
              <BookOpen className="size-6" weight="fill" />
            )}
          </div>
          <div className="flex flex-col justify-center">
            <span className="block text-sm font-bold tracking-tight text-foreground line-clamp-1">
              {repo.owner}/{name}
            </span>
            <p className="text-xs leading-tight text-muted-foreground line-clamp-2">
              {repo.description || "No description provided."}
            </p>
          </div>
        </div>
        <ArrowUpRight
          className="mt-1 size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          weight="bold"
        />
      </div>

      <div
        className={cn(
          "relative h-4 sm:h-5",
          hasTags &&
            "after:pointer-events-none after:absolute after:top-0 after:right-0 after:h-full after:w-8 after:bg-linear-to-l after:from-background after:to-transparent",
        )}
      >
        <div className="flex h-4 sm:h-5 w-full flex-nowrap items-center gap-1 sm:gap-2 overflow-hidden whitespace-nowrap">
          {hasTags ? (
            tags.map((tag) => (
              <span
                key={tag}
                className="flex h-4 sm:h-5 items-center rounded-none border border-border/60 bg-white px-1.5 sm:px-2 text-[10px] sm:text-[11px] text-black dark:bg-black dark:text-white"
              >
                {tag}
              </span>
            ))
          ) : (
            <span className="flex h-4 sm:h-5 items-center px-1.5 sm:px-2 text-[10px] sm:text-[11px] opacity-0">
              placeholder
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs text-muted-foreground mt-auto pt-2">
        {languageColor && (
          <span className="flex items-center gap-1.5">
            <span
              className="size-3 rounded-full"
              style={{ backgroundColor: languageColor }}
            />
            {repo.language}
          </span>
        )}

        <span className="flex items-center gap-1" title="Total Stars">
          <Star className="size-4" weight="fill" />
          {formatNumber(repo.stargazers_count)}
        </span>

        <span className="flex items-center gap-1" title="Forks">
          <GitFork className="size-4" weight="fill" />
          {formatNumber(repo.forks_count)}
        </span>

        {repo.open_issue_count !== undefined &&
          repo.open_issue_count !== null &&
          repo.open_issue_count > 0 && (
            <span className="flex items-center gap-1" title="Open Issues">
              <WarningCircle className="size-4" weight="fill" />
              {formatNumber(repo.open_issue_count)}
            </span>
          )}

        {repo.stars_earned !== undefined && repo.stars_earned !== null && (
          <span
            className="flex items-center gap-1 text-muted-foreground ml-auto"
            title={`Stars earned ${
              period === "weekly"
                ? "this week"
                : period === "monthly"
                  ? "this month"
                  : "today"
            }`}
          >
            <Star className="size-4" weight="fill" />
            {formatNumber(repo.stars_earned)} stars{" "}
            {period === "weekly"
              ? "this week"
              : period === "monthly"
                ? "this month"
                : "today"}
          </span>
        )}
      </div>
    </a>
  );
}

export function GitHubRepoCardSkeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="github-repo-card-skeleton"
      className={cn(
        "flex h-full min-w-70 flex-col gap-3 p-4 border border-border/60 rounded-none bg-card max-w-full font-geist",
        className,
      )}
      {...props}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <Skeleton className="size-12 rounded-none border border-border/60" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-40 rounded-none" />
            <Skeleton className="h-3 w-56 rounded-none" />
            <Skeleton className="h-3 w-44 rounded-none" />
          </div>
        </div>
        <Skeleton className="size-5 rounded-none" />
      </div>

      <div className="flex h-5 w-full items-center gap-2">
        <Skeleton className="h-5 w-16 rounded-none" />
        <Skeleton className="h-5 w-20 rounded-none" />
        <Skeleton className="h-5 w-14 rounded-none" />
      </div>

      <div className="flex items-center gap-4 text-xs mt-auto pt-2">
        <Skeleton className="h-3 w-20 rounded-none" />
        <Skeleton className="h-3 w-12 rounded-none" />
        <Skeleton className="h-3 w-12 rounded-none" />
        <Skeleton className="ml-auto h-3 w-28 rounded-none" />
      </div>
    </div>
  );
}
