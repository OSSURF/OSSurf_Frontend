import { z } from "zod";

export const ContributorRankingSchema = z.object({
  id: z.string(),
  name: z.string(),
  avatarUrl: z.string(),
  score: z.number(),
  mergedPRs: z.number(),
  openPRs: z.number(),
  issues: z.number(),
});

export type ContributorRanking = z.infer<typeof ContributorRankingSchema>;

export async function fetchContributorsRankings(): Promise<ContributorRanking[]> {
  const res = await fetch("/api/contributors/rankings");
  if (!res.ok) {
    throw new Error(`Failed to fetch contributor rankings: ${res.statusText}`);
  }
  const json = await res.json();
  const parsed = z.array(ContributorRankingSchema).safeParse(json);
  if (!parsed.success) {
    throw new Error(`Validation failed for contributor rankings: ${parsed.error.message}`);
  }
  return parsed.data;
}
