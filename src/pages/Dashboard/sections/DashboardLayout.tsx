import SearchHeader from "../components/SearchHeader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DashboardLayoutProps<T> {
  title: string;
  description: string;
  searchType:
    | "repos"
    | "yc-repos"
    | "gsoc-orgs"
    | "trending-repos"
    | "issues"
    | "home"
    | "overview"
    | "pull-requests";
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  loading: boolean;

  showPeriodFilter?: boolean;
  currentPeriod?: string;
  onPeriodChange?: (val: string) => void;

  showLanguageFilter?: boolean;
  languageOptions?: Array<{ value: string; label: string }>;
  currentLanguage?: string;
  onLanguageChange?: (val: string) => void;

  showSortFilter?: boolean;
  sortOptions?: Array<{ value: string; label: string }>;
  currentSort?: string;
  onSortChange?: (val: string) => void;

  searchQuery?: string;
  onSearchChange?: (query: string) => void;

  titleClassName?: string;
  emptyMessage?: string;
}

export function DashboardLayout<T>({
  title,
  description,
  searchType,
  items,
  renderItem,
  loading,
  showPeriodFilter = false,
  currentPeriod,
  onPeriodChange,
  showLanguageFilter = false,
  languageOptions = [],
  currentLanguage,
  onLanguageChange,
  showSortFilter = false,
  sortOptions = [],
  currentSort,
  onSortChange,
  onSearchChange,
  titleClassName,
  emptyMessage = "No items found matching your criteria.",
}: DashboardLayoutProps<T> & { onMenuToggle?: () => void }) {
  return (
    <main className="flex-1 overflow-y-auto md:ml-[70px] w-full bg-background h-screen font-geist">
      <SearchHeader
        searchType={searchType}
        onSearch={onSearchChange || (() => {})}
      />

      <section className="px-6 md:px-10 py-8 max-w-[1600px] mx-auto">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="space-y-1">
            <h1
              className={`text-3xl tracking-tight font-serif-instrument ${titleClassName || ""}`}
            >
              {title}
            </h1>
            <p className="text-muted-foreground">{description}</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {showPeriodFilter && onPeriodChange && (
              <Select value={currentPeriod} onValueChange={onPeriodChange}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            )}

            {showLanguageFilter &&
              onLanguageChange &&
              languageOptions.length > 0 && (
                <Select
                  value={currentLanguage}
                  onValueChange={onLanguageChange}
                >
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Language" />
                  </SelectTrigger>
                  <SelectContent>
                    {languageOptions.map((lang) => (
                      <SelectItem key={lang.value} value={lang.value}>
                        {lang.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

            {showSortFilter && onSortChange && sortOptions.length > 0 && (
              <Select value={currentSort} onValueChange={onSortChange}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            Array.from({ length: 9 }).map((_, i) => (
              <div
                key={i}
                className="h-[180px] w-full animate-pulse border bg-muted/20"
              />
            ))
          ) : items.length === 0 ? (
            <div className="col-span-full py-20 text-center text-muted-foreground">
              <p>{emptyMessage}</p>
            </div>
          ) : (
            items.map((item, index) => renderItem(item, index))
          )}
        </div>
      </section>
    </main>
  );
}
