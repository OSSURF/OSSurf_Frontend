import { BentoCard, type BentoCardProps } from "./BentoCard";
import { OrbitingCircles } from "./ui/orbiting-circles";
import { Supabase } from "./ui/svgs/supabase";
import { Redis } from "./ui/svgs/redis";
import { Vercel } from "./ui/svgs/vercel";
import { VercelDark } from "./ui/svgs/vercelDark";
import { ClerkIconLight } from "./ui/svgs/clerkIconLight";
import { ClerkIconDark } from "./ui/svgs/clerkIconDark";
import {
  GitHubDark,
  GitHubLight,
  TurborepoDark,
  TurborepoLight,
} from "@ridemountainpig/svgl-react";
import { AnimatedList } from "./ui/animated-list";
import { DottedMap } from "./ui/dotted-map";
import { AnimatedBeamMultipleOutputDemo } from "./ui/animated-beam-demo";
import { cn } from "../lib/utils";
import { FileCode, GitMerge, GitPullRequest } from "lucide-react";

const ThemedIcon = ({
  LightIcon,
  DarkIcon,
}: {
  LightIcon: React.ComponentType<{ className?: string }>;
  DarkIcon: React.ComponentType<{ className?: string }>;
}) => (
  <>
    <LightIcon className="w-full h-full dark:hidden" />
    <DarkIcon className="w-full h-full hidden dark:block" />
  </>
);

interface Item {
  name: string;
  description: string;
  icon: string;
  color: string;
  time: string;
}

let notifications = [
  {
    name: "PR #124",
    description: "Fix: Authentication flow",
    time: "2m ago",

    icon: "pull_request",
    color: "var(--color-chart-1)",
  },
  {
    name: "PR #125",
    description: "Feat: Add dark mode toggle",
    time: "5m ago",
    icon: "file_code",
    color: "var(--color-chart-2)",
  },
  {
    name: "PR #126",
    description: "Chore: Update dependencies",
    time: "10m ago",
    icon: "merge",
    color: "var(--color-chart-3)",
  },
  {
    name: "PR #127",
    description: "Refactor: User component",
    time: "15m ago",
    icon: "pull_request",
    color: "var(--color-chart-4)",
  },
];

notifications = Array.from({ length: 4 }, () => notifications).flat();

const item = {
  pull_request: <GitPullRequest className="h-4 w-4" />,
  file_code: <FileCode className="h-4 w-4" />,
  merge: <GitMerge className="h-4 w-4" />,
};

const Notification = ({ name, description, icon, color, time }: Item) => {
  return (
    <figure
      className={cn(
        "relative mx-auto min-h-fit w-full max-w-100 cursor-pointer overflow-hidden p-4",
        // animation styles
        "transition-all duration-200 ease-in-out",
        // minimal styles
        "bg-[#f5f5f5] dark:bg-[#0e0e10] border border-border",
      )}
    >
      <div className="flex flex-row items-center gap-3">
        <div
          className="flex size-10 items-center justify-center rounded-none"
          style={{
            backgroundColor: color,
          }}
        >
          <span className="text-lg text-white">
            {item[icon as keyof typeof item]}
          </span>
        </div>
        <div className="flex flex-col overflow-hidden">
          <figcaption className="flex flex-row items-center whitespace-pre text-lg font-medium text-card-foreground">
            <span className="text-sm sm:text-lg">{name}</span>
            <span className="mx-1">·</span>
            <span className="text-xs text-muted-foreground">{time}</span>
          </figcaption>
          <p className="text-sm font-normal text-muted-foreground">
            {description}
          </p>
        </div>
      </div>
    </figure>
  );
};

const markers = [
  {
    lat: 40.7128,
    lng: -74.006,
    size: 0.3,
  }, // New York
  {
    lat: 34.0522,
    lng: -118.2437,
    size: 0.3,
  }, // Los Angeles
  {
    lat: 51.5074,
    lng: -0.1278,
    size: 0.3,
  }, // London
  {
    lat: -33.8688,
    lng: 151.2093,
    size: 0.3,
  }, // Sydney
  {
    lat: 48.8566,
    lng: 2.3522,
    size: 0.3,
  }, // Paris
  {
    lat: 35.6762,
    lng: 139.6503,
    size: 0.3,
  }, // Tokyo
  {
    lat: 55.7558,
    lng: 37.6176,
    size: 0.3,
  }, // Moscow
  {
    lat: 39.9042,
    lng: 116.4074,
    size: 0.3,
  }, // Beijing
  {
    lat: 28.6139,
    lng: 77.209,
    size: 0.3,
  }, // New Delhi
  {
    lat: -23.5505,
    lng: -46.6333,
    size: 0.3,
  }, // São Paulo
  {
    lat: 1.3521,
    lng: 103.8198,
    size: 0.3,
  }, // Singapore
  {
    lat: 25.2048,
    lng: 55.2708,
    size: 0.3,
  }, // Dubai
  {
    lat: 52.52,
    lng: 13.405,
    size: 0.3,
  }, // Berlin
  {
    lat: 19.4326,
    lng: -99.1332,
    size: 0.3,
  }, // Mexico City
  {
    lat: -26.2041,
    lng: 28.0473,
    size: 0.3,
  }, // Johannesburg
];

const bentoGridData: BentoCardProps[] = [
  {
    title: "Trending Feed",
    description:
      "Discover open source software that is currently trending and gaining popularity among the developer community.",
    visual: (
      <div className="relative flex h-60 w-full items-center justify-center overflow-hidden">
        <div className="relative h-56 w-56 z-10">
          <OrbitingCircles radius={60} iconSize={30}>
            <ThemedIcon LightIcon={GitHubLight} DarkIcon={GitHubDark} />
            <ThemedIcon LightIcon={TurborepoLight} DarkIcon={TurborepoDark} />
            <Supabase className="w-full h-full" />
          </OrbitingCircles>
          <OrbitingCircles radius={100} iconSize={30} speed={0.8} reverse>
            <ThemedIcon LightIcon={Vercel} DarkIcon={VercelDark} />
            <ThemedIcon LightIcon={ClerkIconLight} DarkIcon={ClerkIconDark} />
            <Redis className="w-full h-full" />
          </OrbitingCircles>
        </div>
        <div className="absolute inset-0 pointer-events-none z-20" />
      </div>
    ),
  },
  {
    title: "Real-time Management",
    description:
      "Effortlessly manage all your pull requests, issues, and contributions in a single, unified dashboard for maximum productivity.",
    visual: (
      <div className="relative h-60 w-full overflow-hidden">
        <AnimatedList
          className="w-full h-full scale-75 origin-top"
          scaleFactor={0.02}
        >
          {notifications.map((item, idx) => (
            <Notification key={idx} {...item} />
          ))}
        </AnimatedList>
        <div className="absolute inset-0 bg-radial from-transparent to-background to-90% pointer-events-none z-10" />
      </div>
    ),
  },
  {
    title: "Discover & Contribute",
    description:
      "Browse trending repos, find good-first-issues, explore GSoC orgs, and connect with the OSS community.",
    visual: (
      <div className="relative h-60 w-full overflow-hidden flex items-center justify-center">
        <AnimatedBeamMultipleOutputDemo />
        <div className="absolute inset-0  pointer-events-none z-10" />
      </div>
    ),
  },
  {
    title: "GSoC Integration",
    description:
      "Explore and connect with open source projects and organizations that are actively participating in Google Summer of Code.",
    visual: (
      <div className="relative h-60 w-full overflow-hidden">
        <div className="absolute inset-0 bg-radial from-transparent to-background to-90% pointer-events-none z-10" />
        <DottedMap markers={markers} />
      </div>
    ),
  },
];
export default function BentoGrid() {
  return (
    <div className="relative overflow-hidden flex">
      <div className="wall hidden sm:block w-full max-w-6 border-y border-dashed border-border bg-[repeating-linear-gradient(45deg,transparent,transparent_5px,var(--color-border)_5px,var(--color-border)_6px)]"></div>
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2">
        {bentoGridData.map((item, index) => (
          <BentoCard key={index} {...item} />
        ))}
      </div>
      <div className="wall hidden sm:block w-full max-w-6 border-y border-dashed border-border bg-[repeating-linear-gradient(45deg,transparent,transparent_5px,var(--color-border)_5px,var(--color-border)_6px)]"></div>
    </div>
  );
}
