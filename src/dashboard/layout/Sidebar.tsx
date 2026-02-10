"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cva } from "class-variance-authority";
import type { IconProps } from "@tabler/icons-react";
import { Link, useLocation } from "react-router-dom";
import Logo from "@/components/Logo";
import { Separator } from "@/components/ui/separator";

import Home05Icon from "@/components/ui/svgs/home-05-stroke-rounded";
import Airpod01Icon from "@/components/ui/svgs/airpod-01-stroke-rounded";
import Book02Icon from "@/components/ui/svgs/book-02-stroke-rounded";
import AnalyticsUpIcon from "@/components/ui/svgs/analytics-up-stroke-rounded";
import GitPullRequestIcon from "@/components/ui/svgs/git-pull-request-stroke-rounded";
import Bug02Icon from "@/components/ui/svgs/bug-02-stroke-rounded";
import DashboardSquare03Icon from "@/components/ui/svgs/dashboard-square-03-stroke-rounded";
import AlertCircleStrokeRounded from "@/components/ui/svgs/AlertCircleStrokeRounded";

interface NavItem {
  icon: React.ComponentType<any>;
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
  {
    icon: DashboardSquare03Icon,
    label: "Discover Repos",
    href: "/discover-repos",
  },
  {
    icon: AlertCircleStrokeRounded,
    label: "Find Issues",
    href: "/find-issues",
  },
  { type: "separator" },
  { icon: DashboardSquare03Icon, label: "Overview", href: "/overview" },
  { icon: GitPullRequestIcon, label: "Pull Requests", href: "/pull-requests" },
  { icon: Bug02Icon, label: "Issues", href: "/issues" },
];

const COLLAPSED = 70;
const EXPANDED = 240;

const iconContainerVariants = cva(
  "absolute top-0 left-0 w-[70px] h-10 flex items-center justify-center pointer-events-none transition-colors",
  {
    variants: {
      isActive: {
        true: "text-gray-900 dark:text-white",
        false:
          "text-gray-600 dark:text-neutral-500 group-hover:text-gray-900 dark:group-hover:text-neutral-100",
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
        false:
          "text-gray-600 dark:text-neutral-500 group-hover:text-gray-900 dark:group-hover:text-neutral-100",
      },
    },
  },
);

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const [hovered, setHovered] = useState(false);
  const location = useLocation();

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
        <header className="flex items-center justify-start h-[70px] w-full border-b border-border gap-3">
          <div className="ml-4 mr-4 text-gray-600 dark:text-neutral-500">
            <Logo />
          </div>
        </header>

        <nav className="w-full mt-4 flex-1 overflow-y-auto overflow-x-hidden">
          <div className="flex flex-col gap-1">
            {items.map((item, index) => {
              if ("type" in item && item.type === "separator") {
                return (
                  <div key={`separator-${index}`} className="py-2 px-2">
                    <Separator />
                  </div>
                );
              }

              const navItem = item as NavItem;
              const Icon = navItem.icon as React.ComponentType<
                React.SVGProps<SVGSVGElement> | IconProps
              >;
              const isActive = location.pathname === navItem.href;

              return (
                <div key={navItem.href} className="group relative h-10">
                  <Link
                    to={navItem.href}
                    className="block h-10 w-full relative"
                    aria-current={isActive ? "page" : undefined}
                    onClick={() => onClose?.()}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 border ml-4 mr-4 bg-card border-border"
                        transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                      />
                    )}

                    <div className={iconContainerVariants({ isActive })}>
                      <Icon className="h-5 w-5 shrink-0" />
                    </div>

                    <motion.div
                      className="absolute top-0 left-14 right-1 h-10 flex items-center pointer-events-none"
                      animate={{
                        opacity: isExpanded ? 1 : 0,
                      }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                    >
                      <motion.span className={labelVariants({ isActive })}>
                        {navItem.label}
                      </motion.span>
                    </motion.div>
                  </Link>
                </div>
              );
            })}
          </div>
        </nav>
      </motion.aside>
    </>
  );
}
