import { Container } from "../../../components/container";
import { Button } from "../../../components/Button";
import { ArrowRight } from "@phosphor-icons/react";
import { GitHubDark, GitHubLight } from "@ridemountainpig/svgl-react";
import { useNavigate } from "react-router-dom";

export function HeroSection() {
  const navigate = useNavigate();
  const handleGetStarted = () => {
    navigate("/home");
  };

  const handleOpenSource = () => {
    console.log("Open Source clicked");
    // Add your GitHub link or navigation here
    window.open("https://github.com", "_blank");
  };

  return (
    <Container>
      <div className="relative border-b border-x border-border border-dashed py-12 sm:py-42 flex flex-col gap-8 lg:flex-row lg:items-center overflow-hidden">
        {/* Light Mode Image */}
        <img
          src="/assets/Hero2.png"
          alt="OSS dashboard"
          className="absolute inset-0 w-full h-full object-cover hidden md:block dark:hidden brightness-110"
        />
        {/* Dark Mode Image */}
        <img
          src="/assets/Hero.png"
          alt="OSS dashboard"
          className="absolute inset-0 w-full h-full object-cover hidden dark:md:block"
        />
        
        <div className="w-full md:w-1/2 relative z-10 flex items-center justify-center">
          <div className="max-w-xl px-6 text-center md:text-left">
            <h1 className="text-3xl sm:text-4xl md:text-4xl lg:text-4xl font-serif-instrument leading-tight text-foreground">
              Surface OSS in{" "}
              <span className="font-serif-instrument-italic text-muted-foreground">seconds</span>.
              Not in{" "}
              <span className="font-serif-instrument-italic text-muted-foreground">minutes</span>.
            </h1>
            <p className="mt-3 text-xs lg:text-sm font-geist-mono max-w-xl text-muted-foreground">
              Discover OSS faster with focused context. Find the right projects
              and manage PRs and issues in one workspace.
            </p>
            <div className="flex gap-3 mt-6 justify-center md:justify-start">
              <Button
                variant="primary"
                size="md"
                className="flex items-center gap-2"
                onClick={handleGetStarted}
              >
                <span>Get Started</span>
                <ArrowRight size={16} />
              </Button>
              <Button
                variant="secondary"
                size="md"
                className="flex items-center gap-2 px-4"
                onClick={handleOpenSource}
              >
                <span>Open Source</span>
                {/* Light Mode Icon */}
                <GitHubLight className="size-4 dark:hidden text-gray-900" />
                {/* Dark Mode Icon */}
                <GitHubDark className="size-4 hidden dark:block text-white" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}
