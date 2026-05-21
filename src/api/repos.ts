import { z } from "zod";

export const DbRepoSchema = z.object({
  id: z.number(),
  github_id: z.number().optional().nullable(),
  owner: z.string(),
  repo_name: z.string(),
  full_name: z.string(),
  url: z.string(),
  description: z.string().nullable().optional(),
  language: z.string().nullable().optional(),
  stargazers_count: z.number().optional(),
  forks_count: z.number().optional(),
  watchers_count: z.number().optional().nullable(),
  open_issues_count: z.number().optional().nullable(),
  avatar_url: z.string().nullable().optional(),
  stars_earned: z.number().nullable().optional(),
  created_at: z.string().optional().nullable(),
  updated_at: z.string().optional().nullable(),
  last_synced_at: z.string().optional().nullable(),
  tags: z.array(z.string()).optional(),
});

export const TrendingResponseSchema = z.object({
  data: z.array(DbRepoSchema),
});

export type DbRepo = z.infer<typeof DbRepoSchema>;
export type TrendingResponse = z.infer<typeof TrendingResponseSchema>;

export const GithubRepoSchema = z.object({
  owner: z.object({
    login: z.string(),
    avatar_url: z.string().nullable().optional(),
  }),
  name: z.string(),
  description: z.string().nullable(),
  language: z.string().nullable(),
  stargazers_count: z.number(),
  forks_count: z.number(),
  watchers_count: z.number(),
  open_issues_count: z.number(),
  topics: z.array(z.string()).optional().default([]),
});

export const DiscoverResponseSchema = z.object({
  items: z.array(GithubRepoSchema),
  page: z.number().optional().default(1),
  perPage: z.number().optional().default(30),
  total: z.number().optional().default(0),
  totalPages: z.number().optional().default(1),
  hasNextPage: z.boolean().optional(),
  hasPreviousPage: z.boolean().optional(),
});

export type GithubRepo = z.infer<typeof GithubRepoSchema>;
export type DiscoverResponse = z.infer<typeof DiscoverResponseSchema>;

export async function fetchTrendingRepos(period: string): Promise<TrendingResponse> {
  const res = await fetch(`/api/trending?period=${period}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch trending repos: ${res.statusText}`);
  }
  const json = await res.json();
  const parsed = TrendingResponseSchema.safeParse(json);
  if (!parsed.success) {
    throw new Error(`Validation failed for trending repos: ${parsed.error.message}`);
  }
  return parsed.data;
}

export async function fetchDiscoverRepos(params: {
  sort: string;
  page: number;
  perPage: number;
  language?: string;
}): Promise<DiscoverResponse> {
  const urlParams = new URLSearchParams();
  urlParams.set("sort", params.sort);
  urlParams.set("page", String(params.page));
  urlParams.set("perPage", String(params.perPage));
  if (params.language && params.language !== "all") {
    urlParams.set("language", params.language);
  }

  const res = await fetch(`/api/discover?${urlParams.toString()}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch discover repos: ${res.statusText}`);
  }
  const json = await res.json();
  const parsed = DiscoverResponseSchema.safeParse(json);
  if (!parsed.success) {
    throw new Error(`Validation failed for discover repos: ${parsed.error.message}`);
  }
  return parsed.data;
}
