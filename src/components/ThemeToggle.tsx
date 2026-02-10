import { Moon, Sun } from "lucide-react";
import { motion } from "motion/react";
import { useTheme } from "./theme-provider";
import { Button } from "./Button";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="secondary"
      size="md"
      className={cn(
        "rounded-full w-8 h-8 p-0 flex items-center justify-center relative border border-border",
        className,
      )}
      onClick={toggleTheme}
      aria-label="Toggle theme"
    >
      <motion.div
        initial={false}
        animate={{
          scale: theme === "dark" ? 0 : 1,
          rotate: theme === "dark" ? -90 : 0,
        }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="absolute"
      >
        <Sun className="size-4.5" />
      </motion.div>
      <motion.div
        initial={false}
        animate={{
          scale: theme === "dark" ? 1 : 0,
          rotate: theme === "dark" ? 0 : 90,
        }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="absolute"
      >
        <Moon className="size-4.5" />
      </motion.div>
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
