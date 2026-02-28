import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { z } from "zod";
import { ArrowUpRight, CalendarBlank, Briefcase } from "@phosphor-icons/react";

const GsocOrgSchema = z
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

const GsocResponseSchema = z.object({
  year: z.number().optional(),
  organizaitons: z.array(GsocOrgSchema),
  total: z.number().optional(),
  page: z.number().optional(),
  perPage: z.number().optional(),
  totalPages: z.number().optional(),
});

type GsocOrg = z.infer<typeof GsocOrgSchema>;

function GsocOrgCard({ org }: { org: GsocOrg }) {
  const title = org.name || "Unnamed Organization";
  const description =
    org.shortdesc || org.description || "No description provided.";
  const logoSrc = org.logo_url || org.image_url || null;
  const tags = [
    ...(org.technologies ?? []),
    ...(org.topics ?? []),
    ...(org.category ? [org.category] : []),
  ].slice(0, 4);
  const years = (org.participation_years ?? []).slice(0, 5);
  const remainingYears = Math.max(
    (org.participation_years?.length ?? 0) - years.length,
    0,
  );
  const projectsCount = org.total_projects ?? org.num_projects ?? 0;
  const yearsCount =
    org.years_participated ?? org.participation_years?.length ?? 1;

  return (
    <a
      href={org.url || "https://summerofcode.withgoogle.com"}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex h-full flex-col gap-3 p-4 border border-border/60 rounded-none bg-card max-w-full font-geist transition-colors hover:border-foreground/20 hover:bg-accent/30"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-none border border-border/60 bg-background">
            {logoSrc ? (
              <img
                src={logoSrc}
                alt={title}
                className="h-12 w-12 rounded-none object-cover"
                loading="lazy"
              />
            ) : (
              <span className="text-xs font-semibold text-muted-foreground">
                {title.slice(0, 2).toUpperCase()}
              </span>
            )}
          </div>

          <div className="flex flex-col justify-center">
            <span className="block text-sm font-bold tracking-tight text-foreground line-clamp-1">
              {title}
            </span>
            <p className="text-xs leading-tight text-muted-foreground line-clamp-2">
              {description}
            </p>
          </div>
        </div>

        <ArrowUpRight
          className="mt-1 h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          weight="bold"
        />
      </div>

      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1" title="Years in GSoC">
          <CalendarBlank className="w-4 h-4" weight="fill" />
          {yearsCount} years
        </span>
        <span className="flex items-center gap-1" title="Projects">
          <Briefcase className="w-4 h-4" weight="fill" />
          {projectsCount} projects
        </span>
      </div>

      {years.length > 0 && (
        <div className="flex h-7 w-full flex-nowrap items-center gap-2 overflow-hidden whitespace-nowrap">
          {years.map((year) => (
            <span
              key={year}
              className="flex h-7 items-center rounded-none border border-border/60 bg-muted/30 px-3 text-xs text-foreground"
            >
              {year}
            </span>
          ))}
          {remainingYears > 0 && (
            <span className="flex h-7 items-center rounded-none border border-border/60 bg-muted/30 px-3 text-xs text-foreground">
              +{remainingYears}
            </span>
          )}
        </div>
      )}

      <div className="flex h-5 w-full flex-nowrap items-center gap-2 overflow-hidden whitespace-nowrap">
        {tags.length > 0 ? (
          tags.map((tag) => (
            <span
              key={tag}
              className="flex h-5 items-center rounded-none border border-border/60 bg-white px-2 text-[11px] text-black dark:bg-black dark:text-white"
            >
              {tag}
            </span>
          ))
        ) : (
          <span className="flex h-5 items-center px-2 text-[11px] opacity-0">
            placeholder
          </span>
        )}
      </div>
    </a>
  );
}

function parseNumberList(value: string | null): number[] {
  if (!value) return [];
  return value
    .split(",")
    .map((item) => Number(item.trim()))
    .filter((item) => !Number.isNaN(item));
}

function parseStringList(value: string | null): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function arraysEqual<T>(a: T[], b: T[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((item, index) => item === b[index]);
}

export default function GsocPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get("search")?.toLowerCase() ?? "";
  const [orgs, setOrgs] = useState<GsocOrg[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(
    Math.max(1, Number(searchParams.get("page") || 1)),
  );
  const [totalPages, setTotalPages] = useState(1);
  const perPage = 30;
  const didInitRef = useRef(false);
  const [isYearsOpen, setIsYearsOpen] = useState(false);
  const [isTechOpen, setIsTechOpen] = useState(false);
  const [selectedYears, setSelectedYears] = useState<number[]>(
    parseNumberList(searchParams.get("years")),
  );
  const [selectedTechnologies, setSelectedTechnologies] = useState<string[]>(
    parseStringList(searchParams.get("tech")),
  );

  const allYears = useMemo(() => {
    const years = new Set<number>();
    orgs.forEach((org) => {
      (org.participation_years ?? []).forEach((year) => years.add(year));
    });

    return Array.from(years).sort((a, b) => b - a);
  }, [orgs]);

  const allTechnologies = useMemo(() => {
    const technologies = new Set<string>();
    orgs.forEach((org) => {
      (org.technologies ?? []).forEach((tech) => technologies.add(tech));
    });

    return Array.from(technologies).sort((a, b) => a.localeCompare(b));
  }, [orgs]);

  const filteredOrgs = useMemo(() => {
    if (!search) return orgs;

    return orgs.filter((org) => {
      const byName = org.name?.toLowerCase().includes(search);
      const byShort = org.shortdesc?.toLowerCase().includes(search);
      const byDescription = org.description?.toLowerCase().includes(search);
      const byCategory = org.category?.toLowerCase().includes(search);
      const byTechnology = (org.technologies ?? []).some((technology) =>
        technology.toLowerCase().includes(search),
      );

      return byName || byShort || byDescription || byCategory || byTechnology;
    });
  }, [orgs, search]);

  const fullyFilteredOrgs = useMemo(() => {
    return filteredOrgs.filter((org) => {
      const matchesYears =
        selectedYears.length === 0 ||
        (org.participation_years ?? []).some((year) =>
          selectedYears.includes(year),
        );
      const matchesTech =
        selectedTechnologies.length === 0 ||
        (org.technologies ?? []).some((tech) =>
          selectedTechnologies.includes(tech),
        );

      return matchesYears && matchesTech;
    });
  }, [filteredOrgs, selectedYears, selectedTechnologies]);

  useEffect(() => {
    if (!didInitRef.current) {
      didInitRef.current = true;
      return;
    }
    setPage(1);
  }, [search, selectedYears, selectedTechnologies]);

  useEffect(() => {
    const paramPage = Math.max(1, Number(searchParams.get("page") || 1));
    const paramYears = parseNumberList(searchParams.get("years"));
    const paramTech = parseStringList(searchParams.get("tech"));

    if (paramPage !== page) {
      setPage(paramPage);
    }
    if (!arraysEqual(paramYears, selectedYears)) {
      setSelectedYears(paramYears);
    }
    if (!arraysEqual(paramTech, selectedTechnologies)) {
      setSelectedTechnologies(paramTech);
    }
  }, [searchParams]);

  useEffect(() => {
    const next = new URLSearchParams(searchParams);

    if (page > 1) {
      next.set("page", String(page));
    } else {
      next.delete("page");
    }

    if (selectedYears.length > 0) {
      next.set("years", selectedYears.join(","));
    } else {
      next.delete("years");
    }

    if (selectedTechnologies.length > 0) {
      next.set("tech", selectedTechnologies.join(","));
    } else {
      next.delete("tech");
    }

    if (next.toString() !== searchParams.toString()) {
      setSearchParams(next, { replace: true });
    }
  }, [
    page,
    selectedYears,
    selectedTechnologies,
    searchParams,
    setSearchParams,
  ]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

  useEffect(() => {
    async function fetchGsocData() {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/findGSOC?page=${page}&perPage=${perPage}`,
        );

        if (!res.ok) {
          setOrgs([]);
          return;
        }

        const json = await res.json();
        const parsed = GsocResponseSchema.safeParse(json);

        if (!parsed.success) {
          console.error("GSoC data validation error:", parsed.error.issues);
          setOrgs([]);
          return;
        }

        setOrgs(parsed.data.organizaitons);
        setTotalPages(parsed.data.totalPages ?? 1);
      } catch (error) {
        console.error("Failed to fetch GSoC organizations:", error);
        setOrgs([]);
      } finally {
        setLoading(false);
      }
    }

    fetchGsocData();
  }, [page]);

  return (
    <div className="flex-1 overflow-y-auto w-full bg-background font-geist">
      <section className="px-6 md:px-10 py-8 max-w-[1600px] mx-auto">
        <div className="space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="space-y-2">
              <h1 className="text-3xl tracking-tight font-serif-instrument">
                GSoC Organizations
              </h1>
              <p className="text-muted-foreground">
                Explore organizations participating in Google Summer of Code.
              </p>
            </div>

            <div className="flex w-full flex-wrap gap-3 justify-start md:justify-end">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsYearsOpen((prev) => !prev)}
                  className="flex items-center gap-2 h-9 px-3 border border-border bg-card text-sm text-foreground"
                >
                  {selectedYears.length === 0
                    ? "All Years"
                    : `${selectedYears.length} Years`}
                  <span className="text-muted-foreground">▾</span>
                </button>

                {isYearsOpen && (
                  <div className="absolute z-20 mt-2 w-56 max-h-64 overflow-auto border border-border bg-popover p-2 shadow-md">
                    {allYears.map((year) => (
                      <label
                        key={year}
                        className="flex items-center gap-2 px-2 py-1 text-sm text-foreground"
                      >
                        <input
                          type="checkbox"
                          checked={selectedYears.includes(year)}
                          onChange={() => {
                            setSelectedYears((prev) =>
                              prev.includes(year)
                                ? prev.filter((item) => item !== year)
                                : [...prev, year],
                            );
                          }}
                        />
                        {year}
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsTechOpen((prev) => !prev)}
                  className="flex items-center gap-2 h-9 px-3 border border-border bg-card text-sm text-foreground"
                >
                  {selectedTechnologies.length === 0
                    ? "Technologies"
                    : `${selectedTechnologies.length} Tech`}
                  <span className="text-muted-foreground">▾</span>
                </button>

                {isTechOpen && (
                  <div className="absolute z-20 mt-2 w-64 max-h-64 overflow-auto border border-border bg-popover p-2 shadow-md">
                    {allTechnologies.map((tech) => (
                      <label
                        key={tech}
                        className="flex items-center gap-2 px-2 py-1 text-sm text-foreground"
                      >
                        <input
                          type="checkbox"
                          checked={selectedTechnologies.includes(tech)}
                          onChange={() => {
                            setSelectedTechnologies((prev) =>
                              prev.includes(tech)
                                ? prev.filter((item) => item !== tech)
                                : [...prev, tech],
                            );
                          }}
                        />
                        {tech}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading ? (
              Array.from({ length: 9 }).map((_, i) => (
                <div
                  key={i}
                  className="h-[180px] w-full animate-pulse border bg-muted/20"
                />
              ))
            ) : fullyFilteredOrgs.length === 0 ? (
              <div className="col-span-full py-20 text-center text-muted-foreground">
                <p>No GSoC organizations found matching your search.</p>
              </div>
            ) : (
              fullyFilteredOrgs.map((org, index) => (
                <GsocOrgCard key={`${org.name || "org"}-${index}`} org={org} />
              ))
            )}
          </div>

          <div className="flex items-center justify-between border-t border-border/60 pt-4">
            <button
              type="button"
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              className="h-9 px-3 border border-border bg-card text-sm text-foreground disabled:opacity-50"
              disabled={page <= 1}
            >
              Previous
            </button>

            <span className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </span>

            <button
              type="button"
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              className="h-9 px-3 border border-border bg-card text-sm text-foreground disabled:opacity-50"
              disabled={page >= totalPages}
            >
              Next
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
