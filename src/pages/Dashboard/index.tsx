import { useState } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "./sections/Sidebar";

// Import your new Sections
import DiscoverSection from "./sections/DiscoverSection";
import TrendingReposSection from "./sections/TrendingReposSection";
import YcOssSection from "./sections/YcOssSection";

export default function DashboardPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  let content;
  switch (location.pathname) {
    case "/home":
    case "/discover":
      content = <DiscoverSection />;
      break;

    case "/trending-repos":
      content = <TrendingReposSection />;
      break;

    case "/yc-oss":
      content = <YcOssSection />;
      break;

    case "/gsoc-orgs":
    case "/find-issues":
    case "/overview":
    case "/pull-requests":
    case "/issues":
      content = <DiscoverSection />;
      break;

    default:
      content = <DiscoverSection />;
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
      {content}
    </div>
  );
}
