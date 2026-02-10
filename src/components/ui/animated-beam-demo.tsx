"use client";

import React, { forwardRef, useRef } from "react";
import { User } from "lucide-react";

import { cn } from "../../lib/utils";
import { AnimatedBeam } from "./animated-beam";
import {
  GitHubDark,
  GitHubLight,
  TurborepoDark,
  TurborepoLight,
} from "@ridemountainpig/svgl-react";
import { Supabase } from "./svgs/supabase";
import { Vercel } from "./svgs/vercel";
import { VercelDark } from "./svgs/vercelDark";

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

const Circle = forwardRef<
  HTMLDivElement,
  { className?: string; children?: React.ReactNode }
>(({ className, children }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "border-border z-10 flex size-12 items-center justify-center rounded-full border-2 bg-card p-3 text-foreground shadow-[0_0_20px_-12px_rgba(0,0,0,0.8)]",
        className,
      )}
    >
      {children}
    </div>
  );
});

Circle.displayName = "Circle";

export function AnimatedBeamMultipleOutputDemo({
  className,
}: {
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const div1Ref = useRef<HTMLDivElement>(null);
  const div2Ref = useRef<HTMLDivElement>(null);
  const div3Ref = useRef<HTMLDivElement>(null);
  const div4Ref = useRef<HTMLDivElement>(null);
  const div5Ref = useRef<HTMLDivElement>(null);

  const beamColors = {
    pathColor: "var(--border)",
    pathOpacity: 0.35,
    gradientStartColor: "var(--ring)",
    gradientStopColor: "var(--primary)",
  };

  return (
    <div
      className={cn(
        "relative flex h-125 w-full items-center justify-center overflow-hidden p-10",
        className,
      )}
      ref={containerRef}
    >
      <div className="flex size-full max-w-lg flex-row items-stretch justify-between gap-10">
        <div className="flex flex-col justify-center gap-2">
          <Circle ref={div1Ref}>
            <ThemedIcon LightIcon={TurborepoLight} DarkIcon={TurborepoDark} />
          </Circle>
          <Circle ref={div2Ref}>
            <Supabase className="w-full h-full" />
          </Circle>
          <Circle ref={div3Ref}>
            <ThemedIcon LightIcon={Vercel} DarkIcon={VercelDark} />
          </Circle>
        </div>

        <div className="flex flex-col justify-center">
          <Circle ref={div4Ref} className="size-16">
            <ThemedIcon LightIcon={GitHubLight} DarkIcon={GitHubDark} />
          </Circle>
        </div>

        <div className="flex flex-col justify-center">
          <Circle ref={div5Ref}>
            <User className="w-full h-full text-black dark:text-white" />
          </Circle>
        </div>
      </div>

      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div1Ref}
        toRef={div4Ref}
        {...beamColors}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div2Ref}
        toRef={div4Ref}
        {...beamColors}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div3Ref}
        toRef={div4Ref}
        {...beamColors}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div4Ref}
        toRef={div5Ref}
        {...beamColors}
      />
    </div>
  );
}
