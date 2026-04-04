import React, { useEffect, useState } from "react";
import {
  Trophy,
  GitMerge,
  GitPullRequest,
  WarningCircle,
  UserCircle,
} from "phosphor-react";

interface ContributorRanking {
  id: string;
  name: string;
  avatarUrl: string;
  score: number;
  mergedPRs: number;
  openPRs: number;
  issues: number;
}

const ContributorsRanking: React.FC = () => {
  const [rankings, setRankings] = useState<ContributorRanking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/contributors/rankings")
      .then((res) => res.json())
      .then((data) => {
        setRankings(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="text-primary">Loading...</div>;

  return (
    <div className="contributors-ranking w-full max-w-2xl mx-auto bg-card rounded-xl shadow-lg p-6 border border-border">
      <h2 className="text-2xl font-bold mb-6 text-primary">Top Contributors</h2>
      <ul className="space-y-4">
        {rankings.map((contributor, idx) => (
          <li
            key={contributor.id}
            className={`flex items-center gap-4 p-4 rounded-lg ${idx === 0 ? "bg-primary/10 border-2 border-primary" : "bg-muted border border-border"} transition`}
          >
            <span
              className={`text-xl font-bold w-8 text-center ${idx === 0 ? "text-primary" : "text-muted-foreground"}`}
            >
              #{idx + 1}
            </span>
            {contributor.avatarUrl ? (
              <img
                src={contributor.avatarUrl}
                alt={contributor.name}
                className="w-12 h-12 rounded-full border-2 border-primary object-cover"
                loading="eager"
              />
            ) : (
              <UserCircle size={48} className="text-muted-foreground" />
            )}
            <span className="flex-1 font-medium text-lg text-foreground">
              {contributor.name}
            </span>
            <span className="flex items-center gap-1 text-primary font-semibold">
              <Trophy
                size={22}
                weight={idx === 0 ? "fill" : "regular"}
                className="mr-1"
              />
              {contributor.score}
            </span>
            <span className="flex items-center gap-1 text-green-600">
              <GitMerge size={20} weight="bold" />
              {contributor.mergedPRs}
            </span>
            <span className="flex items-center gap-1 text-blue-600">
              <GitPullRequest size={20} weight="bold" />
              {contributor.openPRs}
            </span>
            <span className="flex items-center gap-1 text-yellow-600">
              <WarningCircle size={20} weight="bold" />
              {contributor.issues}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ContributorsRanking;
