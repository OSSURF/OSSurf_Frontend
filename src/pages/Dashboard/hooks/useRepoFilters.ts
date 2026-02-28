import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

export default function useRepoFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [language, setLanguage] = useState(
    searchParams.get("language") || "all",
  );
  const [sort, setSort] = useState(searchParams.get("sort") || "stars");
  const [period, setPeriod] = useState(searchParams.get("period") || "daily");
  const [allLanguages, setAllLanguages] = useState<string[]>([]);

  const search = searchParams.get("search") || "";

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

  const updateQueryParam = (key: string, value: string) => {
    setSearchParams((prev) => {
      if (value) {
        prev.set(key, value);
      } else {
        prev.delete(key);
      }
      return prev;
    });
  };

  return {
    language,
    sort,
    period,
    search,
    setAllLanguages,
    languageOptions,
    sortOptions,
    periodOptions,
    onLanguageChange: (value: string) => {
      setLanguage(value);
      updateQueryParam("language", value);
    },
    onSortChange: (value: string) => {
      setSort(value);
      updateQueryParam("sort", value);
    },
    onPeriodChange: (value: string) => {
      setPeriod(value);
      updateQueryParam("period", value);
    },
    onSearchChange: (value: string) => {
      updateQueryParam("search", value);
    },
  };
}
