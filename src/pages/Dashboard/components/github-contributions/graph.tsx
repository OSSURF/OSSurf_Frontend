"use client";

import dayjs from "dayjs";
import { LoaderIcon } from "lucide-react";
import { useEffect, useState } from "react";

import type { Activity } from "@/components/kibo-ui/contribution-graph";
import {
  ContributionGraph,
  ContributionGraphBlock,
  ContributionGraphCalendar,
  ContributionGraphFooter,
  ContributionGraphLegend,
  ContributionGraphTotalCount,
} from "@/components/kibo-ui/contribution-graph";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type GraphDimensions = {
  blockSize: number;
  blockMargin: number;
  fontSize: number;
};

function getGraphDimensions(width: number): GraphDimensions {
  if (width < 480) {
    return { blockSize: 8, blockMargin: 2, fontSize: 10 };
  }
  if (width < 640) {
    return { blockSize: 9, blockMargin: 2, fontSize: 10 };
  }
  if (width < 768) {
    return { blockSize: 10, blockMargin: 3, fontSize: 11 };
  }
  if (width < 1024) {
    return { blockSize: 12, blockMargin: 3, fontSize: 11 };
  }
  return { blockSize: 14, blockMargin: 4, fontSize: 12 };
}

function useGraphDimensions(): GraphDimensions {
  const [dimensions, setDimensions] = useState<GraphDimensions>(() =>
    typeof window === "undefined"
      ? { blockSize: 14, blockMargin: 4, fontSize: 12 }
      : getGraphDimensions(window.innerWidth),
  );

  useEffect(() => {
    const update = () => setDimensions(getGraphDimensions(window.innerWidth));
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return dimensions;
}

export function GitHubContributionGraph({ data }: { data: Activity[] }) {
  const { blockSize, blockMargin, fontSize } = useGraphDimensions();

  return (
    <TooltipProvider>
      <ContributionGraph
        className="mx-auto w-full max-w-full py-1 sm:py-2"
        data={data}
        blockSize={blockSize}
        blockMargin={blockMargin}
        blockRadius={0}
        fontSize={fontSize}
      >
        <ContributionGraphCalendar
          className="no-scrollbar max-w-full px-1 sm:px-2"
          title="GitHub Contributions"
        >
          {({ activity, dayIndex, weekIndex }) => (
            <Tooltip>
              <TooltipTrigger asChild>
                <g>
                  <ContributionGraphBlock
                    activity={activity}
                    dayIndex={dayIndex}
                    weekIndex={weekIndex}
                  />
                </g>
              </TooltipTrigger>

              <TooltipContent className="font-sans" sideOffset={0}>
                <p>
                  {activity.count} contribution{activity.count > 1 ? "s" : null}{" "}
                  on {dayjs(activity.date).format("DD.MM.YYYY")}
                </p>
              </TooltipContent>
            </Tooltip>
          )}
        </ContributionGraphCalendar>

        <ContributionGraphFooter className="flex-col gap-2 px-1 sm:flex-row sm:px-2 sm:gap-0">
          <ContributionGraphTotalCount>
            {({ totalCount, year }) => (
              <div className="text-muted-foreground text-[10px] sm:text-xs">
                {totalCount.toLocaleString("en")} contributions in {year}
              </div>
            )}
          </ContributionGraphTotalCount>

          <ContributionGraphLegend />
        </ContributionGraphFooter>
      </ContributionGraph>
    </TooltipProvider>
  );
}

export function GitHubContributionFallback() {
  return (
    <div className="flex h-[162px] w-full items-center justify-center">
      <LoaderIcon className="animate-spin text-muted-foreground" />
    </div>
  );
}
