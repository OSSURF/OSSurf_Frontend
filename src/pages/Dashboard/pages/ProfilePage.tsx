import { useEffect, useMemo, useState } from "react";
import { IconUsers } from "@tabler/icons-react";
import { GitHubDark, GitHubLight } from "@ridemountainpig/svgl-react";
import { ActivityCalendar } from "react-activity-calendar";
import {
  TrendingUp,
  BarChart2,
  ArrowUpIcon,
  ArrowDownIcon,
} from "lucide-react";
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
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

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
    <div className="flex-1 overflow-y-auto w-full bg-background font-geist">
      <div className="p-6 md:p-8 max-w-5xl space-y-2 mx-auto">
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
                  <p className="text-sm text-muted-foreground">
                    @{profile.user.login} • {profile.user.followers} Followers •{" "}
                    {profile.user.following} Following
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

        {/* Stats Grid - reference style */}
        <div className="grid grid-cols-2 md:grid-cols-4">
          {/* Stat Cards with Growth */}
          {(() => {
            // Helper to calculate growth percentage for a stat
            function getGrowth(
              statKey:
                | "totalCommits"
                | "totalIssues"
                | "totalPrs"
                | "totalReviews",
            ) {
              // Find last 30 days and previous 30 days totals from monthlyActivityData
              // Each item: { month, prs, issues, total }
              const months = displayMonthlyActivityData.length;
              if (months < 2) return null;
              // Last 30 days: last month
              const lastMonth = displayMonthlyActivityData[months - 1];
              const prevMonth = displayMonthlyActivityData[months - 2];
              let last = 0,
                prev = 0;
              switch (statKey) {
                case "totalCommits":
                  // Commits not in monthlyActivityData, fallback to total
                  last = lastMonth.total;
                  prev = prevMonth.total;
                  break;
                case "totalIssues":
                  last = lastMonth.issues;
                  prev = prevMonth.issues;
                  break;
                case "totalPrs":
                  last = lastMonth.prs;
                  prev = prevMonth.prs;
                  break;
                case "totalReviews":
                  // No monthly reviews data, fallback to 0
                  last = 0;
                  prev = 0;
                  break;
              }
              if (prev === 0) {
                if (last > 0) return 100;
                return 0;
              }
              return Math.round(((last - prev) / prev) * 100);
            }

            const statCards = [
              {
                key: "totalCommits",
                label: "Total Commits",
                value: profile.stats.totalCommits,
                growth: getGrowth("totalCommits"),
              },
              {
                key: "totalIssues",
                label: "Total Issues",
                value: profile.stats.totalIssues,
                growth: getGrowth("totalIssues"),
              },
              {
                key: "totalPrs",
                label: "Total PRs",
                value: profile.stats.totalPrs,
                growth: getGrowth("totalPrs"),
              },
              {
                key: "totalReviews",
                label: "Total Reviews",
                value: profile.stats.totalReviews,
                growth: getGrowth("totalReviews"),
              },
            ];
            return statCards.map((card, idx) => (
              <div
                key={card.key}
                className={`px-3 flex flex-col bg-card border border-dashed ${idx < 3 ? " border-r-0" : ""}`}
              >
                <span className="text-sm mt-2 font-geist">{card.label}</span>
                <div className="flex flex-col gap-5 items-start justify-start">
                  <span className="text-lg font-geist text-foreground">
                    {card.value.toLocaleString()}
                  </span>
                  <div className="flex justify-between w-full">
                    <span className="text-sm mb-2">Last 30 days</span>
                    <GrowthDisplay growth={card.growth} />
                  </div>
                </div>
              </div>
            ));
          })()}
        </div>

        {/* Language Highlights + Monthly Activity side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
          <LanguageEvilRadarChart data={displayLanguageData} />

          {/* Monthly Activity Area Chart */}
          <Card className="rounded-none shadow-none border-border">
            <CardHeader className="pt-2 pb-2">
              <div>
                <CardTitle className="text-lg mb-1">
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
            </CardContent>
          </Card>
        </div>

        {/* Repo Stats Bar Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
          <RepoStatsBarChart stats={profile.stats} />
        </div>
      </div>
    </div>
  );
}

// Replace <LanguageHighlights data={displayLanguageData} /> or <LanguageRadialChart data={displayLanguageData} /> with:
// <LanguageEvilRadarChart data={displayLanguageData} />
function LanguageEvilRadarChart({
  data,
}: {
  data: { name: string; value: number; fill: string }[];
}) {
  // EvilCharts expects data as [{ label, value, color }]
  const chartData = data.map((lang) => ({
    label: lang.name,
    value: lang.value,
    color: lang.fill,
  }));
  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-2 pt-2">
        <div>
          <CardTitle className="text-lg mb-1">Language Highlights</CardTitle>
          <CardDescription className="mt-0">
            All time language usage
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <div className="flex flex-col items-center">
          <RadarChart
            data={chartData}
            width={320}
            height={240}
            maxValue={Math.max(...chartData.map((d) => d.value), 10)}
            showLegend
            showTooltip
          />
        </div>
      </CardContent>
    </Card>
  );
}

function GrowthDisplay({ growth }: { growth: number | null }) {
  if (growth === null) return <span className="text-muted-foreground">--</span>;
  if (growth > 0)
    return (
      <span className="text-green-500 font-semibold flex items-center gap-1">
        {`+${growth}%`}
        <ArrowUpIcon size={16} />
      </span>
    );
  if (growth < 0)
    return (
      <span className="text-red-500 font-semibold flex items-center gap-1">
        {`${growth}%`}
        <ArrowDownIcon size={16} />
      </span>
    );
  return <span className="text-muted-foreground font-semibold">0%</span>;
}

function RepoStatsBarChart({
  stats,
}: {
  stats: { stars: number; forks: number; watchers: number };
}) {
  const data = {
    labels: ["Stars", "Forks", "Watchers"],
    datasets: [
      {
        label: "Count",
        data: [stats.stars, stats.forks, stats.watchers],
        backgroundColor: "#3b82f6",
        borderRadius: 6,
        barThickness: 48,
      },
    ],
  };
  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 2 },
        grid: { color: "#e5e7eb" },
        max: Math.max(stats.stars, stats.forks, stats.watchers, 10),
      },
      x: {
        grid: { display: false },
      },
    },
  };
  return (
    <div className="w-full max-w-md mx-auto mt-8">
      <Bar data={data} options={options} />
    </div>
  );
}
