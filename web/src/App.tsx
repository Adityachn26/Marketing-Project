import { Route, Routes, Navigate, useLocation } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./authContext";
import { LoginPage } from "./pages/LoginPage";
import { ExecutiveOverviewPage } from "./pages/ExecutiveOverviewPage";
import { ChannelAnalyticsPage } from "./pages/ChannelAnalyticsPage";
import { FunnelViewPage } from "./pages/FunnelViewPage";
import { AttributionStudioPage } from "./pages/AttributionStudioPage";
import { SettingsPage } from "./pages/SettingsPage";
import { BudgetSimulatorPage } from "./pages/BudgetSimulatorPage";
import { CampaignRankingPage } from "./pages/CampaignRankingPage";
import { MultiTouchAttributionPage } from "./pages/MultiTouchAttributionPage";
import { CustomerJourneyPathsPage } from "./pages/CustomerJourneyPathsPage";
import { BudgetRecommendationEnginePage } from "./pages/BudgetRecommendationEnginePage";
import { CohortAnalysisPage } from "./pages/CohortAnalysisPage";
import { ForecastingPage } from "./pages/ForecastingPage";
import { Sidebar } from "./components/Sidebar";
import { TopBar } from "./components/TopBar";
import { Footer } from "./components/Footer";
import { IntroScreen } from "./components/IntroScreen";
import { Scene3DBackground } from "./components/Scene3DBackground";
import { clsx } from "clsx";

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <>{children}</>;
}

function DashboardLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showIntro, setShowIntro] = useState(() => {
    // Only show intro once per session
    return !sessionStorage.getItem("mproject.introSeen");
  });

  const handleIntroComplete = useCallback(() => {
    setShowIntro(false);
    sessionStorage.setItem("mproject.introSeen", "1");
  }, []);

  return (
    <>
      {/* 3D Intro Screen */}
      {showIntro && <IntroScreen onComplete={handleIntroComplete} />}

      <div className="min-h-screen flex bg-surface-50 dark:bg-surface-950 transition-colors duration-300 perspective-container">
        {/* Ambient 3D background */}
        <Scene3DBackground />

        {/* Sidebar with 3D depth */}
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        {/* Main content area */}
        <div
          className={clsx(
            "flex-1 flex flex-col min-h-screen transition-all duration-300 relative z-10",
            sidebarCollapsed ? "ml-[72px]" : "ml-64"
          )}
        >
          <TopBar
            sidebarCollapsed={sidebarCollapsed}
            onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
          />

          <main className="flex-1 px-6 py-6 lg:px-8 lg:py-8 max-w-[1400px] w-full mx-auto page-3d-enter">
            <Routes>
              <Route path="/" element={<ExecutiveOverviewPage />} />
              <Route path="/channels" element={<ChannelAnalyticsPage />} />
              <Route path="/funnel" element={<FunnelViewPage />} />
              <Route path="/attribution" element={<AttributionStudioPage />} />
              <Route path="/simulator" element={<BudgetSimulatorPage />} />
              <Route path="/rankings" element={<CampaignRankingPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/multi-attribution" element={<MultiTouchAttributionPage />} />
              <Route path="/journeys" element={<CustomerJourneyPathsPage />} />
              <Route path="/budget-engine" element={<BudgetRecommendationEnginePage />} />
              <Route path="/cohorts" element={<CohortAnalysisPage />} />
              <Route path="/forecast" element={<ForecastingPage />} />
            </Routes>
          </main>

          <Footer />
        </div>
      </div>
    </>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/*"
        element={
          <RequireAuth>
            <DashboardLayout />
          </RequireAuth>
        }
      />
    </Routes>
  );
}
