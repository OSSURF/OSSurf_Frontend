import { z } from "zod";
import { API_BASE_URL } from "./config";
import { CalendarActivitySchema, TrackedPRSchema, TrackedIssueSchema } from "./profile";

export const OverviewResponseSchema = z.object({
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

export type OverviewResponse = z.infer<typeof OverviewResponseSchema>;

export async function fetchOverview(): Promise<OverviewResponse> {
  const res = await fetch(`${API_BASE_URL}/api/overview`, { credentials: "include" });
  if (!res.ok) {
    throw new Error(`Failed to fetch overview: ${res.statusText}`);
  }
  const json = await res.json();
  const parsed = OverviewResponseSchema.safeParse(json);
  if (!parsed.success) {
    throw new Error(`Validation failed for overview: ${parsed.error.message}`);
  }
  return parsed.data;
}
