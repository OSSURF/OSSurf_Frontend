export interface Activity {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

const LEVEL_COLORS: Record<number, string> = {
  0: "bg-muted/40 dark:bg-muted/20",
  1: "bg-green-200 dark:bg-green-900",
  2: "bg-green-300 dark:bg-green-700",
  3: "bg-green-500 dark:bg-green-500",
  4: "bg-green-700 dark:bg-green-300",
};

function groupByWeeks(data: Activity[]): (Activity | null)[][] {
  if (!data.length) return [];
  const sorted = [...data].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );
  const first = new Date(sorted[0].date);
  const startDow = first.getDay(); // 0 = Sun

  const weeks: (Activity | null)[][] = [];
  let week: (Activity | null)[] = Array(startDow).fill(null);

  for (const activity of sorted) {
    week.push(activity);
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }
  if (week.length > 0) {
    while (week.length < 7) week.push(null);
    weeks.push(week);
  }
  return weeks;
}

const MONTH_LABELS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export function GitHubContributionGraph({ data }: { data: Activity[] }) {
  const weeks = groupByWeeks(data);

  // Build month label positions
  const monthLabels: { label: string; col: number }[] = [];
  let lastMonth = -1;
  weeks.forEach((week, col) => {
    const firstReal = week.find((d) => d !== null);
    if (firstReal) {
      const m = new Date(firstReal.date).getMonth();
      if (m !== lastMonth) {
        monthLabels.push({ label: MONTH_LABELS[m], col });
        lastMonth = m;
      }
    }
  });

  const totalContributions = data.reduce((sum, d) => sum + d.count, 0);

  return (
    <div className="flex flex-col gap-2 select-none">
      <div className="flex items-center justify-between mb-1 px-0.5">
        <span className="text-xs text-muted-foreground font-medium">
          {totalContributions.toLocaleString()} contributions in the last year
        </span>
      </div>

      {/* Month labels */}
      <div className="flex gap-[3px]" style={{ paddingLeft: 0 }}>
        {weeks.map((_, col) => {
          const label = monthLabels.find((m) => m.col === col);
          return (
            <div key={col} className="w-[11px] flex-shrink-0">
              {label ? (
                <span className="text-[9px] text-muted-foreground leading-none whitespace-nowrap">
                  {label.label}
                </span>
              ) : null}
            </div>
          );
        })}
      </div>

      {/* Grid */}
      <div className="flex gap-[3px]">
        {weeks.map((week, col) => (
          <div key={col} className="flex flex-col gap-[3px]">
            {week.map((day, row) =>
              day === null ? (
                <div key={row} className="w-[11px] h-[11px]" />
              ) : (
                <div
                  key={row}
                  title={`${day.date}: ${day.count} contribution${day.count !== 1 ? "s" : ""}`}
                  className={`w-[11px] h-[11px] rounded-sm ${LEVEL_COLORS[day.level]}`}
                />
              ),
            )}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-1 justify-end mt-0.5">
        <span className="text-[9px] text-muted-foreground">Less</span>
        {[0, 1, 2, 3, 4].map((l) => (
          <div key={l} className={`w-[11px] h-[11px] rounded-sm ${LEVEL_COLORS[l]}`} />
        ))}
        <span className="text-[9px] text-muted-foreground">More</span>
      </div>
    </div>
  );
}

export function GitHubContributionFallback() {
  return (
    <div className="w-full h-24 flex items-center justify-center text-xs text-muted-foreground">
      No contribution data available
    </div>
  );
}
