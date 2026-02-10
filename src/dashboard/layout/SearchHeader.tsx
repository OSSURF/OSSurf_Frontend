import { useForm } from "react-hook-form";
import { IconSearch, IconBell, IconMenu2 } from "@tabler/icons-react";
import { GitHubDark, GitHubLight } from "@ridemountainpig/svgl-react";
import { ThemeToggle } from "@/components/ThemeToggle";

interface SearchHeaderProps {
  searchType?:
    | "home"
    | "repos"
    | "yc-repos"
    | "gsoc-orgs"
    | "trending-repos"
    | "overview"
    | "pull-requests"
    | "issues";
  onMenuToggle?: () => void;
  onSearch?: (query: string) => void;
}

interface SearchFormInputs {
  query: string;
}

export default function SearchHeader({
  searchType = "repos",
  onMenuToggle,
  onSearch,
}: SearchHeaderProps) {
  const { register } = useForm<SearchFormInputs>({
    defaultValues: {
      query: "",
    },
  });

  const placeholders = {
    home: "Find repositories...",
    repos: "Find repositories...",
    "yc-repos": "Find YC repositories...",
    "gsoc-orgs": "Find GSoC orgs...",
    "trending-repos": "Find trending repos...",
    overview: "Search overview...",
    "pull-requests": "Find pull requests...",
    issues: "Find issues...",
  };
  const handleGitHub = () => {
    window.open("https://github.com", "_blank");
  };
  return (
    <header className="flex items-center h-[70px] justify-between sticky top-0 z-40 px-2  gap-1 md:px-8 border-b border-border bg-background">
      <button
        onClick={onMenuToggle}
        className="justify-center text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 border bg-transparent hover:bg-accent hover:text-accent-foreground rounded-full w-8 h-8 items-center relative flex md:hidden"
      >
        <IconMenu2 className="h-5 w-5 text-foreground" />
      </button>

      <div className="flex-1 flex items-center gap-4">
        <div className="relative flex-1 w-full max-w-xs lg:max-w-md">
          <div className="flex items-center gap-2 bg-background px-3 py-2">
            <IconSearch className="h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder={placeholders[searchType]}
              {...register("query", {
                onChange: (e) => onSearch?.(e.target.value),
              })}
              className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder-muted-foreground"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 ml-auto">
        <button
          onClick={handleGitHub}
          className="hidden md:flex items-center justify-center gap-2 px-3 h-9 border border-border bg-card hover:bg-muted transition-colors rounded-md"
        >
          <GitHubLight className="h-4 w-4 dark:hidden" />
          <GitHubDark className="h-4 w-4 hidden dark:block" />
          <span className="text-sm text-foreground">Star on GitHub</span>
        </button>

        <ThemeToggle className="rounded-full w-9 h-9" />

        <button className="hover:bg-muted rounded-full border border-border bg-card transition-colors flex items-center justify-center w-9 h-9">
          <IconBell className="h-4 w-4 text-foreground" />
        </button>
      </div>
    </header>
  );
}
