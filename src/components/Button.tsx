import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/utils";
import { type ButtonHTMLAttributes } from "react";

const buttonVariants = cva(
  "px-4 py-1 rounded-lg font-medium font-serif-instrument transition-colors whitespace-nowrap leading-tight cursor-pointer",
  {
    variants: {
      variant: {
        primary:
          "bg-primary border border-border text-primary-foreground hover:bg-primary/90",
        secondary:
          "bg-secondary border border-border text-secondary-foreground hover:bg-secondary/90",
      },
      size: {
        sm: "px-2 py-0.5 text-sm",
        md: "px-3 py-1",
        lg: "px-4 py-1.5 text-lg",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);
type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>;

export function Button({
  variant,
  size,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    >
      {children}
    </button>
  );
}
