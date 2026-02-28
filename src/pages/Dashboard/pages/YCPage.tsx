import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { z } from "zod";
import { YcOssCard, type YcCompanyData } from "@/components/yc-oss-card";

const YcCompanySchema = z.object({
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

const YcResponseSchema = z.object({
  data: z.array(YcCompanySchema),
  page: z.number().optional(),
});

export default function YCPage() {
  const [searchParams] = useSearchParams();
  const search = searchParams.get("search")?.toLowerCase() ?? "";
  const [companies, setCompanies] = useState<YcCompanyData[]>([]);
  const [loading, setLoading] = useState(true);

  const filteredCompanies = useMemo(() => {
    if (!search) return companies;

    return companies.filter((company) => {
      const byName = company.name.toLowerCase().includes(search);
      const byDesc = company.oneLiner?.toLowerCase().includes(search);
      const byBatch = company.batch.toLowerCase().includes(search);
      const byIndustry = company.industries.some((industry) =>
        industry.toLowerCase().includes(search),
      );

      return byName || byDesc || byBatch || byIndustry;
    });
  }, [companies, search]);

  useEffect(() => {
    async function fetchYcData() {
      setLoading(true);
      try {
        const res = await fetch("http://localhost:3000/api/yc?page=1");

        if (!res.ok) {
          setCompanies([]);
          return;
        }

        const json = await res.json();
        const parsed = YcResponseSchema.safeParse(json);

        if (!parsed.success) {
          console.error("YC data validation error:", parsed.error.issues);
          setCompanies([]);
          return;
        }

        const normalized: YcCompanyData[] = parsed.data.data.map((company) => ({
          id: company.id,
          ycId: company.ycId,
          name: company.name,
          slug: company.slug,
          smallLogoThumbUrl: company.smallLogoThumbUrl,
          website: company.website,
          oneLiner: company.oneLiner,
          teamSize: company.teamSize ?? 0,
          batch: company.batch ?? "N/A",
          status: company.status ?? "Unknown",
          industries: company.industries ?? [],
          regions: company.regions ?? [],
          url: company.url ?? "#",
          isHiring: company.isHiring ?? false,
          topCompany: company.topCompany ?? false,
          createdAt: company.createdAt,
          updatedAt: company.updatedAt,
        }));

        setCompanies(normalized);
      } catch (error) {
        console.error("Failed to fetch YC companies:", error);
        setCompanies([]);
      } finally {
        setLoading(false);
      }
    }

    fetchYcData();
  }, []);

  return (
    <div className="flex-1 overflow-y-auto w-full bg-background font-geist">
      <section className="px-6 md:px-10 py-8 max-w-[1600px] mx-auto">
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl tracking-tight font-serif-instrument">
              YC OSS
            </h1>
            <p className="text-muted-foreground">
              Discover open source projects backed by Y Combinator.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading ? (
              Array.from({ length: 9 }).map((_, i) => (
                <div
                  key={i}
                  className="h-[180px] w-full animate-pulse border bg-muted/20"
                />
              ))
            ) : filteredCompanies.length === 0 ? (
              <div className="col-span-full py-20 text-center text-muted-foreground">
                <p>No YC companies found matching your search.</p>
              </div>
            ) : (
              filteredCompanies.map((company) => (
                <YcOssCard
                  key={`${company.ycId}-${company.slug}`}
                  company={company}
                />
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
