import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Option {
  value: string;
  label: string;
}

interface RepoFiltersProps {
  period: string;
  language: string;
  sort: string;
  periodOptions: Option[];
  languageOptions: Option[];
  sortOptions: Option[];
  onPeriodChange: (value: string) => void;
  onLanguageChange: (value: string) => void;
  onSortChange: (value: string) => void;
}

export default function RepoFilters({
  period,
  language,
  sort,
  periodOptions,
  languageOptions,
  sortOptions,
  onPeriodChange,
  onLanguageChange,
  onSortChange,
}: RepoFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 justify-end">
      <Select value={period} onValueChange={onPeriodChange}>
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

      <Select value={language} onValueChange={onLanguageChange}>
        <SelectTrigger className="w-[160px]">
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

      <Select value={sort} onValueChange={onSortChange}>
        <SelectTrigger className="w-[140px]">
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
  );
}
