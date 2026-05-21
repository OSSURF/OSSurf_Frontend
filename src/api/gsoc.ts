import { z } from "zod";

export const GsocOrgSchema = z
  .object({
    name: z.string().optional(),
    shortdesc: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    url: z.string().nullable().optional(),
    logo_url: z.string().nullable().optional(),
    image_url: z.string().nullable().optional(),
    category: z.string().nullable().optional(),
    num_projects: z.number().optional(),
    total_projects: z.number().optional(),
    years_participated: z.number().optional(),
    participation_years: z.array(z.number()).optional(),
    technologies: z.array(z.string()).nullable().optional(),
    topics: z.array(z.string()).nullable().optional(),
  })
  .passthrough();

export const GsocResponseSchema = z.object({
  year: z.number().optional(),
  organizaitons: z.array(GsocOrgSchema),
  total: z.number().optional(),
  page: z.number().optional(),
  perPage: z.number().optional(),
  totalPages: z.number().optional(),
});

export type GsocOrg = z.infer<typeof GsocOrgSchema>;
export type GsocResponse = z.infer<typeof GsocResponseSchema>;

export async function fetchGsocData(page: number, perPage: number): Promise<GsocResponse> {
  const res = await fetch(`/api/findGSOC?page=${page}&perPage=${perPage}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch GSOC data: ${res.statusText}`);
  }
  const json = await res.json();
  const parsed = GsocResponseSchema.safeParse(json);
  if (!parsed.success) {
    throw new Error(`Validation failed for GSOC data: ${parsed.error.message}`);
  }
  return parsed.data;
}
