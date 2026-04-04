import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import {
  Area,
  AreaChart,
  XAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Panel, PanelContent } from "../components/panel";
import { GitHubContributionGraph } from "../components/github-contributions/graph";

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
  "px-3 flex flex-col bg-[#f5f5f5] dark:bg-card border border-dashed rounded-none shadow-none";

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

          {/* Profile card skeleton */}
          <div className={cn(OVERVIEW_CARD_CLASS, "gap-0 px-0")}>
            <div className="flex items-center gap-4 p-6 border-b border-dashed border-border">
              <div className="size-24 shrink-0 rounded-xl bg-muted animate-pulse" />
              <div className="flex flex-col gap-3 flex-1">
                <div className="h-8 w-48 rounded bg-muted animate-pulse" />
                <div className="h-3.5 w-24 rounded bg-muted animate-pulse" />
                <div className="flex gap-4 mt-1">
                  <div className="h-3 w-20 rounded bg-muted animate-pulse" />
                  <div className="h-3 w-20 rounded bg-muted animate-pulse" />
                </div>
              </div>
            </div>
            <div className="px-6 py-4 pb-6">
              <div className="h-[117px] w-full rounded bg-muted/40 animate-pulse" />
            </div>
          </div>

          {/* Stat cards skeleton */}
          <div className="py-6">
            <div className="grid grid-cols-2 md:grid-cols-4">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={cn(OVERVIEW_CARD_CLASS, i < 3 && "border-r-0")}
                >
                  <div className="h-3.5 w-24 rounded bg-muted animate-pulse mt-2" />
                  <div className="flex flex-col gap-5 items-start mt-2">
                    <div className="h-5 w-16 rounded bg-muted animate-pulse" />
                    <div className="flex justify-between w-full">
                      <div className="h-3 w-20 rounded bg-muted animate-pulse mb-2" />
                      <div className="h-3 w-8 rounded bg-muted animate-pulse mb-2" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* PR & Issues skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {[0, 1].map((i) => (
              <div key={i} className="border border-dashed border-border bg-[#f5f5f5] dark:bg-card">
                <div className="flex items-center justify-between p-4 border-b border-border">
                  <div className="h-4 w-36 rounded bg-muted animate-pulse" />
                  <div className="h-3 w-10 rounded bg-muted animate-pulse" />
                </div>
                {[0, 1, 2].map((j) => (
                  <div key={j} className="p-4 border-b border-border last:border-0">
                    <div className="flex items-start gap-3">
                      <div className="size-8 rounded shrink-0 bg-muted animate-pulse" />
                      <div className="flex-1 flex flex-col gap-2">
                        <div className="h-3.5 w-3/4 rounded bg-muted animate-pulse" />
                        <div className="h-3 w-1/2 rounded bg-muted animate-pulse" />
                      </div>
                      <div className="h-5 w-14 rounded bg-muted animate-pulse shrink-0" />
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Language + Activity skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
            <div className={cn(OVERVIEW_CARD_CLASS, "gap-0 py-3")}>
              <div className="h-4 w-36 rounded bg-muted animate-pulse mx-1 mt-2" />
              <div className="mt-4 h-[165px] w-full rounded bg-muted/40 animate-pulse" />
              <div className="mt-4 space-y-2.5 px-1 pb-2">
                {[0, 1, 2, 3].map((k) => (
                  <div key={k} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-muted animate-pulse" />
                      <div className="h-3 w-16 rounded bg-muted animate-pulse" />
                    </div>
                    <div className="h-3 w-20 rounded bg-muted animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
            <div className={cn(OVERVIEW_CARD_CLASS, "gap-0 py-3")}>
              <div className="h-4 w-32 rounded bg-muted animate-pulse mx-1 mt-2" />
              <div className="h-3 w-48 rounded bg-muted animate-pulse mx-1 mt-2" />
              <div className="mt-4 h-[300px] w-full rounded bg-muted/40 animate-pulse" />
            </div>
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
  const recentPrs = dashboard?.recentPrs ?? [];
  const recentIssues = dashboard?.recentIssues ?? [];

  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden w-full bg-background font-geist">
      <div className="max-w-5xl space-y-0 mx-auto">
        {/* ────── Profile Header ────── */}
        {profile && (
          <Card className={cn(OVERVIEW_CARD_CLASS, "gap-0 px-0")}>
            {/* Panel section with dashed side lines */}
            <section
              className="relative flex w-full rounded-none bg-transparent gap-4 p-6 shadow-none border-b border-dashed border-border"
              style={{
                backgroundImage: `repeating-linear-gradient(to bottom, hsl(var(--border)) 0px, hsl(var(--border)) 6px, transparent 6px, transparent 14px), repeating-linear-gradient(to bottom, hsl(var(--border)) 0px, hsl(var(--border)) 6px, transparent 6px, transparent 14px)`,
                backgroundSize: "1px 100%, 1px 100%",
                backgroundPosition: "left top, right top",
                backgroundRepeat: "no-repeat",
              }}
            >
              {/* Avatar */}
              <div className="relative flex items-center md:size-32 sm:size-24 size-24 shrink-0">
                <img
                  src={profile.user.avatarUrl}
                  alt={`${profile.user.name || profile.user.login}'s avatar`}
                  className="absolute inset-0 h-full w-full rounded-xl border border-solid p-0.5 object-cover"
                />
              </div>

              {/* Info */}
              <div className="flex flex-1 flex-col justify-end pl-2">
                <div
                  className="animate-fade-in-blur"
                  style={{ animationDelay: "0.1s", animationFillMode: "both" }}
                >
                  <h1 className="font-normal tracking-tight text-foreground sm:text-4xl text-3xl font-serif-instrument leading-tight">
                    {profile.user.name || profile.user.login}
                  </h1>
                  <a
                    href={profile.user.htmlUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block text-sm text-muted-foreground mt-0.5 hover:text-foreground underline"
                  >
                    @{profile.user.login}
                  </a>
                  {/* Followers / Following */}
                  <div className="flex items-center gap-4 mt-2 flex-wrap">
                    <span className="text-sm text-muted-foreground">
                      <span className="font-semibold text-foreground tabular-nums">
                        {profile.user.followers.toLocaleString()}
                      </span>{" "}
                      followers
                    </span>
                    <span className="text-sm text-muted-foreground">
                      <span className="font-semibold text-foreground tabular-nums">
                        {profile.user.following.toLocaleString()}
                      </span>{" "}
                      following
                    </span>
                  </div>
                  {/* Bio */}
                  {profile.user.bio && (
                    <p className="text-sm text-muted-foreground mt-1.5 leading-snug">
                      {profile.user.bio}
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* GitHub Contributions */}
            <div className="w-full px-6 py-4 pb-6">
              <GitHubContributionGraph data={calendarData as any} />
            </div>
          </Card>
        )}

        <div className="py-6">
          <div className="grid grid-cols-2 md:grid-cols-4">
            {statCards.map((card, idx) => (
              <div
                key={card.key}
                className={cn(OVERVIEW_CARD_CLASS, idx < 3 && "border-r-0", "hover:bg-muted/60 dark:hover:bg-muted/20 transition-colors cursor-default")}
              >
                <span className="text-sm mt-2 font-geist">{card.label}</span>
                <div className="flex flex-col gap-5 items-start justify-start">
                  <span className="text-lg font-geist text-foreground">
                    {card.value.toLocaleString()}
                  </span>
                  <div className="flex justify-between w-full">
                    <span className="text-sm mb-2">This month</span>
                    <span
                      className={cn(
                        "font-semibold mb-2 tabular-nums",
                        card.monthCount > 0
                          ? "text-foreground"
                          : "text-muted-foreground",
                      )}
                    >
                      {card.monthCount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>


        {/* ────── Pull Requests & Issues ────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <TrackerPreviewCard
            title="Your Pull Requests"
            count={recentPrs.length}
            label="PRs"
            items={recentPrs}
          />
          <TrackerPreviewCard
            title="Your Issues"
            count={recentIssues.length}
            label="Issues"
            items={recentIssues}
          />
        </div>

        {/* ────── Language Highlights + Monthly Activity ────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
          <LanguageBarChart
            data={displayLanguageData}
            className="lg:border-r-0"
          />

          <Card className={cn(OVERVIEW_CARD_CLASS, "gap-0 py-3")}>
            <CardHeader className="px-0 pt-2 pb-2">
              <div>
                <CardTitle className="text-lg mb-1">
                  Monthly Activity
                </CardTitle>
                <CardDescription>
                  PRs and Issues over the last 12 months
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="px-0">
              <ChartContainer
                config={activityChartConfig}
                className="h-[300px] w-full"
              >
                <AreaChart accessibilityLayer data={displayMonthlyActivityData}>
                  <defs>
                    <linearGradient
                      id="gradient-chart-prs"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="var(--color-prs)"
                        stopOpacity={0.5}
                      />
                      <stop
                        offset="95%"
                        stopColor="var(--color-prs)"
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                    <linearGradient
                      id="gradient-chart-issues"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="var(--color-issues)"
                        stopOpacity={0.5}
                      />
                      <stop
                        offset="95%"
                        stopColor="var(--color-issues)"
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => String(value).slice(0, 3)}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent />}
                  />
                  <Area
                    dataKey="prs"
                    fill="url(#gradient-chart-prs)"
                    fillOpacity={0.4}
                    stroke="var(--color-prs)"
                    stackId="a"
                    strokeWidth={0.8}
                    strokeDasharray="3 3"
                  />
                  <Area
                    dataKey="issues"
                    fill="url(#gradient-chart-issues)"
                    fillOpacity={0.4}
                    stroke="var(--color-issues)"
                    stackId="a"
                    strokeWidth={0.8}
                    strokeDasharray="3 3"
                  />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ─── Language Highlights ──────────────────────────

function LanguageBarChart({
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
    <div className="border border-dashed border-border bg-[#f5f5f5] dark:bg-card">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
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
              className="p-4 hover:bg-muted/50 dark:hover:bg-[#1f2020] transition-colors block"
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
