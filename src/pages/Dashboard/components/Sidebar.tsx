"use client";

import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { cva } from "class-variance-authority";
import { IconUserCircle, type IconProps } from "@tabler/icons-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Logo from "@/components/Logo";
import { Separator } from "@/components/ui/separator";
import { LogOut, X, UserCircle2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";

import Home05Icon from "@/components/ui/svgs/home-05-stroke-rounded";
import Airpod01Icon from "@/components/ui/svgs/airpod-01-stroke-rounded";
import Book02Icon from "@/components/ui/svgs/book-02-stroke-rounded";
import AnalyticsUpIcon from "@/components/ui/svgs/analytics-up-stroke-rounded";
import GitPullRequestIcon from "@/components/ui/svgs/git-pull-request-stroke-rounded";
import DashboardSquare03Icon from "@/components/ui/svgs/dashboard-square-03-stroke-rounded";
import AlertCircleStrokeRounded from "@/components/ui/svgs/AlertCircleStrokeRounded";

interface NavItem {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement> | IconProps>;
  label: string;
  href: string;
}

interface SeparatorItem {
  type: "separator";
}

type Item = NavItem | SeparatorItem;

const items: Item[] = [
  { icon: Home05Icon, label: "Home", href: "/home" },
  { icon: Airpod01Icon, label: "YC-OSS", href: "/yc-oss" },
  { icon: Book02Icon, label: "GSoC Orgs", href: "/gsoc-orgs" },
  { type: "separator" },
  { icon: AnalyticsUpIcon, label: "Trending Repos", href: "/trending-repos" },
  { icon: AlertCircleStrokeRounded, label: "Find Issues", href: "/find-issues" },
  { type: "separator" },
  { icon: DashboardSquare03Icon, label: "Overview", href: "/overview" },
  { icon: GitPullRequestIcon, label: "Pull Requests", href: "/pull-requests" },
  { icon: AlertCircleStrokeRounded, label: "Issues", href: "/issues" },
];

const COLLAPSED = 70;
const EXPANDED = 240;

const iconContainerVariants = cva(
  "absolute top-0 left-0 w-[70px] h-10 flex items-center justify-center pointer-events-none transition-colors",
  {
    variants: {
      isActive: {
        true: "text-gray-900 dark:text-white",
        false: "text-gray-600 dark:text-neutral-500 group-hover:text-gray-900 dark:group-hover:text-neutral-100",
      },
    },
  },
);

const labelVariants = cva(
  "text-sm whitespace-nowrap overflow-hidden pr-2 transition-colors",
  {
    variants: {
      isActive: {
        true: "text-gray-900 dark:text-white",
        false: "text-gray-600 dark:text-neutral-500 group-hover:text-gray-900 dark:group-hover:text-neutral-100",
      },
    },
  },
);

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

// ─── Account Popover ──────────────────────────────────────────────────────────

function AccountPopover({
  open,
  onClose,
  anchorRef,
}: {
  open: boolean;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLDivElement | null>;
}) {
  const { data: session } = authClient.useSession();
  const navigate = useNavigate();
  const popoverRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ bottom: 0, left: 0 });

  const user = session?.user;
  const displayName = user?.name ?? user?.email?.split("@")[0] ?? "User";

  // Calculate position from anchor
  useEffect(() => {
    if (!open || !anchorRef.current) return;
    const rect = anchorRef.current.getBoundingClientRect();
    setPos({
      bottom: window.innerHeight - rect.top + 8,
      left: rect.left + 12,
    });
  }, [open, anchorRef]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        anchorRef.current &&
        !anchorRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open, onClose, anchorRef]);

  async function handleSignOut() {
    onClose();
    await authClient.signOut();
    navigate("/login");
  }

  if (!open) return null;

  return ReactDOM.createPortal(
    <div
      ref={popoverRef}
      className="fixed z-[9999] w-64 bg-card border border-border shadow-2xl overflow-hidden"
      style={{ bottom: pos.bottom, left: pos.left }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <span className="text-sm font-semibold">Account</span>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <X size={14} />
        </button>
      </div>

      {/* Actions */}
      <div className="p-3 space-y-2">
        <Link
          to="/profile"
          onClick={onClose}
          className="flex items-center gap-2.5 w-full px-3 py-2.5 text-sm bg-muted/60 hover:bg-muted transition-colors font-medium"
        >
          <UserCircle2 size={16} />
          View Profile
        </Link>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2.5 w-full px-3 py-2.5 text-sm text-destructive bg-destructive/10 hover:bg-destructive/20 transition-colors font-medium"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>

      {/* User info */}
      <div className="flex items-center gap-3 px-4 py-3 border-t border-border">
        {user?.image ? (
          <img src={user.image} alt={displayName} className="w-9 h-9 rounded-full shrink-0 object-cover" />
        ) : (
          <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-sm font-semibold shrink-0">
            {displayName.slice(0, 2).toUpperCase()}
          </div>
        )}
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-medium truncate">{displayName}</span>
          <span className="text-xs text-muted-foreground truncate">{user?.email}</span>
        </div>
      </div>
    </div>,
    document.body,
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

export default function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const [hovered, setHovered] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const location = useLocation();
  const profileBtnRef = useRef<HTMLDivElement>(null);

  const isExpanded = isOpen || hovered;

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/50 md:hidden backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      <motion.aside
        className={`
          fixed top-0 left-0 z-50
          h-screen
          bg-background border-r border-border
          flex flex-col
          overflow-hidden
          transition-transform duration-300 ease-in-out
          md:translate-x-0
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
        initial={{ width: COLLAPSED }}
        animate={{ width: isExpanded ? EXPANDED : COLLAPSED }}
        transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <header className="flex items-center h-[70px] w-full border-b border-border gap-3">
          <div className="ml-4 mr-4 text-gray-600 dark:text-neutral-500">
            <Logo />
          </div>
        </header>

        <nav className="w-full mt-4 flex-1 overflow-y-auto overflow-x-hidden">
          <div className="flex flex-col gap-1">
            {items.map((item, index) => {
              if ("type" in item) {
                return (
                  <div key={`separator-${index}`} className="py-2 px-2">
                    <Separator />
                  </div>
                );
              }
              const { icon: Icon, label, href } = item as NavItem;
              const isActive = location.pathname === href;

              return (
                <div key={href} className="group relative h-10">
                  <Link
                    to={href}
                    className="block h-10 w-full relative"
                    aria-current={isActive ? "page" : undefined}
                    onClick={() => onClose?.()}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 border ml-4 mr-4 bg-card/80 border-border"
                        transition={{ duration: 0.2 }}
                      />
                    )}
                    <div className={iconContainerVariants({ isActive })}>
                      <Icon className="h-5 w-5 shrink-0" />
                    </div>
                    <motion.div
                      className="absolute top-0 left-14 right-1 h-10 flex items-center pointer-events-none"
                      animate={{ opacity: isExpanded ? 1 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <motion.span className={labelVariants({ isActive })}>
                        {label}
                      </motion.span>
                    </motion.div>
                  </Link>
                </div>
              );
            })}
          </div>
        </nav>

        {/* Bottom: profile + account popover trigger */}
        <div className="mt-auto mb-4 relative" ref={profileBtnRef}>
          <AccountPopover
            open={popoverOpen}
            onClose={() => setPopoverOpen(false)}
            anchorRef={profileBtnRef}
          />

          <div className="group relative h-10">
            <button
              id="account-popover-btn"
              onClick={() => setPopoverOpen((p) => !p)}
              className="block h-10 w-full relative focus:outline-none"
            >
              {location.pathname === "/profile" && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 border ml-4 mr-4 bg-card/80 border-border"
                  transition={{ duration: 0.2 }}
                />
              )}
              <div className={iconContainerVariants({ isActive: location.pathname === "/profile" })}>
                <IconUserCircle className="h-5 w-5 shrink-0" stroke={1} />
              </div>
              <motion.div
                className="absolute top-0 left-14 right-1 h-10 flex items-center pointer-events-none"
                animate={{ opacity: isExpanded ? 1 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <motion.span className={labelVariants({ isActive: location.pathname === "/profile" })}>
                  Profile
                </motion.span>
              </motion.div>
            </button>
          </div>
        </div>
      </motion.aside>
    </>
  );
}
