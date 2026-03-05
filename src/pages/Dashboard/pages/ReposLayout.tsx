import { useState, useMemo, useEffect } from "react";
import { Outlet, useLocation, useSearchParams } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FiltersContextType {
  language: string;
  onLanguageChange: (lang: string) => void;
  sort: string;
  onSortChange: (sort: string) => void;
  period: string;
  onPeriodChange: (period: string) => void;
  search: string;
  onSearchChange: (search: string) => void;
  languageOptions: Array<{ value: string; label: string }>;
}

export default function ReposLayout() {
  const location = useLocation();
  const isTrendingPage = location.pathname === "/trending-repos";
  const [searchParams, setSearchParams] = useSearchParams();
  const [language, setLanguage] = useState(
    searchParams.get("language") || "all",
  );
  const [sort, setSort] = useState(searchParams.get("sort") || "stars");
  const [period, setPeriod] = useState(searchParams.get("period") || "daily");
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [allLanguages, setAllLanguages] = useState<string[]>([]);

  useEffect(() => {
    setSearch(searchParams.get("search") || "");
  }, [searchParams]);

  const languageOptions = useMemo(
    () => [
      { value: "all", label: "All Languages" },
      ...allLanguages.map((lang) => ({
        value: lang.toLowerCase(),
        label: lang,
      })),
    ],
    [allLanguages],
  );

  const sortOptions = [
    { value: "stars", label: "Most Stars" },
    { value: "forks", label: "Most Forks" },
    { value: "issues", label: "Most Issues" },
  ];

  const periodOptions = [
    { value: "daily", label: "Daily" },
    { value: "weekly", label: "Weekly" },
    { value: "monthly", label: "Monthly" },
  ];

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    setSearchParams((prev) => {
      prev.set("language", lang);
      return prev;
    });
  };

  const handleSortChange = (newSort: string) => {
    setSort(newSort);
    setSearchParams((prev) => {
      prev.set("sort", newSort);
      return prev;
    });
  };

  const handlePeriodChange = (newPeriod: string) => {
    setPeriod(newPeriod);
    setSearchParams((prev) => {
      prev.set("period", newPeriod);
      return prev;
    });
  };

  const handleSearchChange = (newSearch: string) => {
    setSearch(newSearch);
    setSearchParams((prev) => {
      if (newSearch) {
        prev.set("search", newSearch);
      } else {
        prev.delete("search");
      }
      return prev;
    });
  };

  const pageHeader =
    location.pathname === "/trending-repos"
      ? {
          title: "Trending Repos",
          description: "See what the open source community is excited about.",
        }
      : {
          title: "Discover Repos",
          description: "Explore new and interesting repositories.",
        };

  return (
    <div className="flex-1 overflow-y-auto w-full bg-background font-geist">
      <section className="px-6 md:px-10 py-8 max-w-[1600px] mx-auto">
        <div className="space-y-6">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="gap-1">
              <h1 className="text-3xl tracking-tight font-serif-instrument">
                {pageHeader.title}
              </h1>
              <p className="text-muted-foreground">{pageHeader.description}</p>
            </div>

            <div className="flex flex-wrap items-center gap-3 justify-start md:justify-end">
              {isTrendingPage && (
                <Select value={period} onValueChange={handlePeriodChange}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Period" />
                  </SelectTrigger>
                  <SelectContent>
                    {periodOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              <Select value={language} onValueChange={handleLanguageChange}>
                <SelectTrigger className="w-[160px] rounded-none">
                  <SelectValue placeholder="Language" />
                </SelectTrigger>
                <SelectContent>
                  {languageOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sort} onValueChange={handleSortChange}>
                <SelectTrigger className="w-[140px] rounded-none">
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Outlet
            context={
              {
                language,
                sort,
                period,
                search,
                onLanguageChange: handleLanguageChange,
                onSortChange: handleSortChange,
                onPeriodChange: handlePeriodChange,
                onSearchChange: handleSearchChange,
                languageOptions,
                setAllLanguages,
              } satisfies FiltersContextType & {
                setAllLanguages: (langs: string[]) => void;
              }
            }
          />
        </div>
      </section>
    </div>
  );
}
