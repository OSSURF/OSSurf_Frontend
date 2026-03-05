import { useState } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "./components/Sidebar";

// Import your new Sections
import HomePage from "./pages/HomePage";
import TrendingReposPage from "./pages/TrendingReposPage";
import YCPage from "./pages/YCPage";

export default function DashboardPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  let content;
  switch (location.pathname) {
    case "/home":
    case "/discover":
      content = <HomePage />;
      break;

    case "/trending-repos":
      content = <TrendingReposPage />;
      break;

    case "/yc-oss":
      content = <YCPage />;
      break;

    case "/gsoc-orgs":
    case "/find-issues":
    case "/overview":
    case "/pull-requests":
    case "/issues":
      content = <HomePage />;
      break;

    default:
      content = <HomePage />;
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
