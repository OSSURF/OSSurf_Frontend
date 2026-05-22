import { z } from "zod";

export const MonthlyActivitySchema = z.object({
  month: z.string(),
  prs: z.number(),
  issues: z.number(),
});

export const CalendarActivitySchema = z.object({
  date: z.string(),
  count: z.number(),
  level: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
});

export const TrackedPRSchema = z.object({
  id: z.number(),
  repo_owner: z.string(),
  repo_name: z.string(),
  number: z.number(),
  html_url: z.string(),
  title: z.string(),
  state: z.string(),
  author: z.string(),
});

export const TrackedIssueSchema = z.object({
  id: z.number(),
  repo_owner: z.string(),
  repo_name: z.string(),
  number: z.number(),
  html_url: z.string(),
  title: z.string(),
  state: z.string(),
  author: z.string(),
});

export const PinnedRepoSchema = z.object({
  name: z.string(),
  description: z.string().nullable(),
  language: z.string().nullable(),
  stars: z.number(),
  forks: z.number(),
  htmlUrl: z.string(),
});

export const ProfileResponseSchema = z.object({
  username: z.string(),
  user: z.object({
    name: z.string().nullable(),
    login: z.string(),
    avatarUrl: z.string(),
    bio: z.string().nullable(),
    followers: z.number(),
    following: z.number(),
    htmlUrl: z.string(),
  }),
  stats: z.object({
    totalCommits: z.number(),
    totalPrs: z.number(),
    totalIssues: z.number(),
    totalReviews: z.number(),
  }),
  graphs: z.object({
    activityHistory: z.array(MonthlyActivitySchema),
    contributionCalendar: z.array(CalendarActivitySchema).optional(),
    contributionTotals: z.record(z.string(), z.number()).optional(),
    languages: z.array(z.object({ langName: z.string(), value: z.number() })),
    prStats: z.object({ merged: z.number(), open: z.number(), closed: z.number() }),
    radar: z.object({ commits: z.number(), prs: z.number(), issues: z.number(), reviews: z.number() }),
  }),
  recentPrs: z.array(TrackedPRSchema).optional(),
  recentIssues: z.array(TrackedPRSchema).optional(),
  pinnedRepos: z.array(PinnedRepoSchema).optional(),
});

export const DashboardResponseSchema = z.object({
  stats: z.object({
    user: z.object({
      username: z.string().nullable(),
      totalPrsCreated: z.number(),
      totalPrsMerged: z.number(),
      totalIssuesCreated: z.number(),
      contributionCalendar: z.array(CalendarActivitySchema),
      contributionTotals: z.record(z.string(), z.number()),
    }),
    tracking: z.object({
      activePrs: z.number(),
      activeIssues: z.number(),
      totalTracked: z.number(),
    }),
  }),
  recentPrs: z.array(TrackedPRSchema),
  recentIssues: z.array(TrackedIssueSchema),
});

export type MonthlyActivity = z.infer<typeof MonthlyActivitySchema>;
export type CalendarActivity = z.infer<typeof CalendarActivitySchema>;
export type ProfileResponse = z.infer<typeof ProfileResponseSchema>;
export type DashboardResponse = z.infer<typeof DashboardResponseSchema>;
export type TrackedPR = z.infer<typeof TrackedPRSchema>;
export type TrackedIssue = z.infer<typeof TrackedIssueSchema>;

export async function fetchDashboard(): Promise<DashboardResponse> {
  const res = await fetch("/api/dashboard/", { credentials: "include" });
  if (!res.ok) {
    throw new Error(`Failed to fetch dashboard: ${res.statusText}`);
  }
  const json = await res.json();
  const parsed = DashboardResponseSchema.safeParse(json);
  if (!parsed.success) {
    throw new Error(`Validation failed for dashboard: ${parsed.error.message}`);
  }
  return parsed.data;
}

export async function fetchProfile(username: string): Promise<ProfileResponse> {
  const res = await fetch(`/api/profile/${encodeURIComponent(username)}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch profile for ${username}: ${res.statusText}`);
  }
  const json = await res.json();
  const parsed = ProfileResponseSchema.safeParse(json);
  if (!parsed.success) {
    throw new Error(`Validation failed for profile of ${username}: ${parsed.error.message}`);
  }
  return parsed.data;
}
