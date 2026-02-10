import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import { LandingPage } from "./pages/LandingPage";
import DashboardLayout from "./dashboard/layout/DashboardLayout";
import OverviewPage from "./pages/Overview";
import LoginPage from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import YCPage from "./dashboard/pages/YCPage";
import GsocPage from "./dashboard/pages/GsocPage";
import ReposLayout from "./dashboard/pages/repos/ReposLayout";
import TrendingReposPage from "./dashboard/pages/repos/TrendingReposPage";
import DiscoverReposPage from "./dashboard/pages/repos/DiscoverReposPage";
import IssuesPage from "./dashboard/pages/issues/IssuesPage";
import "./index.css";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Dashboard layout for authenticated pages */}
          <Route element={<DashboardLayout />}>
            <Route path="/home" element={<YCPage />} />
            <Route path="/yc-oss" element={<YCPage />} />
            <Route path="/gsoc-orgs" element={<GsocPage />} />

            {/* Repos with nested layout */}
            <Route element={<ReposLayout />}>
              <Route path="/trending-repos" element={<TrendingReposPage />} />
              <Route path="/discover-repos" element={<DiscoverReposPage />} />
            </Route>

            {/* Issues */}
            <Route path="/find-issues" element={<IssuesPage />} />

            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/overview" element={<OverviewPage />} />
              <Route path="/pull-requests" element={<YCPage />} />
              <Route path="/issues" element={<IssuesPage />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster />
    </>
  );
}

export default App;
