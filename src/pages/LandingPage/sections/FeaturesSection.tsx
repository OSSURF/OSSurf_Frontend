import { Container } from "../../../components/container.tsx";
import { Button } from "../../../components/Button.tsx";
import BentoGrid from "../../../components/BentoGrid";

export function FeaturesSection() {
  return (
    <Container className="flex flex-col border-x border-dashed border-border gap-8 items-center pt-8">
      <div className="flex flex-col gap-8 w-full">
        <div className="gap-2 px-6">
            <div className="flex gap-2 px-24 flex-col items-center">
          <Button variant="secondary" size="sm" className="text-xl">
            Features
          </Button>
          <h1 className="text-4xl text-center font-geist text-foreground">
            Powerful tools for open source discovery
          </h1>
          <p className="text-xs sm:text-sm font-geist-mono text-muted-foreground">
            Everything you need to discover, track, and contribute to open
            source faster
          </p>
          </div>
        </div>
        <BentoGrid />
      </div>
    </Container>
  );
}
