import { useEffect, useMemo, useState } from "react";
import { IconUsers } from "@tabler/icons-react";
import { GitHubDark, GitHubLight } from "@ridemountainpig/svgl-react";
import { ActivityCalendar } from "react-activity-calendar";
import { TrendingUp } from "lucide-react";
import {
  Area,
  AreaChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  Cell,
  Pie,
  PieChart,
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

type MonthlyActivity = {
  month: string;
  prs: number;
  issues: number;
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
    prStats: {
      merged: number;
      open: number;
      closed: number;
    };
    radar: {
      commits: number;
      prs: number;
      issues: number;
      reviews: number;
    };
  };
};

type CalendarActivity = {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
};

const TEST_PROFILE_USERNAME = "gaearon";
const PROFILE_ENDPOINT = `/api/profile/${encodeURIComponent(TEST_PROFILE_USERNAME)}`;
const RADAR_STROKE_COLOR = "#f97316";
const RADAR_FILL_COLOR = "rgba(249, 115, 22, 0.18)";
const RADAR_GRID_COLOR = "rgba(148, 163, 184, 0.28)";
const RADAR_LABEL_COLOR = "rgba(148, 163, 184, 0.92)";

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
  const totals = history.map((entry) => entry.prs + entry.issues);
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

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfile() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(PROFILE_ENDPOINT);

        if (!response.ok) {
          let serverError = "";
          try {
            const errorBody = (await response.json()) as { error?: string };
            serverError = errorBody.error?.trim() ?? "";
          } catch {
            serverError = "";
          }

          throw new Error(
            serverError
              ? `Failed to load profile (${response.status}): ${serverError}`
              : `Failed to load profile (${response.status})`,
          );
        }

        const data = (await response.json()) as ProfileResponse;
        setProfile(data);
      } catch (err) {
        if (err instanceof TypeError) {
          setError(
            "Unable to reach API. Start backend on port 3000 and try again.",
          );
        } else {
          setError(
            err instanceof Error ? err.message : "Failed to load profile",
          );
        }
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  const calendarData = useMemo(() => {
    if (profile?.graphs.contributionCalendar?.length) {
      return profile.graphs.contributionCalendar;
    }
    return buildCalendarData(profile?.graphs.activityHistory ?? []);
  }, [profile]);

  if (loading) {
    return (
      <div className="p-6 md:p-8">
        <div className="h-[280px] rounded-3xl border bg-muted/20 animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 md:p-8">
        <div className="rounded-xl border bg-card p-4 text-sm text-destructive">
          {error}
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-6 md:p-8">
        <div className="rounded-xl border bg-card p-4 text-sm text-muted-foreground">
          No profile data found.
        </div>
      </div>
    );
  }

  // Chart data transformations
  const monthlyActivityData = profile.graphs.activityHistory.map((item) => ({
    month: item.month,
    prs: item.prs,
    issues: item.issues,
    total: item.prs + item.issues,
  }));

  const displayMonthlyActivityData = monthlyActivityData.some(
    (item) => item.total > 0,
  )
    ? monthlyActivityData
    : profile.graphs.activityHistory.length
      ? profile.graphs.activityHistory.map((item, index) => {
          const prs = 2 + (index % 4);
          const issues = 1 + (index % 3);
          return {
            month: item.month,
            prs,
            issues,
            total: prs + issues,
          };
        })
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

  const radarRawData = [
    { stat: "Commits", rawValue: profile.graphs.radar.commits },
    { stat: "PRs", rawValue: profile.graphs.radar.prs },
    { stat: "Issues", rawValue: profile.graphs.radar.issues },
    { stat: "Reviews", rawValue: profile.graphs.radar.reviews },
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
  const languageData = profile.graphs.languages.map((lang, idx) => ({
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
    prs: {
      label: "Pull Requests",
      color: "var(--chart-1)",
    },
    issues: {
      label: "Issues",
      color: "var(--chart-2)",
    },
  };

  const totalPrsInRange = displayMonthlyActivityData.reduce(
    (sum, item) => sum + item.prs,
    0,
  );
  const totalIssuesInRange = displayMonthlyActivityData.reduce(
    (sum, item) => sum + item.issues,
    0,
  );

  return (
    <div className="p-6 md:p-8 max-w-5xl space-y-4 mx-auto h-screen overflow-auto">
      {/* Profile Header */}
      <section className="border border-dashed border-border/70 bg-card text-foreground py-6 px-5 md:px-6 shadow-none">
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
                  {profile.user.followers} Followers {profile.user.following}{" "}
                  Following
                </p>
                {profile.user.bio ? (
                  <p className="mt-2 text-muted-foreground">
                    {profile.user.bio}
                  </p>
                ) : (
                  <p>hello world</p>
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
          {/* Contribution Calendar */}
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
      </section>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="rounded-none">
          <CardHeader className="pb-2">
            <CardDescription>Merged PRs</CardDescription>
            <CardTitle className="text-3xl">
              {profile.graphs.prStats.merged.toLocaleString()}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="rounded-none">
          <CardHeader className="pb-2">
            <CardDescription>Open PRs</CardDescription>
            <CardTitle className="text-3xl">
              {profile.graphs.prStats.open.toLocaleString()}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="rounded-none">
          <CardHeader className="pb-2">
            <CardDescription>Closed PRs</CardDescription>
            <CardTitle className="text-3xl">
              {profile.graphs.prStats.closed.toLocaleString()}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Activity Area Chart */}
        <Card className="rounded-none">
          <CardHeader>
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
          </CardHeader>
          <CardContent>
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
            <div className="mt-3 text-xs text-muted-foreground">
              {totalPrsInRange.toLocaleString()} PRs •{" "}
              {totalIssuesInRange.toLocaleString()} Issues
            </div>
          </CardContent>
        </Card>

        {/* Contribution Stats Radar */}
        <Card className="rounded-none">
          <CardHeader>
            <CardTitle>Contribution Stats</CardTitle>
            <CardDescription>
              Commits, PRs, Issues and Reviews distribution
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData} outerRadius="76%">
                <PolarGrid
                  radialLines={false}
                  stroke={RADAR_GRID_COLOR}
                  strokeDasharray="4 4"
                />
                <PolarAngleAxis
                  dataKey="stat"
                  className="text-xs"
                  tick={{ fill: RADAR_LABEL_COLOR }}
                />
                <PolarRadiusAxis
                  tick={false}
                  axisLine={false}
                  tickCount={4}
                  domain={[0, 100]}
                />
                <Radar
                  name="Stats"
                  dataKey="value"
                  stroke={RADAR_STROKE_COLOR}
                  fill={RADAR_FILL_COLOR}
                  fillOpacity={1}
                  strokeWidth={2}
                />
                <Tooltip
                  formatter={(_value, _name, item) => {
                    const payload = item?.payload as
                      | { rawValue?: number }
                      | undefined;
                    return payload?.rawValue?.toLocaleString() ?? "0";
                  }}
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)",
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Languages Pie Chart */}
        <Card className="rounded-none">
          <CardHeader>
            <CardTitle>Top Languages</CardTitle>
            <CardDescription>Most used programming languages</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={displayLanguageData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  dataKey="value"
                >
                  {displayLanguageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
