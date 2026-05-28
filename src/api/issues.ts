import { z } from "zod";
import { API_BASE_URL } from "./config";

export const UserSchema = z.object({
  login: z.string(),
  avatar_url: z.string().nullable().optional(),
  html_url: z.string().optional().default(""),
});

export const LabelSchema = z.object({
  name: z.string(),
  color: z.string(),
  description: z.string().nullable().optional(),
});

export const IssueSchema = z.object({
  number: z.number(),
  title: z.string(),
  state: z.enum(["open", "closed"]),
  html_url: z.string(),
  user: UserSchema,
  labels: z.array(LabelSchema).default([]),
  comments: z.number().default(0),
  created_at: z.string(),
  updated_at: z.string(),
  body: z.string().nullable().optional(),
  repository_url: z.string().optional(),
});

export const FindIssuesResponseSchema = z.object({
  page: z.number(),
  perPage: z.number(),
  total: z.number(),
  issues: z.array(IssueSchema),
});

export type User = z.infer<typeof UserSchema>;
export type Label = z.infer<typeof LabelSchema>;
export type Issue = z.infer<typeof IssueSchema>;
export type FindIssuesResponse = z.infer<typeof FindIssuesResponseSchema>;

export async function findIssues(params: {
  page: number;
  perPage: number;
  language?: string;
  labels?: string;
}): Promise<FindIssuesResponse> {
  const urlParams = new URLSearchParams();
  urlParams.set("page", String(params.page));
  urlParams.set("perPage", String(params.perPage));

  if (params.language && params.language !== "all") {
    urlParams.set("language", params.language);
  }

  if (params.labels && params.labels.trim()) {
    urlParams.set("labels", params.labels.trim());
  }

  const res = await fetch(`${API_BASE_URL}/api/find-issues?${urlParams.toString()}`);
  if (!res.ok) {
    let serverMessage = "";
    try {
      const body = await res.json();
      serverMessage = body.error || body.message || "";
    } catch {
      serverMessage = "";
    }
    throw new Error(serverMessage || `Request failed with status ${res.status}`);
  }

  const json = await res.json();
  const parsed = FindIssuesResponseSchema.safeParse(json);
  if (!parsed.success) {
    throw new Error(`Validation failed for findIssues: ${parsed.error.message}`);
  }
  return parsed.data;
}
