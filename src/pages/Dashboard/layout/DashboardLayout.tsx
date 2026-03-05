import { useState } from "react";
import { Outlet, useLocation, useSearchParams } from "react-router-dom";
import SearchHeader from "../components/SearchHeader";
import Sidebar from "../components/Sidebar";

export default function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const [, setSearchParams] = useSearchParams();

  const getSearchType = () => {
    if (location.pathname === "/trending-repos") return "trending-repos";
    if (location.pathname === "/yc-oss") return "yc-repos";
    if (location.pathname === "/gsoc-orgs") return "gsoc-orgs";
    if (location.pathname === "/find-issues") return "issues";
    if (location.pathname === "/overview") return "overview";
    if (location.pathname === "/profile") return "profile";
    if (location.pathname === "/pull-requests") return "pull-requests";
    return "home";
  };

  const handleSearch = (query: string) => {
    setSearchParams((prev) => {
      if (query.trim()) {
        prev.set("search", query);
      } else {
        prev.delete("search");
      }
      return prev;
    });
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <main className="flex-1 overflow-hidden flex flex-col md:ml-[70px] w-full">
        <SearchHeader
          searchType={getSearchType()}
          onSearch={handleSearch}
          onMenuToggle={() => setIsSidebarOpen(true)}
        />
        <Outlet />
      </main>
    </div>
  );
}
