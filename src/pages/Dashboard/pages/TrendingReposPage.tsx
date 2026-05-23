import { useState, useEffect, useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import { GitHubRepoCard, type RepoData } from "@/components/github-repo-card";
import { fetchTrendingRepos } from "@/api/repos";
import { API_BASE_URL } from "@/api/config";

interface ReposContextType {
  language: string;
  sort: string;
  period: string;
  search: string;
  setAllLanguages: (langs: string[]) => void;
}

export default function TrendingReposPage() {
  const context = useOutletContext<ReposContextType>();
  const { language, sort, period, search, setAllLanguages } = context;

  const [repos, setRepos] = useState<RepoData[]>([]);
  const [loading, setLoading] = useState(true);

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

    if (language !== "all") {
      filtered = filtered.filter(
        (repo) => repo.language?.toLowerCase() === language.toLowerCase(),
      );
    }

    const sorted = [...filtered].sort((a, b) => {
      if (sort === "stars") return (b.stars_earned || 0) - (a.stars_earned || 0);
      if (sort === "forks") return b.forks_count - a.forks_count;
      if (sort === "issues")
        return (b.open_issue_count || 0) - (a.open_issue_count || 0);
      return 0;
    });

    return sorted;
  }, [repos, search, language, sort]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        console.log("LOCAL DEV: Fetching trending from:", `${API_BASE_URL}/api/trending?period=${period}`);
        const result = await fetchTrendingRepos(period);
        console.log("LOCAL DEV: Received data:", result);

        const mappedRepos: RepoData[] = result.data.map((item) => ({
          owner: item.owner,
          repo_name: item.repo_name,
          description: item.description ?? null,
          language: item.language ?? null,
          stargazers_count: item.stargazers_count ?? 0,
          forks_count: item.forks_count ?? 0,
          watchers_count: item.watchers_count ?? null,
          open_issue_count: item.open_issues_count ?? null,
          tags: item.tags ?? [],
          avatarUrl: item.avatar_url ?? null,
          stars_earned: item.stars_earned ?? null,
        }));

        const uniqueRepos = mappedRepos.filter(
          (repo, index, self) =>
            index ===
            self.findIndex(
              (r) => r.owner === repo.owner && r.repo_name === repo.repo_name,
            ),
        );

        const languages = new Set<string>();
        uniqueRepos.forEach((repo) => {
          if (repo.language) languages.add(repo.language);
        });
        setAllLanguages(Array.from(languages).sort());

        setRepos(uniqueRepos);
      } catch (error) {
        console.error("Failed to fetch trending repos:", error);
        setRepos([]);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [period, setAllLanguages]);

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
              period={period}
            />
          ))
        )}
      </div>
    </div>
  );
}
