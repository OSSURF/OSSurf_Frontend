import { useState, useEffect, useMemo } from "react";
import { useOutletContext, useSearchParams } from "react-router-dom";
import { GitHubRepoCard, type RepoData } from "@/components/github-repo-card";
import { fetchDiscoverRepos } from "@/api/repos";

const DISCOVER_PER_PAGE = 30;

interface ReposContextType {
  language: string;
  sort: string;
  search: string;
  setAllLanguages: (langs: string[]) => void;
}

export default function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const context = useOutletContext<ReposContextType>();
  const { language, sort, search, setAllLanguages } = context;
  const page = Math.max(1, Number(searchParams.get("page") || 1));

  const [repos, setRepos] = useState<RepoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);

  const processedRepos = useMemo(() => {
    let filtered = repos;

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter((repo) => {
        const matchName = repo.repo_name.toLowerCase().includes(q);
        const matchOwner = repo.owner.toLowerCase().includes(q);
        const matchDesc = repo.description?.toLowerCase().includes(q);
        const matchTags = repo.tags?.some((t) => t.toLowerCase().includes(q));
        return matchName || matchOwner || matchDesc || matchTags;
      });
    }

    const sorted = [...filtered].sort((a, b) => {
      if (sort === "stars") return b.stargazers_count - a.stargazers_count;
      if (sort === "forks") return b.forks_count - a.forks_count;
      if (sort === "issues")
        return (b.open_issue_count || 0) - (a.open_issue_count || 0);
      return 0;
    });

    return sorted;
  }, [repos, search, sort]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const apiSort = sort === "forks" ? "forks" : "stars";
        const result = await fetchDiscoverRepos({
          sort: apiSort,
          page,
          perPage: DISCOVER_PER_PAGE,
          language,
        });

        const mappedRepos: RepoData[] = result.items.map((item) => ({
          owner: item.owner.login,
          repo_name: item.name,
          description: item.description,
          language: item.language,
          stargazers_count: item.stargazers_count,
          forks_count: item.forks_count,
          watchers_count: item.watchers_count,
          open_issue_count: item.open_issues_count,
          tags: item.topics ?? [],
          avatarUrl: item.owner.avatar_url ?? null,
          stars_earned: null,
        }));

        const uniqueRepos = mappedRepos.filter(
          (repo, index, self) =>
            index ===
            self.findIndex(
              (r) => r.owner === repo.owner && r.repo_name === repo.repo_name,
            ),
        );

        if (language === "all") {
          const languages = new Set<string>();
          uniqueRepos.forEach((repo) => {
            if (repo.language) languages.add(repo.language);
          });
          setAllLanguages(Array.from(languages).sort());
        }

        setRepos(uniqueRepos);
        setTotalPages(result.totalPages);
      } catch (error) {
        console.error("Failed to fetch discover repos:", error);
        setRepos([]);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [language, page, setAllLanguages, sort]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

  const updatePage = (nextPage: number) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);

      if (nextPage <= 1) {
        next.delete("page");
      } else {
        next.set("page", String(nextPage));
      }

      return next;
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          Array.from({ length: 9 }).map((_, i) => (
            <div
              key={i}
              className="h-[180px] w-full animate-pulse border bg-muted/20"
            />
          ))
        ) : processedRepos.length === 0 ? (
          <div className="col-span-full py-20 text-center text-muted-foreground">
            <p>No repositories found matching your criteria.</p>
          </div>
        ) : (
          processedRepos.map((repo) => (
            <GitHubRepoCard
              key={`${repo.owner}/${repo.repo_name}`}
              repo={repo}
            />
          ))
        )}
      </div>

      <div className="flex items-center justify-between border-t border-border/60 pt-4">
        <button
          type="button"
          onClick={() => updatePage(Math.max(1, page - 1))}
          className="h-9 px-3 border border-border bg-card text-sm text-foreground disabled:opacity-50"
          disabled={page <= 1 || loading}
        >
          Previous
        </button>

        <span className="text-sm text-muted-foreground">
          Page {page} of {totalPages}
        </span>

        <button
          type="button"
          onClick={() => updatePage(Math.min(totalPages, page + 1))}
          className="h-9 px-3 border border-border bg-card text-sm text-foreground disabled:opacity-50"
          disabled={page >= totalPages || loading}
        >
          Next
        </button>
      </div>
    </div>
  );
}
