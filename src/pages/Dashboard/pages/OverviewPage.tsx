import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GitPullRequest, CircleDot, ListChecks, MessageSquare, Plus, AlertCircle } from "lucide-react";
import { Panel, PanelContent } from "../components/panel";
import { AreaChart, Area, CartesianGrid, XAxis, PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";

// ─── Types ────────────────────────────────────────

type MonthlyActivity = {
  month: string;
  prs: number;
  issues: number;
};

type CalendarActivity = {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
};

type ProfileResponse = {
  username: string;
  user: {
    name: string | null;
    login: string;
    avatarUrl: string;
    bio: string | null;
    followers: number;
    following: number;
    htmlUrl: string;
  };
  stats: {
    totalCommits: number;
    totalPrs: number;
    totalIssues: number;
    totalReviews: number;
  };
  graphs: {
    activityHistory: MonthlyActivity[];
    contributionCalendar?: CalendarActivity[];
    contributionTotals?: Record<string, number>;
    languages: Array<{ langName: string; value: number }>;
    prStats: { merged: number; open: number; closed: number };
    radar: { commits: number; prs: number; issues: number; reviews: number };
  };
  recentPrs?: TrackedPR[];
  recentIssues?: TrackedPR[];
};

interface TrackedPR {
  id: number;
  repo_owner: string;
  repo_name: string;
  number: number;
  html_url: string;
  title: string;
  state: string;
  author: string;
}

interface TrackedIssue {
  id: number;
  repo_owner: string;
  repo_name: string;
  number: number;
  html_url: string;
  title: string;
  state: string;
  author: string;
}

interface DashboardResponse {
  stats: {
    user: {
      username: string | null;
      totalPrsCreated: number;
      totalPrsMerged: number;
      totalIssuesCreated: number;
      contributionCalendar: CalendarActivity[];
      contributionTotals: Record<string, number>;
    };
    tracking: {
      activePrs: number;
      activeIssues: number;
      totalTracked: number;
    };
  };
  recentPrs: TrackedPR[];
  recentIssues: TrackedIssue[];
}

const OVERVIEW_CARD_CLASS =
  "px-3 flex flex-col bg-card border border-solid rounded-none shadow-none";

// ─── Helpers ──────────────────────────────────────

function monthLevel(value: number, maxValue: number): 0 | 1 | 2 | 3 | 4 {
  if (value <= 0) return 0;
  const ratio = value / Math.max(maxValue, 1);
  if (ratio <= 0.25) return 1;
  if (ratio <= 0.5) return 2;
  if (ratio <= 0.75) return 3;
  return 4;
}

function buildCalendarData(history: MonthlyActivity[]): CalendarActivity[] {
  if (!history.length) return [];
  const now = new Date();
  const totals = history.map((e) => e.prs + e.issues);
  const maxTotal = Math.max(...totals, 1);
  const data: CalendarActivity[] = [];

  history.forEach((entry, index) => {
    const total = entry.prs + entry.issues;
    const monthDate = new Date(
      now.getFullYear(),
      now.getMonth() - 11 + index,
      1,
    );
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const activeDays = Math.min(total, daysInMonth);
    const perDayCount =
      activeDays > 0 ? Math.max(1, Math.round(total / activeDays)) : 0;
    const level = monthLevel(total, maxTotal);

    for (let day = 1; day <= activeDays; day += 1) {
      const isoDate = new Date(year, month, day).toISOString().slice(0, 10);
      data.push({ date: isoDate, count: perDayCount, level });
    }
  });
  return data;
}

// ─── Component ────────────────────────────────────

export default function OverviewPage() {
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);

      try {
        // Fetch dashboard first (it has the username)
        const dashRes = await fetch("/api/dashboard/", {
          credentials: "include",
        });
        if (!dashRes.ok)
          throw new Error(`Dashboard failed (${dashRes.status})`);
        const dashData = (await dashRes.json()) as DashboardResponse;
        setDashboard(dashData);

        // Fetch profile using the dashboard-provided username
        const username = dashData.stats.user.username;
        if (username) {
          const profileRes = await fetch(
            `/api/profile/${encodeURIComponent(username)}`,
          );
          if (profileRes.ok) {
            const profileData = (await profileRes.json()) as ProfileResponse;
            setProfile(profileData);
          }
        }
      } catch (err) {
        if (err instanceof TypeError) {
          setError("Unable to reach API. Start backend and try again.");
        } else {
          setError(
            err instanceof Error ? err.message : "Failed to load overview",
          );
        }
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const calendarData = useMemo(() => {
    if (dashboard?.stats.user.contributionCalendar?.length) {
      return dashboard.stats.user.contributionCalendar;
    }
    if (profile?.graphs.contributionCalendar?.length) {
      return profile.graphs.contributionCalendar;
    }
    return buildCalendarData(profile?.graphs.activityHistory ?? []);
  }, [dashboard, profile]);

  if (loading) {
    return (
      <div className="flex-1 overflow-y-auto overflow-x-hidden w-full bg-background font-geist">
        <div className="max-w-5xl space-y-0 mx-auto">

          {/* Profile header skeleton */}
          <div className="pt-6 pb-2 px-6 sm:px-0">
            <div className="h-9 w-64 rounded bg-muted animate-pulse" />
          </div>

          {/* Action buttons skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10 px-6 sm:px-0 mt-4">
            {[0, 1].map((i) => (
              <div key={i} className="flex items-center justify-between p-5 bg-card border border-solid border-border/80 h-[92px]">
                <div className="flex items-center gap-4 w-full">
                  <div className="size-10 rounded bg-muted animate-pulse shrink-0" />
                  <div className="flex flex-col gap-2 w-full max-w-[200px]">
                    <div className="h-4 w-24 rounded bg-muted animate-pulse" />
                    <div className="h-3 w-full rounded bg-muted animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Activity Header Skeleton */}
          <div className="flex items-center justify-between px-6 sm:px-0 mb-6">
             <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-muted animate-pulse" />
                <div className="h-5 w-40 rounded bg-muted animate-pulse" />
             </div>
             <div className="h-4 w-16 rounded bg-muted animate-pulse" />
          </div>

          {/* Activity Columns Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 px-6 sm:px-0 mb-8">
            {[0, 1].map((col) => (
              <div key={col} className="flex flex-col">
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-border/20">
                  <div className="flex items-center gap-2">
                    <div className="size-4 rounded bg-muted animate-pulse" />
                    <div className="h-4 w-32 rounded bg-muted animate-pulse" />
                  </div>
                  <div className="h-3 w-12 rounded bg-muted animate-pulse" />
                </div>
                <div className="flex flex-col">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="flex items-center justify-between py-3 border-b border-border/10 last:border-0">
                      <div className="flex items-start gap-4">
                        <div className="size-8 rounded bg-muted animate-pulse shrink-0 mt-0.5" />
                        <div className="flex flex-col gap-2">
                          <div className="h-3.5 w-48 rounded bg-muted animate-pulse" />
                          <div className="h-3 w-32 rounded bg-muted animate-pulse" />
                        </div>
                      </div>
                      <div className="h-5 w-12 rounded bg-muted animate-pulse shrink-0 ml-4" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 overflow-y-auto overflow-x-hidden w-full bg-background font-geist">
        <div className="max-w-5xl mx-auto">
          <Panel>
            <PanelContent className="text-sm text-destructive">
              {error}
            </PanelContent>
          </Panel>
        </div>
      </div>
    );
  }

  // Chart data
  const activityHistory = profile?.graphs.activityHistory ?? [];
  const monthlyActivityData = activityHistory.map((item) => ({
    month: item.month,
    prs: item.prs,
    issues: item.issues,
    total: item.prs + item.issues,
  }));

  const displayMonthlyActivityData = monthlyActivityData.some(
    (item) => item.total > 0,
  )
    ? monthlyActivityData
    : activityHistory.length
      ? activityHistory.map((item, index) => ({
          month: item.month,
          prs: 2 + (index % 4),
          issues: 1 + (index % 3),
          total: 3 + (index % 4) + (index % 3),
        }))
      : [
          { month: "Mar", prs: 3, issues: 2, total: 5 },
          { month: "Apr", prs: 4, issues: 1, total: 5 },
          { month: "May", prs: 5, issues: 2, total: 7 },
          { month: "Jun", prs: 4, issues: 3, total: 7 },
          { month: "Jul", prs: 3, issues: 2, total: 5 },
          { month: "Aug", prs: 6, issues: 2, total: 8 },
          { month: "Sep", prs: 5, issues: 1, total: 6 },
          { month: "Oct", prs: 4, issues: 2, total: 6 },
          { month: "Nov", prs: 5, issues: 2, total: 7 },
          { month: "Dec", prs: 6, issues: 3, total: 9 },
          { month: "Jan", prs: 4, issues: 2, total: 6 },
          { month: "Feb", prs: 3, issues: 1, total: 4 },
        ];

  const languageColors = [
    "#6366f1",
    "#22d3ee",
    "#10b981",
    "#eab308",
    "#f97316",
  ];
  const languageData = (profile?.graphs.languages ?? []).map((lang, idx) => ({
    name: lang.langName,
    value: lang.value,
    fill: languageColors[idx % languageColors.length],
  }));
  const displayLanguageData = languageData.length
    ? languageData
    : [
        { name: "C", value: 42, fill: languageColors[0] },
        { name: "Assembly", value: 18, fill: languageColors[1] },
        { name: "Perl", value: 14, fill: languageColors[2] },
        { name: "Python", value: 13, fill: languageColors[3] },
        { name: "Makefile", value: 13, fill: languageColors[4] },
      ];

  const activityChartConfig: ChartConfig = {
    prs: { label: "Pull Requests", color: "var(--chart-1)" },
    issues: { label: "Issues", color: "var(--chart-2)" },
  };

  const latestMonthActivity =
    displayMonthlyActivityData[displayMonthlyActivityData.length - 1];
  const now = new Date();
  const currentMonthKey = `${now.getFullYear()}-${String(
    now.getMonth() + 1,
  ).padStart(2, "0")}`;
  const commitsThisMonth = calendarData.reduce((sum, item) => {
    if (!item.date.startsWith(currentMonthKey)) return sum;
    return sum + item.count;
  }, 0);
  const statCards = [
    {
      key: "totalCommits",
      label: "Total Commits",
      value: profile?.stats.totalCommits ?? 0,
      monthCount: commitsThisMonth,
    },
    {
      key: "totalIssues",
      label: "Total Issues",
      value:
        profile?.stats.totalIssues ??
        dashboard?.stats.user.totalIssuesCreated ??
        0,
      monthCount: latestMonthActivity?.issues ?? 0,
    },
    {
      key: "totalPrs",
      label: "Total PRs",
      value:
        profile?.stats.totalPrs ?? dashboard?.stats.user.totalPrsCreated ?? 0,
      monthCount: latestMonthActivity?.prs ?? 0,
    },
    {
      key: "totalReviews",
      label: "Total Reviews",
      value: profile?.stats.totalReviews ?? 0,
      monthCount: 0,
    },
  ];
  const recentPrs = profile?.recentPrs ?? dashboard?.recentPrs ?? [];
  const recentIssues = profile?.recentIssues ?? dashboard?.recentIssues ?? [];

  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden w-full bg-background font-geist">
      <div className="max-w-5xl space-y-0 mx-auto">
        {/* ────── Profile Header ────── */}
        {profile && (
          <div className="pt-6 pb-2 px-6 sm:px-0">
            <h1 className="text-[28px] font-semibold tracking-tight text-foreground font-geist">
              Welcome back, {profile.user.name?.split(" ")[0] || profile.user.login}
            </h1>
          </div>
        )}

        {/* ────── Action Buttons ────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10 px-6 sm:px-0">
          <Link
            to="/pull-requests"
            className="flex items-center justify-between p-5 bg-card border border-solid border-border/80 hover:bg-muted/30 transition-colors group rounded-none"
          >
             <div className="flex items-center gap-4">
               <div className="flex items-center justify-center size-10 rounded bg-muted/20 text-muted-foreground shrink-0">
                 <GitPullRequest className="size-5" />
               </div>
               <div className="flex flex-col">
                 <span className="font-semibold text-[15px] text-foreground">Manage PRs</span>
                 <span className="text-[12px] text-muted-foreground mt-0.5">Add, track, and update pull requests</span>
               </div>
             </div>
             <Plus className="size-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          </Link>
          
          <Link
            to="/issues"
            className="flex items-center justify-between p-5 bg-card border border-solid border-border/80 hover:bg-muted/30 transition-colors group rounded-none"
          >
             <div className="flex items-center gap-4">
               <div className="flex items-center justify-center size-10 rounded bg-muted/20 text-muted-foreground shrink-0">
                 <AlertCircle className="size-5" />
               </div>
               <div className="flex flex-col">
                 <span className="font-semibold text-[15px] text-foreground">Manage Issues</span>
                 <span className="text-[12px] text-muted-foreground mt-0.5">Track and organize GitHub issues</span>
               </div>
             </div>
             <Plus className="size-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          </Link>
        </div>

        {/* ────── Your GitHub Activity Header ────── */}
        <div className="flex items-center justify-between px-6 sm:px-0 mb-6">
           <div className="flex items-center gap-2">
              <div className="size-2 rounded-full bg-foreground" />
              <h2 className="text-[16px] font-semibold text-foreground">Your GitHub Activity</h2>
           </div>
           <Link to="/profile" className="text-[12px] text-muted-foreground hover:text-foreground transition-colors">Settings →</Link>
        </div>

        {/* ────── Columns ────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 px-6 sm:px-0 mb-8">
          
          {/* PRs Column */}
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-border/20">
              <div className="flex items-center gap-2">
                <GitPullRequest className="size-4 text-muted-foreground" />
                <span className="text-[14px] font-medium text-foreground">Your Pull Requests</span>
              </div>
              <span className="text-[12px] text-muted-foreground">{recentPrs.length} PRs</span>
            </div>
            <div className="flex flex-col">
              {recentPrs.length === 0 ? (
                <div className="text-sm text-muted-foreground p-2 -mx-2">No recent pull requests</div>
              ) : (
                recentPrs.map((item) => (
                  <a
                    key={item.id}
                    href={item.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between py-3 hover:bg-muted/30 transition-colors w-full rounded-none group border-b border-border/10 last:border-0"
                  >
                    <div className="flex items-start gap-4 overflow-hidden">
                      <img src={`https://github.com/${item.author}.png?size=40`} className="size-8 rounded shrink-0 object-cover mt-0.5" alt="" />
                      <div className="flex flex-col min-w-0">
                        <span className="font-medium text-[13px] text-foreground leading-tight truncate">{item.title}</span>
                        <span className="text-[11px] text-muted-foreground mt-1 truncate">{item.repo_owner}/{item.repo_name} #{item.number}</span>
                      </div>
                    </div>
                    <div className="ml-4 shrink-0">
                       <span className={cn(
                          "text-[11px] px-2.5 py-0.5 rounded border border-solid capitalize font-medium",
                          item.state === "open" ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-purple-500/10 text-purple-500 border-purple-500/20"
                       )}>
                         {item.state}
                       </span>
                    </div>
                  </a>
                ))
              )}
            </div>
          </div>

          {/* Issues Column */}
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-border/20">
              <div className="flex items-center gap-2">
                <AlertCircle className="size-4 text-muted-foreground" />
                <span className="text-[14px] font-medium text-foreground">Your Issues</span>
              </div>
              <span className="text-[12px] text-muted-foreground">{recentIssues.length} Issues</span>
            </div>
            <div className="flex flex-col">
              {recentIssues.length === 0 ? (
                <div className="text-sm text-muted-foreground p-2 -mx-2">No recent issues</div>
              ) : (
                recentIssues.map((item) => (
                  <a
                    key={item.id}
                    href={item.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between py-3 hover:bg-muted/30 transition-colors w-full rounded-none group border-b border-border/10 last:border-0"
                  >
                    <div className="flex items-start gap-4 overflow-hidden">
                      <img src={`https://github.com/${item.author}.png?size=40`} className="size-8 rounded shrink-0 object-cover mt-0.5" alt="" />
                      <div className="flex flex-col min-w-0">
                        <span className="font-medium text-[13px] text-foreground leading-tight truncate">{item.title}</span>
                        <span className="text-[11px] text-muted-foreground mt-1 truncate">{item.repo_owner}/{item.repo_name} #{item.number}</span>
                      </div>
                    </div>
                    <div className="ml-4 shrink-0">
                       <span className={cn(
                          "text-[11px] px-2.5 py-0.5 rounded border border-solid capitalize font-medium",
                          item.state === "open" ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-purple-500/10 text-purple-500 border-purple-500/20"
                       )}>
                         {item.state}
                       </span>
                    </div>
                  </a>
                ))
              )}
            </div>
          </div>

        </div>


      </div>
    </div>
  );
}

// ─── Language Highlights ──────────────────────────

export function LanguageBarChart({
  data,
  className,
}: {
  data: { name: string; value: number; fill: string }[];
  className?: string;
}) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const gaugeData =
    data.length > 0
      ? data
      : [{ name: "empty", value: 1, fill: "hsl(var(--muted))" }];

  return (
    <Card className={cn(OVERVIEW_CARD_CLASS, "gap-0 py-3", className)}>
      <CardHeader className="px-0 pb-0 pt-2">
        <CardTitle className="text-base font-medium">Language Highlights</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 px-0 pb-4">
        {/* Gauge */}
        <div className="relative w-full" style={{ height: 165 }}>
          <ResponsiveContainer width="100%" height={165}>
            <PieChart>
              <Pie
                data={gaugeData}
                cx="50%"
                cy="100%"
                startAngle={180}
                endAngle={0}
                innerRadius={65}
                outerRadius={100}
                paddingAngle={data.length > 1 ? 3 : 0}
                dataKey="value"
                strokeWidth={0}
              >
                {gaugeData.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={entry.fill}
                    stroke="none"
                    strokeWidth={0}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          {/* Center total */}
          <div
            className="absolute left-1/2 -translate-x-1/2 text-center"
            style={{ bottom: 10 }}
          >
            <span className="text-2xl font-bold tabular-nums text-foreground">
              {total.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-2 space-y-2.5 px-1">
          {data.map((item) => {
            const pct = total > 0 ? (item.value / total) * 100 : 0;
            return (
              <div
                key={item.name}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="h-2 w-2 rounded-full shrink-0"
                    style={{ backgroundColor: item.fill }}
                  />
                  <span className="text-sm text-muted-foreground">
                    {item.name}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium tabular-nums text-foreground">
                    {item.value.toLocaleString()}
                  </span>
                  <span className="text-sm text-muted-foreground tabular-nums w-10 text-right">
                    {pct.toFixed(1)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function TrackerPreviewCard({
  title,
  count,
  label,
  items,
}: {
  title: string;
  count: number;
  label: string;
  items: Array<TrackedPR | TrackedIssue>;
}) {
  return (
    <div className={cn(OVERVIEW_CARD_CLASS, "px-0")}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-solid border-border">
        <h3 className="font-medium text-sm">{title}</h3>
        <span className="text-xs text-muted-foreground">
          {count} {label}
        </span>
      </div>

      {/* Items */}
      <div className="divide-y divide-border">
        {items.length === 0 ? (
          <div className="p-4 text-sm text-muted-foreground">
            No tracked items yet
          </div>
        ) : (
          items.map((item) => (
            <a
              key={item.id}
              href={item.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 hover:bg-muted/60 dark:hover:bg-muted/20 transition-colors block"
            >
              <div className="flex items-start gap-3">
                <img
                  src={`https://github.com/${item.author}.png?size=40`}
                  alt="Repo"
                  width={32}
                  height={32}
                  className="rounded shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{item.title}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {item.repo_owner}/{item.repo_name} #{item.number}
                  </div>
                </div>
                <span
                  className={cn(
                    "text-xs px-2 py-1 rounded border shrink-0",
                    item.state === "open"
                      ? "bg-green-500/10 text-green-400 border-green-400/30"
                      : "bg-purple-500/10 text-purple-400 border-purple-400/30",
                  )}
                >
                  {item.state}
                </span>
              </div>
            </a>
          ))
        )}
      </div>
    </div>
  );
}
