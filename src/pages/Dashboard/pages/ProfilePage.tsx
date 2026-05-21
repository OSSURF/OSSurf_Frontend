import { useState, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import {
  Pencil,
  X,
  Plus,
  Trash2,
  Github,
  Twitter,
  Linkedin,
  Globe,
  Link2,
  Check,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import {
  fetchDashboard,
  fetchProfile,
  type ProfileResponse,
  type DashboardResponse,
} from "@/api/profile";
import { GitHubContributionGraph } from "../components/github-contributions/graph";
import { AreaChart, Area, CartesianGrid, XAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { LanguageBarChart } from "./OverviewPage";


type CustomLink = { label: string; url: string };
type StoredLinks = {
  github: string;
  twitter: string;
  linkedin: string;
  website: string;
  custom: CustomLink[];
};

const LINKS_KEY = "ss_profile_links";

function loadLinks(): StoredLinks {
  try {
    const raw = localStorage.getItem(LINKS_KEY);
    if (raw) return JSON.parse(raw) as StoredLinks;
  } catch { }
  return { github: "", twitter: "", linkedin: "", website: "", custom: [] };
}

function saveLinks(l: StoredLinks) {
  localStorage.setItem(LINKS_KEY, JSON.stringify(l));
}


const CARD = "flex flex-col bg-card border border-solid border-border rounded-none shadow-none";
const DASH_DIVIDER = "border-b border-solid border-border";


function LinkPill({ icon, href, label }: { icon: React.ReactNode; href: string; label: string }) {
  const full = href.startsWith("http") ? href : `https://${href}`;
  return (
    <a
      href={full}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 text-[14px] text-muted-foreground hover:text-foreground transition-colors group"
    >
      {icon}
      <span>{label}</span>
    </a>
  );
}

function InlineInput({
  icon,
  placeholder,
  value,
  onChange,
}: {
  icon: React.ReactNode;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className={cn("flex items-center gap-2 bg-background border border-solid border-border px-3 py-2")}>
      <span className="text-muted-foreground shrink-0">{icon}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 bg-transparent text-sm focus:outline-none placeholder:text-muted-foreground/40 font-geist"
      />
    </div>
  );
}


function EditModal({
  open,
  onClose,
  displayName,
  links,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  displayName: string;
  links: StoredLinks;
  onSave: (name: string, links: StoredLinks) => Promise<void>;
}) {
  const [name, setName] = useState(displayName);
  const [editLinks, setEditLinks] = useState<StoredLinks>(links);
  const [custom, setCustom] = useState<CustomLink[]>(links.custom);
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  function updateCustom(idx: number, field: "label" | "url", val: string) {
    setCustom((prev) => prev.map((c, i) => (i === idx ? { ...c, [field]: val } : c)));
  }

  async function handleSave() {
    setSaving(true);
    const newLinks: StoredLinks = {
      ...editLinks,
      custom: custom.filter((c) => c.label.trim() && c.url.trim()),
    };
    await onSave(name.trim(), newLinks);
    setSaving(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className={cn("relative z-10 w-full max-w-md mx-4 shadow-2xl", CARD)}>
        <div className={cn("flex items-center justify-between px-5 py-4", DASH_DIVIDER)}>
          <span className="text-sm font-medium font-geist">Edit Profile</span>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4 max-h-[65vh] overflow-y-auto">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide font-geist">
              Display Name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full bg-background border border-solid border-border px-3 py-2 text-sm focus:outline-none placeholder:text-muted-foreground/40 font-geist"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide font-geist">
              Links
            </label>
            <div className="space-y-2">
              <InlineInput icon={<Github size={14} />} placeholder="github.com/username" value={editLinks.github} onChange={(v) => setEditLinks((p) => ({ ...p, github: v }))} />
              <InlineInput icon={<Twitter size={14} />} placeholder="twitter.com/username" value={editLinks.twitter} onChange={(v) => setEditLinks((p) => ({ ...p, twitter: v }))} />
              <InlineInput icon={<Linkedin size={14} />} placeholder="linkedin.com/in/username" value={editLinks.linkedin} onChange={(v) => setEditLinks((p) => ({ ...p, linkedin: v }))} />
              <InlineInput icon={<Globe size={14} />} placeholder="yourwebsite.com" value={editLinks.website} onChange={(v) => setEditLinks((p) => ({ ...p, website: v }))} />
            </div>
          </div>

          {custom.length > 0 && (
            <div className="space-y-2">
              {custom.map((c, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <input
                    value={c.label}
                    onChange={(e) => updateCustom(idx, "label", e.target.value)}
                    placeholder="Label"
                    className="w-20 bg-background border border-solid border-border px-2 py-2 text-sm focus:outline-none font-geist"
                  />
                  <input
                    value={c.url}
                    onChange={(e) => updateCustom(idx, "url", e.target.value)}
                    placeholder="https://..."
                    className="flex-1 bg-background border border-solid border-border px-2 py-2 text-sm focus:outline-none font-geist"
                  />
                  <button onClick={() => setCustom((p) => p.filter((_, i) => i !== idx))} className="text-muted-foreground hover:text-destructive transition-colors p-1">
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={() => setCustom((p) => [...p, { label: "", url: "" }])}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors font-geist"
          >
            <Plus size={12} />
            Add custom link
          </button>
        </div>

        <div className={cn("flex items-center justify-end gap-2 px-5 py-3 border-t border-solid border-border")}>
          <button onClick={onClose} className="px-3 py-1.5 text-sm border border-solid border-border hover:bg-muted transition-colors font-geist">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-foreground text-background hover:opacity-80 transition-opacity disabled:opacity-50 font-geist"
          >
            {saving ? "Saving..." : <><Check size={13} /> Save</>}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { data: session, isPending } = authClient.useSession();

  const user = session?.user;
  const displayName = user?.name ?? user?.email?.split("@")[0] ?? "User";

  const [links, setLinks] = useState<StoredLinks>(loadLinks);
  const [editOpen, setEditOpen] = useState(false);

  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    async function loadStats() {
      setLoadingStats(true);
      try {
        const dashData = await fetchDashboard();
        setDashboard(dashData);

        const username = dashData.stats.user.username;
        if (username) {
          try {
            const profileData = await fetchProfile(username);
            setProfile(profileData);
          } catch (profileErr) {
            console.error("Profile fetch failed:", profileErr);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingStats(false);
      }
    }
    loadStats();
  }, []);

  const calendarData = useMemo(() => {
    if (dashboard?.stats?.user?.contributionCalendar?.length) {
      return dashboard.stats.user.contributionCalendar;
    }
    if (profile?.graphs?.contributionCalendar?.length) {
      return profile.graphs.contributionCalendar;
    }
    return [];
  }, [dashboard, profile]);

  const PINNED_REPOS = [
    {
      name: "Portfolio",
      description: "A modern, responsive portfolio website built with Next.js 15, TypeScript, Tailwind CSS, and Shadcn UI.",
      lang: "TypeScript",
      langColor: "#3178c6",
      stars: 2,
      forks: 1,
    },
    {
      name: "sourcesuf-backend",
      description: "Backend API for SourceSurf - source discovery and curation platform",
      lang: "TypeScript",
      langColor: "#3178c6",
      stars: 1,
      forks: 0,
    },
    {
      name: "oss-trends-scraper",
      description: "A Dockerized Python microservice that scrapes GitHub Trending repositories daily and syncs metadata to the...",
      lang: "Python",
      langColor: "#3572A5",
      stars: 0,
      forks: 0,
    },
    {
      name: "Quorum",
      description: "A QA platform for developers",
      lang: "TypeScript",
      langColor: "#3178c6",
      stars: 0,
      forks: 0,
    }
  ];

  async function handleSave(name: string, newLinks: StoredLinks) {
    try {
      if (name && name !== displayName) await authClient.updateUser({ name });
      saveLinks(newLinks);
      setLinks(newLinks);
      toast.success("Profile updated");
    } catch {
      toast.error("Failed to save changes");
    }
  }

  const allLinks: { icon: React.ReactNode; href: string; label: string }[] = [];
  if (links.twitter) allLinks.push({ icon: <Twitter size={12} />, href: links.twitter, label: "Twitter" });
  if (links.linkedin) allLinks.push({ icon: <Linkedin size={12} />, href: links.linkedin, label: "LinkedIn" });
  if (links.website) allLinks.push({ icon: <Globe size={12} />, href: links.website, label: "Website" });
  links.custom.forEach((c) => allLinks.push({ icon: <Link2 size={12} />, href: c.url, label: c.label }));

  const activityHistory = profile?.graphs?.activityHistory ?? [];
  const monthlyActivityData = activityHistory.map((item: any) => ({
    month: item.month,
    prs: item.prs,
    issues: item.issues,
    total: item.prs + item.issues,
  }));

  const displayMonthlyActivityData = monthlyActivityData.some(
    (item: any) => item.total > 0,
  )
    ? monthlyActivityData
    : activityHistory.length
      ? activityHistory.map((item: any, index: number) => ({
        month: item.month,
        prs: 2 + (index % 4),
        issues: 1 + (index % 3),
        total: 3 + (index % 4) + (index % 3),
      }))
      : [
        { month: "Mar", prs: 3, issues: 2, total: 5 },
        { month: "Apr", prs: 4, issues: 1, total: 5 },
        { month: "May", prs: 5, issues: 2, total: 7 },
        { month: "Jun", prs: 4, issues: 3, total: 7 },
        { month: "Jul", prs: 3, issues: 2, total: 5 },
        { month: "Aug", prs: 6, issues: 2, total: 8 },
        { month: "Sep", prs: 5, issues: 1, total: 6 },
        { month: "Oct", prs: 4, issues: 2, total: 6 },
        { month: "Nov", prs: 5, issues: 2, total: 7 },
        { month: "Dec", prs: 6, issues: 3, total: 9 },
        { month: "Jan", prs: 4, issues: 2, total: 6 },
        { month: "Feb", prs: 3, issues: 1, total: 4 },
      ];

  const languageColors = [
    "#6366f1",
    "#22d3ee",
    "#10b981",
    "#eab308",
    "#f97316",
  ];
  const languageData = (profile?.graphs?.languages ?? []).map((lang: any, idx: number) => ({
    name: lang.langName,
    value: lang.value,
    fill: languageColors[idx % languageColors.length],
  }));
  const displayLanguageData = languageData.length
    ? languageData
    : [
      { name: "TypeScript", value: 42, fill: languageColors[0] },
      { name: "Assembly", value: 18, fill: languageColors[1] },
      { name: "Perl", value: 14, fill: languageColors[2] },
      { name: "Python", value: 13, fill: languageColors[3] },
      { name: "Lua", value: 13, fill: languageColors[4] },
    ];

  const activityChartConfig: ChartConfig = {
    prs: { label: "Pull Requests", color: "var(--chart-1)" },
    issues: { label: "Issues", color: "var(--chart-2)" },
  };

  const latestMonthActivity = displayMonthlyActivityData[displayMonthlyActivityData.length - 1];
  const now = new Date();
  const currentMonthKey = `${now.getFullYear()}-${String(
    now.getMonth() + 1,
  ).padStart(2, "0")}`;
  const commitsThisMonth = calendarData.reduce((sum: number, item: any) => {
    if (!item.date.startsWith(currentMonthKey)) return sum;
    return sum + item.count;
  }, 0);
  const statCards = [
    {
      key: "totalCommits",
      label: "Total Commits",
      value: profile?.stats.totalCommits ?? 0,
      monthCount: commitsThisMonth,
    },
    {
      key: "totalIssues",
      label: "Total Issues",
      value:
        profile?.stats.totalIssues ??
        dashboard?.stats.user.totalIssuesCreated ??
        0,
      monthCount: latestMonthActivity?.issues ?? 0,
    },
    {
      key: "totalPrs",
      label: "Total PRs",
      value:
        profile?.stats.totalPrs ?? dashboard?.stats.user.totalPrsCreated ?? 0,
      monthCount: latestMonthActivity?.prs ?? 0,
    },
    {
      key: "totalReviews",
      label: "Total Reviews",
      value: profile?.stats.totalReviews ?? 0,
      monthCount: 0,
    },
  ];

  if (isPending || loadingStats) {
    return (
      <div className="flex-1 overflow-y-auto overflow-x-hidden w-full bg-background font-geist">
        <div className="max-w-5xl mx-auto space-y-0">

          <div className="px-6 sm:px-0 pt-6 pb-6 relative flex flex-col items-start w-full bg-transparent">
            <div className="md:size-[104px] size-24 shrink-0 border border-solid border-border bg-muted animate-pulse mb-4 z-10" />
            <div className="mt-3 flex w-full flex-col gap-2">
              <div className="h-6 w-48 rounded bg-muted animate-pulse" />
              <div className="h-4 w-32 rounded bg-muted animate-pulse" />
              <div className="h-4 w-24 rounded bg-muted animate-pulse mt-3" />
            </div>
          </div>

          <div className="w-full h-px bg-border max-w-5xl"></div>

          <div className="pt-6 pb-3 px-6 sm:px-0">
            <div className="w-full h-[180px] bg-card border border-solid border-border/80 p-4 overflow-hidden relative">
              <div className="absolute inset-0 bg-muted/20 animate-pulse" />
            </div>
          </div>

          <div className="py-3 px-6 sm:px-0">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="flex flex-col bg-card border border-solid border-border/80 p-4 justify-start">
                  <div className="h-3.5 w-24 rounded bg-muted animate-pulse" />
                  <div className="h-6 w-16 rounded bg-muted animate-pulse mt-5" />
                </div>
              ))}
            </div>
          </div>

          <div className="py-3 px-6 sm:px-0">
            <div className="h-4 w-12 rounded bg-muted animate-pulse mb-4" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-[120px] bg-card border border-solid border-border/80 p-4 relative overflow-hidden">
                  <div className="absolute inset-0 bg-muted/10 animate-pulse" />
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    );
  }

  return (
    <>
      <EditModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        displayName={displayName}
        links={links}
        onSave={handleSave}
      />

      <div className="flex-1 overflow-y-auto overflow-x-hidden w-full bg-background font-geist">
        <div className="max-w-5xl space-y-0 mx-auto">

          <div className="px-6 sm:px-0 pt-6 pb-6 relative flex flex-col items-start w-full bg-transparent">
            <div className="relative flex items-center md:size-[104px] size-24 shrink-0 rounded-none border border-solid border-border bg-background shadow-none z-10 box-content mb-4">
              {user?.image ? (
                <img
                  src={user.image}
                  alt={displayName}
                  className="absolute inset-0 h-full w-full rounded-none object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center rounded-none bg-muted text-3xl font-semibold text-muted-foreground select-none">
                  {displayName.slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>

            <div className="absolute right-6 sm:right-0 top-6 flex shrink-0 items-center justify-end">
              <button
                id="edit-profile-btn"
                onClick={() => setEditOpen(true)}
                className="flex items-center justify-center size-[34px] rounded-none hover:bg-muted transition-colors text-muted-foreground hover:text-foreground border border-solid border-border"
              >
                <Pencil size={15} />
              </button>
            </div>

            <div
              className="mt-3 flex w-full flex-col animate-fade-in-blur"
              style={{ animationDelay: "0.1s", animationFillMode: "both" }}
            >
              <h1 className="font-semibold tracking-tight text-foreground sm:text-[22px] text-[20px] font-geist leading-none">
                {displayName}
              </h1>
              <p className="text-[14px] text-muted-foreground mt-1.5 font-geist">
                @{links.github ? links.github.split("/").pop() : dashboard?.stats?.user?.username || "username"}
                {" · "}
                Joined {user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "October 2023"}
              </p>

              <p className="mt-4 text-[14px] text-foreground font-geist">
                I use vim btw
              </p>

              {allLinks.length > 0 && (
                <div className="flex flex-wrap gap-x-4 gap-y-2 mt-4 text-[14px]">
                  {allLinks.map((l, i) => (
                    <LinkPill key={i} {...l} />
                  ))}
                </div>
              )}

              <div className="flex items-center gap-3 mt-4 text-[14px] text-muted-foreground">
                {profile?.user ? (
                  <>
                    <span className="flex items-center gap-1.5">
                      <svg className="size-[15px] text-muted-foreground" aria-hidden="true" viewBox="0 0 16 16" version="1.1" fill="currentColor">
                        <path d="M2 5.5a3.5 3.5 0 1 1 5.898 2.549 5.508 5.508 0 0 1 3.034 4.084.75.75 0 1 1-1.482.235 4 4 0 0 0-7.9 0 .75.75 0 0 1-1.482-.236A5.507 5.507 0 0 1 3.102 8.05 3.493 3.493 0 0 1 2 5.5ZM11 4a3.001 3.001 0 0 1 2.22 5.018 5.01 5.01 0 0 1 2.56 3.012.749.749 0 0 1-.885.954.752.752 0 0 1-.549-.514 3.507 3.507 0 0 0-2.522-2.372.75.75 0 0 1-.574-.73v-.352a.75.75 0 0 1 .416-.672A1.5 1.5 0 0 0 11 5.5.75.75 0 0 1 11 4Zm-5.5-.5a2 2 0 1 0-.001 3.999A2 2 0 0 0 5.5 3.5Z"></path>
                      </svg>
                      <span className="font-semibold text-foreground">{profile.user.followers}</span> followers
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1.5">
                      <span className="font-semibold text-foreground">{profile.user.following}</span> following
                    </span>
                  </>
                ) : (
                  <>
                    <span className="flex items-center gap-1.5">
                      <svg className="size-[15px] text-muted-foreground" aria-hidden="true" viewBox="0 0 16 16" version="1.1" fill="currentColor">
                        <path d="M2 5.5a3.5 3.5 0 1 1 5.898 2.549 5.508 5.508 0 0 1 3.034 4.084.75.75 0 1 1-1.482.235 4 4 0 0 0-7.9 0 .75.75 0 0 1-1.482-.236A5.507 5.507 0 0 1 3.102 8.05 3.493 3.493 0 0 1 2 5.5ZM11 4a3.001 3.001 0 0 1 2.22 5.018 5.01 5.01 0 0 1 2.56 3.012.749.749 0 0 1-.885.954.752.752 0 0 1-.549-.514 3.507 3.507 0 0 0-2.522-2.372.75.75 0 0 1-.574-.73v-.352a.75.75 0 0 1 .416-.672A1.5 1.5 0 0 0 11 5.5.75.75 0 0 1 11 4Zm-5.5-.5a2 2 0 1 0-.001 3.999A2 2 0 0 0 5.5 3.5Z"></path>
                      </svg>
                      <span className="font-semibold text-foreground">12</span> followers
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1.5">
                      <span className="font-semibold text-foreground">20</span> following
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="w-full h-px bg-border max-w-5xl"></div>

          {calendarData.length > 0 && (
            <div className="pt-6 pb-3 px-6 sm:px-0">
              <div className="flex items-center bg-card border border-solid border-border/80 rounded-none shadow-none p-4 w-full overflow-x-auto">
                <div className="w-full flex justify-center min-w-[700px]">
                  <GitHubContributionGraph data={calendarData} />
                </div>
              </div>
            </div>
          )}

          <div className="py-3 px-6 sm:px-0">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {statCards.map((card) => (
                <div
                  key={card.key}
                  className={cn(CARD, "hover:bg-muted/30 transition-colors border-border/80 p-4 justify-start my-0 shadow-none")}
                >
                  <span className="text-[14px] mt-0 font-medium text-muted-foreground">{card.label}</span>
                  <div className="flex flex-col gap-2 items-start justify-start mt-4">
                    <span className="text-[20px] font-semibold text-foreground">
                      {card.value.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={cn("py-3", calendarData.length === 0 && "mt-4")}>
            <div className="px-6 sm:px-0 mb-4">
              <span className="text-[14px] font-medium text-foreground">Pinned</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-6 sm:px-0">
              {PINNED_REPOS.map((repo) => (
                <div key={repo.name} className={cn(CARD, "justify-between p-4 hover:bg-muted/30 transition-colors border-border/80")}>
                  <div className="flex flex-col gap-2">
                    <a href={`https://github.com/BeyondV0id/${repo.name}`} target="_blank" rel="noopener noreferrer" className="text-[14px] font-semibold text-foreground hover:underline">
                      {repo.name}
                    </a>
                    <p className="text-[12px] text-muted-foreground leading-relaxed line-clamp-3">
                      {repo.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 mt-5">
                    {repo.lang && (
                      <div className="flex items-center gap-1.5">
                        <span className="size-[10px] rounded-full" style={{ backgroundColor: repo.langColor }}></span>
                        <span className="text-[12px] text-muted-foreground">{repo.lang}</span>
                      </div>
                    )}
                    {(repo.stars || 0) > 0 && (
                      <div className="flex items-center gap-1">
                        <svg aria-label="star" role="img" height="14" viewBox="0 0 16 16" version="1.1" width="14" data-view-component="true" className="text-muted-foreground fill-current">
                          <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Zm0 2.445L6.615 5.5a.75.75 0 0 1-.564.41l-3.097.45 2.24 2.184a.75.75 0 0 1 .216.664l-.528 3.084 2.769-1.456a.75.75 0 0 1 .698 0l2.77 1.456-.53-3.084a.75.75 0 0 1 .216-.664l2.24-2.183-3.096-.45a.75.75 0 0 1-.564-.41L8 2.694Z"></path>
                        </svg>
                        <span className="text-[12px] text-muted-foreground">{repo.stars}</span>
                      </div>
                    )}
                    {(repo.forks || 0) > 0 && (
                      <div className="flex items-center gap-1">
                        <svg aria-label="fork" role="img" height="14" viewBox="0 0 16 16" version="1.1" width="14" data-view-component="true" className="text-muted-foreground fill-current">
                          <path d="M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-.878a2.25 2.25 0 1 1 1.5 0v.878a2.25 2.25 0 0 1-2.25 2.25h-1.5v2.128a2.251 2.251 0 1 1-1.5 0V8.5h-1.5A2.25 2.25 0 0 1 3.5 6.25v-.878a2.25 2.25 0 1 1 1.5 0ZM5 3.25a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Zm6.75.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm-3 8.75a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Z"></path>
                        </svg>
                        <span className="text-[12px] text-muted-foreground">{repo.forks}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 px-6 sm:px-0 pt-3 pb-8">
            <LanguageBarChart
              data={displayLanguageData}
              className={cn(CARD, "block p-0 shadow-none w-full")}
            />

            <div className={cn(CARD, "flex-col justify-start items-start gap-0 p-0 block w-full")}>
              <div className="px-4 pt-4 pb-2 w-full">
                <div className="text-[14px] font-medium text-foreground mb-0.5">
                  Monthly Activity
                </div>
                <div className="text-[12px] text-muted-foreground w-full line-clamp-1">
                  PRs and Issues over the last 12 months
                </div>
              </div>
              <div className="px-0 flex-1 w-full pt-2 pb-4">
                <ChartContainer config={activityChartConfig} className="h-[180px] w-full px-2" style={{ maxHeight: 200 }}>
                  <AreaChart
                    accessibilityLayer
                    data={displayMonthlyActivityData}
                    margin={{ left: 12, right: 12, bottom: -10, top: 10 }}
                  >
                    <defs>
                      <linearGradient
                        id="gradient-chart-prs"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="var(--color-prs)"
                          stopOpacity={0.4}
                        />
                        <stop
                          offset="95%"
                          stopColor="var(--color-prs)"
                          stopOpacity={0.1}
                        />
                      </linearGradient>
                      <linearGradient
                        id="gradient-chart-issues"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="var(--color-issues)"
                          stopOpacity={0.4}
                        />
                        <stop
                          offset="95%"
                          stopColor="var(--color-issues)"
                          stopOpacity={0.1}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis
                      dataKey="month"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      tickFormatter={(value) => String(value).slice(0, 3)}
                    />
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent />}
                    />
                    <Area
                      dataKey="prs"
                      fill="url(#gradient-chart-prs)"
                      fillOpacity={0.4}
                      stroke="var(--color-prs)"
                      stackId="a"
                      strokeWidth={0.8}
                      strokeDasharray="3 3"
                    />
                    <Area
                      dataKey="issues"
                      fill="url(#gradient-chart-issues)"
                      fillOpacity={0.4}
                      stroke="var(--color-issues)"
                      stackId="a"
                      strokeWidth={0.8}
                      strokeDasharray="3 3"
                    />
                  </AreaChart>
                </ChartContainer>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
