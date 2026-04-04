import { Slot as SlotPrimitive } from "radix-ui";
import React from "react";

const Slot = SlotPrimitive.Slot;

import { cn } from "@/lib/utils";

type PanelProps = React.ComponentProps<"section"> & {
  topBorder?: boolean;
  bottomBorder?: boolean;
};

function Panel({
  className,
  children,
  topBorder = true,
  bottomBorder = true,
  ...props
}: PanelProps) {
  return (
    <section
      data-slot="panel"
      className={cn("relative", className)}
      style={{
        backgroundImage: "repeating-linear-gradient(to bottom, var(--dash-border) 0px, var(--dash-border) 6px, transparent 6px, transparent 14px), repeating-linear-gradient(to bottom, var(--dash-border) 0px, var(--dash-border) 6px, transparent 6px, transparent 14px)",
        backgroundSize: "1px 100%, 1px 100%",
        backgroundPosition: "left top, right top",
        backgroundRepeat: "no-repeat"
      }}
      {...props}
    >
      {topBorder && (
        <div
          className="pointer-events-none absolute top-0 left-[-1000px] right-[-1000px] h-px z-0"
          style={{
            backgroundImage:
              "repeating-linear-gradient(to right, var(--dash-border) 0px, var(--dash-border) 6px, transparent 6px, transparent 14px)",
            backgroundSize: "100% 1px",
            backgroundRepeat: "no-repeat",
          }}
        />
      )}
      {children}
      {bottomBorder && (
        <div
          className="pointer-events-none absolute bottom-0 left-[-1000px] right-[-1000px] h-px z-0"
          style={{
            backgroundImage:
              "repeating-linear-gradient(to right, var(--dash-border) 0px, var(--dash-border) 6px, transparent 6px, transparent 14px)",
            backgroundSize: "100% 1px",
            backgroundRepeat: "no-repeat",
          }}
        />
      )}
    </section>
  );
}

function PanelHeader({ className, children, ...props }: React.ComponentProps<"header">) {
  return (
    <header
      data-slot="panel-header"
      className={cn("relative px-2 py-2", className)}
      {...props}
    >
      {children}
      <div className="pointer-events-none absolute bottom-0 left-[-1000px] right-[-1000px] h-px z-0" style={{ backgroundImage: "repeating-linear-gradient(to right, var(--dash-border) 0px, var(--dash-border) 6px, transparent 6px, transparent 14px)", backgroundSize: "100% 1px", backgroundRepeat: "no-repeat" }} />
    </header>
  );
}

function PanelTitle({
  className,
  asChild = false,
  ...props
}: React.ComponentProps<"h2"> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "h2";

  return (
    <Comp
      data-slot="panel-title"
      className={cn("text-[1.15rem] font-bold leading-tight text-title", className)}
      {...props}
    />
  );
}

function PanelContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="panel-body" className={cn("p-4", className)} {...props} />
  );
}

export { Panel, PanelContent, PanelHeader, PanelTitle };
