import { Container } from "./container";
import { Button } from "./Button";
import { ArrowRight } from "@phosphor-icons/react";
import { GitHubDark, GitHubLight } from "@ridemountainpig/svgl-react";
import { cva } from "class-variance-authority";
import { useTheme } from "./theme-provider";
import { useNavigate } from "react-router-dom";

const heroImageVariants = cva(
  "absolute inset-0 w-full h-full object-cover hidden md:block",
  {
    variants: {
      theme: {
        light: "",
        dark: "",
      },
    },
    compoundVariants: [
      {
        theme: "light",
        className: "brightness-110",
      },
    ],
  },
);

const heroTextVariants = cva(
  "text-3xl sm:text-4xl md:text-4xl lg:text-5xl  font-serif-instrument leading-tight",
  {
    variants: {
      theme: {
        light: "text-gray-900",
        dark: "text-neutral-500",
      },
    },
  },
);

const heroAccentVariants = cva("font-serif-instrument-italic", {
  variants: {
    theme: {
      light: "text-neutral-600",
      dark: "text-foreground",
    },
  },
});

const heroParagraphVariants = cva(
  "mt-3 text-xs lg:text-sm font-geist-mono max-w-xl",
  {
    variants: {
      theme: {
        light: "text-gray-700",
        dark: "text-neutral-400",
      },
    },
  },
);

const heroImages = {
  light: "/assets/Hero2.png",
  dark: "/assets/Hero.png",
};

export function Hero() {
  const { theme } = useTheme();
  const navigate = useNavigate();

  return (
    <Container>
      <div className="relative border-b border-x border-border border-dashed py-12 sm:py-42 flex flex-col gap-8 lg:flex-row lg:items-center  overflow-hidden">
        <img
          src={heroImages[theme]}
          alt="OSS dashboard"
          className={heroImageVariants({ theme })}
        />
        <div className="w-full md:w-1/2 relative z-10 flex items-center justify-center">
          <div className="max-w-xl px-6 text-center md:text-left">
            <h1 className={heroTextVariants({ theme })}>
              Surface OSS in{" "}
              <span className={heroAccentVariants({ theme })}>seconds</span>.
              Not in{" "}
              <span className={heroAccentVariants({ theme })}>minutes</span>.
            </h1>
            <p className={heroParagraphVariants({ theme })}>
              Discover OSS faster with focused context. Find the right projects
              and manage PRs and issues in one workspace.
            </p>
            <div className="flex gap-3 mt-6 justify-center md:justify-start">
              <Button
                type="button"
                variant="primary"
                size="md"
                className="flex items-center gap-2"
                onClick={() => navigate("/home")}
              >
                <span>Get Started</span>
                <ArrowRight size={16} />
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="md"
                className="flex items-center gap-2"
                onClick={() =>
                  window.open(
                    "https://github.com/faizshaikh17/ossean",
                    "_blank",
                    "noopener,noreferrer",
                  )
                }
              >
                <span>Open Source</span>
                <GitHubDark className="size-4 hidden dark:block" />
                <GitHubLight className="size-4 dark:hidden" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}
