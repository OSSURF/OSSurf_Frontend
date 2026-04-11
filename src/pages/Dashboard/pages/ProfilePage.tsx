import { useState } from "react";
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
  ExternalLink,
  Check,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

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
  } catch {}
  return { github: "", twitter: "", linkedin: "", website: "", custom: [] };
}

function saveLinks(l: StoredLinks) {
  localStorage.setItem(LINKS_KEY, JSON.stringify(l));
}

// ─── Design tokens (mirror OverviewPage) ─────────────────────────────────────

const CARD = "flex flex-col bg-card border border-dashed border-border rounded-none shadow-none";
const DASH_DIVIDER = "border-b border-dashed border-border";

// ─── Sub-components ───────────────────────────────────────────────────────────

function LinkPill({ icon, href, label }: { icon: React.ReactNode; href: string; label: string }) {
  const full = href.startsWith("http") ? href : `https://${href}`;
  return (
    <a
      href={full}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 text-xs text-muted-foreground border border-dashed border-border px-3 py-1 hover:text-foreground hover:border-foreground/30 transition-colors group"
    >
      {icon}
      <span>{label}</span>
      <ExternalLink size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
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
    <div className={cn("flex items-center gap-2 bg-background border border-dashed border-border px-3 py-2")}>
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

// ─── Edit Modal ───────────────────────────────────────────────────────────────

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
              className="w-full bg-background border border-dashed border-border px-3 py-2 text-sm focus:outline-none placeholder:text-muted-foreground/40 font-geist"
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
                    className="w-20 bg-background border border-dashed border-border px-2 py-2 text-sm focus:outline-none font-geist"
                  />
                  <input
                    value={c.url}
                    onChange={(e) => updateCustom(idx, "url", e.target.value)}
                    placeholder="https://..."
                    className="flex-1 bg-background border border-dashed border-border px-2 py-2 text-sm focus:outline-none font-geist"
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

        <div className={cn("flex items-center justify-end gap-2 px-5 py-3 border-t border-dashed border-border")}>
          <button onClick={onClose} className="px-3 py-1.5 text-sm border border-dashed border-border hover:bg-muted transition-colors font-geist">
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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const { data: session, isPending } = authClient.useSession();

  const user = session?.user;
  const displayName = user?.name ?? user?.email?.split("@")[0] ?? "User";

  const [links, setLinks] = useState<StoredLinks>(loadLinks);
  const [editOpen, setEditOpen] = useState(false);

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
  if (links.github) allLinks.push({ icon: <Github size={12} />, href: links.github, label: "GitHub" });
  if (links.twitter) allLinks.push({ icon: <Twitter size={12} />, href: links.twitter, label: "Twitter" });
  if (links.linkedin) allLinks.push({ icon: <Linkedin size={12} />, href: links.linkedin, label: "LinkedIn" });
  if (links.website) allLinks.push({ icon: <Globe size={12} />, href: links.website, label: "Website" });
  links.custom.forEach((c) => allLinks.push({ icon: <Link2 size={12} />, href: c.url, label: c.label }));

  if (isPending) {
    return (
      <div className="flex-1 overflow-y-auto overflow-x-hidden w-full bg-background font-geist">
        <div className="max-w-5xl mx-auto space-y-0">
          <div className={cn(CARD, "px-0")}>
            <div className={cn("flex items-center gap-4 p-6", DASH_DIVIDER)}>
              <div className="size-24 shrink-0 rounded-xl bg-muted animate-pulse" />
              <div className="flex flex-col gap-3 flex-1">
                <div className="h-8 w-48 rounded bg-muted animate-pulse" />
                <div className="h-3.5 w-32 rounded bg-muted animate-pulse" />
              </div>
            </div>
            <div className="p-6 space-y-3">
              {[0, 1, 2].map((i) => <div key={i} className="h-10 rounded bg-muted/40 animate-pulse" />)}
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

          {/* ── Profile Header ─────────────────────────────────────────────── */}
          <div className={cn(CARD, "px-0")}>
            <div
              className="relative flex w-full gap-4 p-6 border-b border-dashed border-border"
              style={{
                backgroundImage: `repeating-linear-gradient(to bottom, hsl(var(--border)) 0px, hsl(var(--border)) 6px, transparent 6px, transparent 14px), repeating-linear-gradient(to bottom, hsl(var(--border)) 0px, hsl(var(--border)) 6px, transparent 6px, transparent 14px)`,
                backgroundSize: "1px 100%, 1px 100%",
                backgroundPosition: "left top, right top",
                backgroundRepeat: "no-repeat",
              }}
            >
              {/* Avatar */}
              <div className="relative flex items-center md:size-24 size-20 shrink-0">
                {user?.image ? (
                  <img
                    src={user.image}
                    alt={displayName}
                    className="absolute inset-0 h-full w-full rounded-xl border border-solid p-0.5 object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center rounded-xl border border-border bg-muted text-2xl font-semibold text-muted-foreground select-none">
                    {displayName.slice(0, 2).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Info */}
              <div
                className="flex flex-1 flex-col justify-end pl-2 animate-fade-in-blur"
                style={{ animationDelay: "0.1s", animationFillMode: "both" }}
              >
                <h1 className="font-normal tracking-tight text-foreground sm:text-4xl text-3xl font-serif-instrument leading-tight">
                  {displayName}
                </h1>
                <p className="text-sm text-muted-foreground mt-0.5">{user?.email}</p>
                {allLinks.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {allLinks.map((l, i) => <LinkPill key={i} {...l} />)}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col items-end justify-start gap-2 shrink-0">
                <button
                  id="edit-profile-btn"
                  onClick={() => setEditOpen(true)}
                  className="flex items-center gap-1.5 text-sm px-3 py-1.5 border border-dashed border-border hover:bg-muted transition-colors font-geist"
                >
                  <Pencil size={13} />
                  Edit Profile
                </button>
              </div>
            </div>
          </div>

          {/* ── Account Details ─────────────────────────────────────────────── */}
          <div className="py-6">
            <div className={cn(CARD, "px-0")}>
              <div className={cn("px-4 py-3", DASH_DIVIDER)}>
                <span className="text-sm font-medium font-geist">Account</span>
              </div>
              {[
                { label: "Email", value: user?.email ?? "—" },
                { label: "Account type", value: "GitHub OAuth" },
                {
                  label: "Member since",
                  value: user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })
                    : "—",
                },
              ].map(({ label, value }, i, arr) => (
                <div
                  key={label}
                  className={cn("flex items-center justify-between px-4 py-3 hover:bg-muted/60 dark:hover:bg-muted/20 transition-colors", i < arr.length - 1 && DASH_DIVIDER)}
                >
                  <span className="text-sm text-muted-foreground font-geist">{label}</span>
                  <span className="text-sm font-geist">{value}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
