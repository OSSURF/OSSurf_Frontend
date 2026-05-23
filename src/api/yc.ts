import { z } from "zod";
import { API_BASE_URL } from "./config";

export const YcCompanySchema = z.object({
  id: z.number(),
  ycId: z.number(),
  name: z.string(),
  slug: z.string(),
  smallLogoThumbUrl: z.string().nullable(),
  website: z.string().nullable(),
  oneLiner: z.string().nullable(),
  teamSize: z.number().nullable().default(0),
  batch: z.string().nullable().default("N/A"),
  status: z.string().nullable().default("Unknown"),
  industries: z.array(z.string()).nullable().default([]),
  regions: z.array(z.string()).nullable().default([]),
  url: z.string().nullable().default("#"),
  isHiring: z.boolean().nullable().default(false),
  topCompany: z.boolean().nullable().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const YcResponseSchema = z.object({
  data: z.array(YcCompanySchema),
  page: z.number().optional(),
});

export type YcCompanyData = z.infer<typeof YcCompanySchema>;
export type YcResponse = z.infer<typeof YcResponseSchema>;

export async function fetchYcData(page: number = 1): Promise<YcResponse> {
  const res = await fetch(`${API_BASE_URL}/api/yc?page=${page}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch YC data: ${res.statusText}`);
  }
  const json = await res.json();
  const parsed = YcResponseSchema.safeParse(json);
  if (!parsed.success) {
    throw new Error(`Validation failed for YC data: ${parsed.error.message}`);
  }
  return parsed.data;
}
