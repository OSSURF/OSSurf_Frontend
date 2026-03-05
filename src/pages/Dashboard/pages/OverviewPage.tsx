import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { IconUsers } from "@tabler/icons-react";
import { GitHubDark, GitHubLight } from "@ridemountainpig/svgl-react";
import { ActivityCalendar } from "react-activity-calendar";
import { TrendingUp, BarChart2, Plus, ArrowRight } from "lucide-react";
import {
  Area,
  AreaChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  XAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart";
import { Badge } from "@/components/ui/badge";
import GitPullRequestIcon from "@/components/ui/svgs/git-pull-request-stroke-rounded";
import AlertCircleStrokeRounded from "@/components/ui/svgs/AlertCircleStrokeRounded";

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

// ─── Constants ────────────────────────────────────

const RADAR_STROKE_COLOR = "#f97316";
const RADAR_FILL_COLOR = "rgba(249, 115, 22, 0.18)";
const RADAR_GRID_COLOR = "rgba(148, 163, 184, 0.28)";
const RADAR_LABEL_COLOR = "rgba(148, 163, 184, 0.92)";

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
      <div className="flex-1 overflow-y-auto w-full bg-background font-geist">
        <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-4">
          <div className="h-[200px] border bg-muted/20 animate-pulse" />
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-[100px] border bg-muted/20 animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 overflow-y-auto w-full bg-background font-geist">
        <div className="p-6 md:p-8 max-w-6xl mx-auto">
          <div className="border bg-card p-4 text-sm text-destructive">
            {error}
          </div>
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

  const radarRawData = profile
    ? [
        { stat: "Commits", rawValue: profile.graphs.radar.commits },
        { stat: "PRs", rawValue: profile.graphs.radar.prs },
        { stat: "Issues", rawValue: profile.graphs.radar.issues },
        { stat: "Reviews", rawValue: profile.graphs.radar.reviews },
      ]
    : [
        { stat: "Commits", rawValue: 0 },
        { stat: "PRs", rawValue: 0 },
        { stat: "Issues", rawValue: 0 },
        { stat: "Reviews", rawValue: 0 },
      ];
  const maxRadarRawValue = Math.max(
    ...radarRawData.map((item) => item.rawValue),
    1,
  );
  const radarData = radarRawData.map((item) => ({
    stat: item.stat,
    rawValue: item.rawValue,
    value: Math.max(12, Math.sqrt(item.rawValue / maxRadarRawValue) * 100),
  }));

  const languageColors = [
    "#3b82f6",
    "#8b5cf6",
    "#ec4899",
    "#f59e0b",
    "#10b981",
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

  const totalPrsInRange = displayMonthlyActivityData.reduce(
    (sum, item) => sum + item.prs,
    0,
  );
  const totalIssuesInRange = displayMonthlyActivityData.reduce(
    (sum, item) => sum + item.issues,
    0,
  );

  const prStats = profile?.graphs.prStats ?? {
    merged: 0,
    open: 0,
    closed: 0,
  };
  const recentPrs = dashboard?.recentPrs ?? [];
  const recentIssues = dashboard?.recentIssues ?? [];

  return (
    <div className="flex-1 overflow-y-auto w-full bg-background font-geist">
      <div className="p-6 md:p-8 max-w-6xl space-y-2 mx-auto">
        {/* ────── Profile Header ────── */}
        {profile && (
          <section className="border border-border bg-muted text-foreground shadow-none p-1">
            <div className="bg-background py-6 px-5 md:px-4">
              <div className="flex flex-col gap-6">
                <div className="flex justify-between">
                  <div className="flex items-center justify-center gap-5">
                    <img
                      src={profile.user.avatarUrl}
                      alt={profile.user.login}
                      className="w-24 h-24 border border-border"
                    />
                    <div>
                      <h1 className="text-5xl font-serif-instrument tracking-tight leading-none">
                        {profile.user.name || profile.user.login}
                      </h1>
                      <p className="text-xl text-muted-foreground">
                        @{profile.user.login} •{" "}
                        <IconUsers className="inline w-4 h-4" />{" "}
                        {profile.user.followers} Followers{" "}
                        {profile.user.following} Following
                      </p>
                      {profile.user.bio && (
                        <p className="mt-2 text-muted-foreground">
                          {profile.user.bio}
                        </p>
                      )}
                    </div>
                  </div>
                  <a
                    href={profile.user.htmlUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors flex items-center"
                  >
                    <GitHubLight className="w-12 h-12 dark:hidden text-gray-900" />
                    <GitHubDark className="w-12 h-12 hidden dark:block text-white" />
                  </a>
                </div>
                <div className="flex items-center justify-center">
                  <ActivityCalendar
                    data={calendarData}
                    blockSize={14}
                    blockRadius={4}
                    blockMargin={3}
                    showMonthLabels
                    showColorLegend
                    showTotalCount
                    showWeekdayLabels={false}
                  />
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ────── Pull Requests & Issues ────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
          {/* Pull Requests */}
          <Card className="rounded-none shadow-none border-border bg-muted p-1">
            <div className="bg-background">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-600/15">
                      <GitPullRequestIcon className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <CardTitle className="text-base">Pull Requests</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Track and manage pull requests
                      </p>
                    </div>
                  </div>
                  <Link
                    to="/pull-requests"
                    className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                  >
                    View All <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="max-h-[300px] overflow-y-auto">
                {recentPrs.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">
                    No tracked PRs yet.{" "}
                    <Link
                      to="/pull-requests"
                      className="text-blue-500 hover:text-blue-400"
                    >
                      Add some <Plus className="inline h-3.5 w-3.5" />
                    </Link>
                  </p>
                ) : (
                  <div className="divide-y divide-border">
                    {recentPrs.map((pr) => (
                      <div
                        key={pr.id}
                        className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                      >
                        <img
                          src={`https://github.com/${pr.author}.png?size=40`}
                          alt={pr.author}
                          className="w-8 h-8 rounded-full border border-border shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {pr.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {pr.repo_owner}/{pr.repo_name} #{pr.number}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <Badge
                            variant="outline"
                            className="text-xs text-green-500 border-green-500/30 bg-green-500/10"
                          >
                            Tracked by &#x1F464;
                          </Badge>
                          <Badge
                            variant={
                              pr.state === "open"
                                ? "default"
                                : pr.state === "merged"
                                  ? "secondary"
                                  : "destructive"
                            }
                            className="text-xs capitalize"
                          >
                            {pr.state}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </div>
          </Card>

          {/* Issues */}
          <Card className="rounded-none shadow-none border-border bg-muted p-1">
            <div className="bg-background">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-600/15">
                      <AlertCircleStrokeRounded className="h-5 w-5 text-yellow-500" />
                    </div>
                    <div>
                      <CardTitle className="text-base">Issues</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Track and organize GitHub issues
                      </p>
                    </div>
                  </div>
                  <Link
                    to="/issues"
                    className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                  >
                    View All <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="max-h-[300px] overflow-y-auto">
                {recentIssues.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">
                    No tracked issues yet.{" "}
                    <Link
                      to="/issues"
                      className="text-blue-500 hover:text-blue-400"
                    >
                      Add some <Plus className="inline h-3.5 w-3.5" />
                    </Link>
                  </p>
                ) : (
                  <div className="divide-y divide-border">
                    {recentIssues.map((issue) => (
                      <div
                        key={issue.id}
                        className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                      >
                        <img
                          src={`https://github.com/${issue.author}.png?size=40`}
                          alt={issue.author}
                          className="w-8 h-8 rounded-full border border-border shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {issue.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {issue.repo_owner}/{issue.repo_name} #{issue.number}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <Badge
                            variant="outline"
                            className="text-xs text-green-500 border-green-500/30 bg-green-500/10"
                          >
                            Tracked by &#x1F464;
                          </Badge>
                          <Badge
                            variant={
                              issue.state === "open" ? "default" : "secondary"
                            }
                            className="text-xs capitalize"
                          >
                            {issue.state}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </div>
          </Card>
        </div>

        {/* ────── Stats Grid ────── */}
        <div className="border border-border bg-muted p-1">
          <div className="grid grid-cols-2 md:grid-cols-4 bg-background">
            <div className="px-5 py-4 border-r border-b md:border-b-0 border-border">
              <p className="text-sm text-muted-foreground">Total Commits</p>
              <p className="text-3xl font-semibold tracking-tight mt-1">
                {(profile?.stats.totalCommits ?? 0).toLocaleString()}
              </p>
            </div>
            <div className="px-5 py-4 border-b md:border-b-0 md:border-r border-border">
              <p className="text-sm text-muted-foreground">Total PRs</p>
              <p className="text-3xl font-semibold tracking-tight mt-1">
                {(profile?.stats.totalPrs ?? 0).toLocaleString()}
              </p>
            </div>
            <div className="px-5 py-4 border-r border-border">
              <p className="text-sm text-muted-foreground">Total Issues</p>
              <p className="text-3xl font-semibold tracking-tight mt-1">
                {(profile?.stats.totalIssues ?? 0).toLocaleString()}
              </p>
            </div>
            <div className="px-5 py-4">
              <p className="text-sm text-muted-foreground">Total Reviews</p>
              <p className="text-3xl font-semibold tracking-tight mt-1">
                {(profile?.stats.totalReviews ?? 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* ────── Language Highlights + Monthly Activity ────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
          <LanguageHighlights data={displayLanguageData} />

          <Card className="rounded-none shadow-none border-border bg-muted p-1">
            <div className="bg-background">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>
                      Monthly Activity
                      <span className="ml-2 inline-flex items-center gap-1 rounded-md bg-green-500/10 px-2 py-0.5 text-xs text-green-500">
                        <TrendingUp className="h-4 w-4" />
                        <span>PRs & Issues</span>
                      </span>
                    </CardTitle>
                    <CardDescription>
                      PRs and Issues over the last 12 months
                    </CardDescription>
                  </div>
                  <div className="text-right text-sm tabular-nums">
                    <span className="font-semibold text-foreground">
                      {totalPrsInRange.toLocaleString()}
                    </span>
                    <span className="text-muted-foreground"> PRs</span>
                    <span className="text-muted-foreground"> • </span>
                    <span className="font-semibold text-foreground">
                      {totalIssuesInRange.toLocaleString()}
                    </span>
                    <span className="text-muted-foreground"> Issues</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={activityChartConfig}
                  className="h-[300px] w-full"
                >
                  <AreaChart
                    accessibilityLayer
                    data={displayMonthlyActivityData}
                  >
                    <defs>
                      <linearGradient
                        id="ov-gradient-prs"
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
                        id="ov-gradient-issues"
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
                      fill="url(#ov-gradient-prs)"
                      fillOpacity={0.4}
                      stroke="var(--color-prs)"
                      stackId="a"
                      strokeWidth={0.8}
                      strokeDasharray="3 3"
                    />
                    <Area
                      dataKey="issues"
                      fill="url(#ov-gradient-issues)"
                      fillOpacity={0.4}
                      stroke="var(--color-issues)"
                      stackId="a"
                      strokeWidth={0.8}
                      strokeDasharray="3 3"
                    />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ─── Language Highlights ──────────────────────────

function LanguageHighlights({
  data,
}: {
  data: { name: string; value: number; fill: string }[];
}) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const langPercentages = data.map((item) => ({
    ...item,
    percent: total ? (item.value / total) * 100 : 0,
  }));

  return (
    <Card className="rounded-none shadow-none border-border bg-muted p-1">
      <div className="bg-background">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Language Highlights</CardTitle>
            <BarChart2 className="w-5 h-5 text-muted-foreground" />
          </div>
          <CardDescription>All time language usage</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex w-full h-5 gap-1.5 mb-5">
            {langPercentages.map((lang) => (
              <div
                key={lang.name}
                style={{ background: lang.fill, width: `${lang.percent}%` }}
                className="h-full rounded-sm"
              />
            ))}
          </div>
          <div className="flex flex-col gap-3">
            {langPercentages.map((lang) => (
              <div
                key={lang.name}
                className="grid items-center text-sm"
                style={{ gridTemplateColumns: "1fr auto auto" }}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className="inline-block w-3 h-3 rounded-full shrink-0"
                    style={{ background: lang.fill }}
                  />
                  <span className="font-medium text-foreground">
                    {lang.name}
                  </span>
                </div>
                <span className="font-mono text-foreground tabular-nums text-right min-w-[3rem]">
                  {lang.value}
                </span>
                <span className="font-mono text-muted-foreground tabular-nums text-right text-xs min-w-[4rem]">
                  {lang.percent.toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
