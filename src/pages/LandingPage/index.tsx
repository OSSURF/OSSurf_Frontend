import { NavBarSection } from "./sections/NavBarSection";
import { HeroSection } from "./sections/HeroSection";
import { FeaturesSection } from "./sections/FeaturesSection";
import { FaqsSection } from "./sections/FaqsSection";

export function LandingPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <NavBarSection />
      <HeroSection />
      <FeaturesSection />
      <FaqsSection />
    </main>
  );
}
