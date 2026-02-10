import { Outlet } from "react-router-dom";
import SearchHeader from "../layout/SearchHeader";
import Sidebar from "../layout/Sidebar";

export default function DashboardLayout() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-hidden flex flex-col md:ml-[70px] w-full">
        <SearchHeader searchType="home" onSearch={() => {}} />
        <Outlet />
      </main>
    </div>
  );
}
