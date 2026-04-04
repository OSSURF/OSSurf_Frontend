import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import { LandingPage } from "./pages/LandingPage";
import LoginPage from "./pages/Login";
import DashboardLayout from "./pages/Dashboard/layout/DashboardLayout";
import OverviewPage from "./pages/Dashboard/pages/OverviewPage";
import ProtectedRoute from "./components/ProtectedRoute";
import YCPage from "./pages/Dashboard/pages/YCPage";
import GsocPage from "./pages/Dashboard/pages/GsocPage";
import ReposLayout from "./pages/Dashboard/pages/ReposLayout";
import TrendingReposPage from "./pages/Dashboard/pages/TrendingReposPage";
import HomePage from "./pages/Dashboard/pages/HomePage";
import IssuesPage from "./pages/Dashboard/pages/IssuesPage";
import ProfilePage from "./pages/Dashboard/pages/ProfilePage";
import TrackedPRsPage from "./pages/Dashboard/pages/TrackedPRsPage";
import TrackedIssuesPage from "./pages/Dashboard/pages/TrackedIssuesPage";
import "./index.css";

import ContributorsPage from "./pages/ContributorsPage";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Contributors Ranking Page */}
          <Route path="/contributors" element={<ContributorsPage />} />

          {/* Dashboard layout for authenticated pages */}
          <Route element={<DashboardLayout />}>
            <Route path="/yc-oss" element={<YCPage />} />
            <Route path="/gsoc-orgs" element={<GsocPage />} />
            <Route path="/discover" element={<Navigate to="/home" replace />} />

            {/* Repos with nested layout */}
            <Route element={<ReposLayout />}>
              <Route path="/home" element={<HomePage />} />
              <Route path="/trending-repos" element={<TrendingReposPage />} />
              <Route
                path="/discover-repos"
                element={<Navigate to="/home" replace />}
              />
            </Route>

            {/* Issues */}
            <Route path="/find-issues" element={<IssuesPage />} />
            <Route path="/profile" element={<ProfilePage />} />

            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/overview" element={<OverviewPage />} />
              <Route path="/pull-requests" element={<TrackedPRsPage />} />
              <Route path="/issues" element={<TrackedIssuesPage />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster />
    </>
  );
}

export default App;
