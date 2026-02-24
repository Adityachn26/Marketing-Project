import { NavLink, Route, Routes } from "react-router-dom";
import { ExecutiveOverviewPage } from "./pages/ExecutiveOverviewPage";
import { ChannelAnalyticsPage } from "./pages/ChannelAnalyticsPage";
import { FunnelViewPage } from "./pages/FunnelViewPage";
import { AttributionStudioPage } from "./pages/AttributionStudioPage";

const navItemClasses =
  "px-3 py-2 rounded-md text-sm font-medium hover:bg-slate-800/60 transition-colors";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
          <div className="font-semibold text-lg">Marketing Analytics</div>
          <nav className="flex gap-2">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `${navItemClasses} ${isActive ? "bg-slate-700" : "text-slate-200"}`
              }
            >
              Executive
            </NavLink>
            <NavLink
              to="/channels"
              className={({ isActive }) =>
                `${navItemClasses} ${isActive ? "bg-slate-700" : "text-slate-200"}`
              }
            >
              Channels
            </NavLink>
            <NavLink
              to="/funnel"
              className={({ isActive }) =>
                `${navItemClasses} ${isActive ? "bg-slate-700" : "text-slate-200"}`
              }
            >
              Funnel
            </NavLink>
            <NavLink
              to="/attribution"
              className={({ isActive }) =>
                `${navItemClasses} ${isActive ? "bg-slate-700" : "text-slate-200"}`
              }
            >
              Attribution
            </NavLink>
          </nav>
        </div>
      </header>
      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-6">
        <Routes>
          <Route path="/" element={<ExecutiveOverviewPage />} />
          <Route path="/channels" element={<ChannelAnalyticsPage />} />
          <Route path="/funnel" element={<FunnelViewPage />} />
          <Route path="/attribution" element={<AttributionStudioPage />} />
        </Routes>
      </main>
    </div>
  );
}

