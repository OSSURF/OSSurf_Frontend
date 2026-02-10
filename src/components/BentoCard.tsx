import type { ReactNode } from "react";
import { cva } from "class-variance-authority";
import { cn } from "../lib/utils";

export type BentoCardProps = {
  title: string;
  description: string;
  details?: string | null;
  visual?: ReactNode | null;
  className?: string;
};

const bentoCardStyles = cva(
  "flex flex-col border border-dashed border-border overflow-hidden h-full",
);

export function BentoCard({
  title,
  description,
  details,
  visual,
  className,
}: BentoCardProps) {
  return (
    <article className={cn(bentoCardStyles(), className)}>
      {visual && (
        <div className="w-full flex items-center justify-center">
          {visual}
        </div>
      )}
      <div
        className={cn(
          "space-y-1 p-6",
          visual && "border-t border-dashed border-border",
        )}
      >
        <h2 className="font-geist text-lg font-semibold">{title}</h2>
        <p className="text-xs sm:text-sm text-muted-foreground">{description}</p>
        {details && (
          <p className="text-xs sm:text-sm text-muted-foreground">{details}</p>
        )}
      </div>
    </article>
  );
}
