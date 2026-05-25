import { useEffect, useState, useMemo } from "react";
import { Link as RouterLink, useSearchParams } from "react-router-dom";
import {
  GitMerge,
  GitPullRequest,
  WarningCircle,
  UserCircle,
} from "phosphor-react";
import { fetchContributorsRankings, type ContributorRanking } from "@/api/contributors";

export default function ContributorsPage() {
  const [rankings, setRankings] = useState<ContributorRanking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();

  const search = searchParams.get("search")?.toLowerCase().trim() ?? "";

  useEffect(() => {
    fetchContributorsRankings()
      .then((data) => {
        setRankings(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const filteredRankings = useMemo(() => {
    if (!search) return rankings;
    return rankings.filter(
      (c) =>
        c.name.toLowerCase().includes(search) ||
        c.username.toLowerCase().includes(search)
    );
  }, [rankings, search]);

  if (loading) {
    return (
      <div className="flex-1 overflow-y-auto w-full bg-background font-geist">
        <section className="px-6 md:px-10 py-8 max-w-[1600px] mx-auto">
          <div className="space-y-6">
            <div className="space-y-2">
              <h1 className="text-3xl tracking-tight font-serif-instrument">
                Top Contributors
              </h1>
              <p className="text-muted-foreground">
                See the most active open source contributors in our community.
              </p>
            </div>

            <div className="w-full space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="h-28 w-full animate-pulse border border-border bg-muted/15"
                />
              ))}
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto w-full bg-background font-geist">
      <section className="px-6 md:px-10 py-8 max-w-[1600px] mx-auto">
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl tracking-tight font-serif-instrument">
              Top Contributors
            </h1>
            <p className="text-muted-foreground">
              See the most active open source contributors in our community.
            </p>
          </div>

          <div className="w-full">
            {filteredRankings.length === 0 ? (
              <div className="py-20 text-center text-muted-foreground border border-dashed border-border p-8">
                <p className="text-sm">No contributors found matching your search.</p>
              </div>
            ) : (
              <ul className="space-y-4">
                {filteredRankings.map((contributor, idx) => (
                  <RouterLink
                    key={contributor.id}
                    to={`/profile/${encodeURIComponent(contributor.username)}`}
                    className={`flex items-center gap-3 sm:gap-6 p-3 sm:p-5 md:p-6 rounded-none border bg-card transition-colors hover:bg-muted/30 ${
                      idx === 0 ? "border-foreground/30" : "border-border"
                    }`}
                  >
                    <span className="flex items-center justify-center w-5 sm:w-8 shrink-0 select-none">
                      <span
                        className={`text-base sm:text-lg md:text-2xl ${
                          idx === 0 ? "text-foreground font-normal" : "text-muted-foreground font-light"
                        }`}
                      >
                        {idx + 1}
                      </span>
                    </span>
                    {contributor.avatarUrl ? (
                      <img
                        src={contributor.avatarUrl}
                        alt={contributor.name}
                        className="size-10 sm:size-14 md:size-16 rounded-none border border-border object-cover shrink-0"
                        loading="eager"
                      />
                    ) : (
                      <UserCircle className="size-10 sm:size-14 md:size-16 text-muted-foreground animate-none shrink-0" />
                    )}
                    <div className="flex-1 flex flex-col min-w-0 justify-center">
                      <span className="font-semibold text-sm sm:text-base md:text-xl text-foreground truncate leading-snug">
                        {contributor.name}
                      </span>
                      {contributor.bio && (
                        <p className="hidden md:block text-[10px] sm:text-xs text-muted-foreground/80 mt-1 line-clamp-1">
                          {contributor.bio}
                        </p>
                      )}
                    </div>

                    {/* Detailed stats columns - visible on desktop, hidden on mobile */}
                    <div className="hidden md:flex items-center gap-14 ml-auto shrink-0 pr-2">
                      <div className="flex flex-col items-center justify-center min-w-[70px] text-center gap-1">
                        <span className="flex items-center gap-1.5 text-foreground font-semibold text-lg leading-none">
                          <GitMerge size={16} className="text-muted-foreground" />
                          {contributor.mergedPRs}
                        </span>
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                          Merged
                        </span>
                      </div>
                      <div className="flex flex-col items-center justify-center min-w-[70px] text-center gap-1">
                        <span className="flex items-center gap-1.5 text-foreground font-semibold text-lg leading-none">
                          <GitPullRequest size={16} className="text-muted-foreground" />
                          {contributor.openPRs}
                        </span>
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                          Open
                        </span>
                      </div>
                      <div className="flex flex-col items-center justify-center min-w-[70px] text-center gap-1">
                        <span className="flex items-center gap-1.5 text-foreground font-semibold text-lg leading-none">
                          <WarningCircle size={16} className="text-muted-foreground" />
                          {contributor.issues}
                        </span>
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                          Issues
                        </span>
                      </div>
                    </div>

                    {/* Compact Score block - visible only on mobile/small screens, hidden on desktop */}
                    <div className="flex md:hidden items-center ml-auto shrink-0 pr-2">
                      <div className="flex flex-col items-center justify-center min-w-[60px] text-center gap-1">
                        <span className="text-foreground font-semibold text-lg leading-none">
                          {contributor.score}
                        </span>
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                          Score
                        </span>
                      </div>
                    </div>
                  </RouterLink>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
